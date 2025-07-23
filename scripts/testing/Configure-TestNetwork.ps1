# 测试网络配置工具

此脚本用于配置TCP/Socket协议适配器实际设备测试的网络环境。
适用于Windows Server 2025和Windows 11环境。

.SYNOPSIS
配置TCP/Socket协议适配器测试的专用网络环境。

.DESCRIPTION
此脚本执行以下操作：
1. 配置测试网卡的IP地址和子网掩码
2. 设置防火墙规则，允许测试设备通信
3. 创建虚拟网络隔离环境（可选）
4. 配置网络监控
5. 测试网络连接性

.PARAMETER NetworkAdapter
要配置的网络适配器名称，默认为"以太网"

.PARAMETER TestSubnet
测试子网，默认为"192.168.1.0/24"

.PARAMETER ServerIP
测试服务器IP地址，默认为"192.168.1.10"

.PARAMETER CreateVirtualNetwork
是否创建虚拟测试网络，默认为$false

.EXAMPLE
.\Configure-TestNetwork.ps1 -NetworkAdapter "测试网卡" -TestSubnet "192.168.2.0/24" -ServerIP "192.168.2.10"

#>

param (
    [string]$NetworkAdapter = "以太网",
    [string]$TestSubnet = "192.168.1.0/24",
    [string]$ServerIP = "192.168.1.10",
    [bool]$CreateVirtualNetwork = $false
)

# 设置错误操作首选项
$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-AdminPrivileges {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if (-not $isAdmin) {
        Write-ColorOutput Red "此脚本需要管理员权限运行。请以管理员身份重新运行PowerShell。"
        exit 1
    }
}

function Configure-NetworkAdapter {
    param (
        [string]$AdapterName,
        [string]$IPAddress,
        [string]$SubnetMask = "255.255.255.0"
    )

    Write-ColorOutput Cyan "正在配置网络适配器 '$AdapterName'..."

    try {
        # 检查网络适配器是否存在
        $adapter = Get-NetAdapter | Where-Object { $_.Name -eq $AdapterName }

        if ($null -eq $adapter) {
            Write-ColorOutput Yellow "警告: 未找到名为 '$AdapterName' 的网络适配器，尝试列出可用适配器..."
            $availableAdapters = Get-NetAdapter | Select-Object Name, Status
            Write-ColorOutput Cyan "可用的网络适配器:"
            $availableAdapters | Format-Table -AutoSize

            $selectedIndex = 0
            if ($availableAdapters.Count -gt 1) {
                Write-ColorOutput Yellow "请选择要使用的网络适配器 (0-$($availableAdapters.Count - 1)):"
                for ($i = 0; $i -lt $availableAdapters.Count; $i++) {
                    Write-ColorOutput White "$i. $($availableAdapters[$i].Name) - $($availableAdapters[$i].Status)"
                }

                $selectedIndex = Read-Host "请输入选择的编号"
                $selectedIndex = [int]$selectedIndex
            }

            $AdapterName = $availableAdapters[$selectedIndex].Name
            $adapter = Get-NetAdapter | Where-Object { $_.Name -eq $AdapterName }

            Write-ColorOutput Green "已选择网络适配器: $AdapterName"
        }

        # 移除现有IP配置
        $interfaceIndex = $adapter.ifIndex
        Remove-NetIPAddress -InterfaceIndex $interfaceIndex -Confirm:$false -ErrorAction SilentlyContinue

        # 设置新的IP地址
        New-NetIPAddress -InterfaceIndex $interfaceIndex -IPAddress $IPAddress -PrefixLength 24 | Out-Null

        Write-ColorOutput Green "网络适配器配置完成。IP地址: $IPAddress, 子网掩码: $SubnetMask"
    }
    catch {
        Write-ColorOutput Red "配置网络适配器时出错: $_"
        exit 1
    }
}

function Configure-FirewallRules {
    param (
        [string]$RuleName = "TCP_Socket_Adapter_Test",
        [array]$Ports = @(5001, 5002, 5003, 5005, 502) # 测试设备端口
    )

    Write-ColorOutput Cyan "正在配置防火墙规则..."

    try {
        # 移除现有规则（如果存在）
        Remove-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue

        # 创建新的入站规则
        New-NetFirewallRule -DisplayName $RuleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Ports | Out-Null

        # 创建新的出站规则
        New-NetFirewallRule -DisplayName "$RuleName-Outbound" -Direction Outbound -Action Allow -Protocol TCP -LocalPort $Ports | Out-Null

        Write-ColorOutput Green "防火墙规则配置完成。允许端口: $($Ports -join ', ')"
    }
    catch {
        Write-ColorOutput Red "配置防火墙规则时出错: $_"
        exit 1
    }
}

function Create-VirtualTestNetwork {
    Write-ColorOutput Cyan "正在创建虚拟测试网络..."

    try {
        # 检查Hyper-V功能是否已启用
        $hyperv = Get-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V -Online

        if ($hyperv.State -ne "Enabled") {
            Write-ColorOutput Yellow "Hyper-V功能未启用，正在启用..."
            Enable-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V -Online -NoRestart
            Write-ColorOutput Yellow "请重启计算机以完成Hyper-V安装，然后重新运行此脚本。"
            exit 0
        }

        # 创建虚拟交换机
        $switchName = "TestNetSwitch"
        $existingSwitch = Get-VMSwitch -Name $switchName -ErrorAction SilentlyContinue

        if ($null -eq $existingSwitch) {
            New-VMSwitch -Name $switchName -SwitchType Internal | Out-Null
            Write-ColorOutput Green "已创建虚拟交换机 '$switchName'"
        }
        else {
            Write-ColorOutput Yellow "虚拟交换机 '$switchName' 已存在"
        }

        # 配置虚拟交换机的IP地址
        $vSwitchAdapter = Get-NetAdapter | Where-Object { $_.Name -like "*$switchName*" }
        $vSwitchAdapterIndex = $vSwitchAdapter.ifIndex

        # 移除现有IP配置
        Remove-NetIPAddress -InterfaceIndex $vSwitchAdapterIndex -Confirm:$false -ErrorAction SilentlyContinue

        # 设置新的IP地址
        New-NetIPAddress -InterfaceIndex $vSwitchAdapterIndex -IPAddress "192.168.1.1" -PrefixLength 24 | Out-Null

        Write-ColorOutput Green "虚拟测试网络配置完成"
    }
    catch {
        Write-ColorOutput Red "创建虚拟测试网络时出错: $_"
        exit 1
    }
}

function Configure-NetworkMonitoring {
    Write-ColorOutput Cyan "正在配置网络监控..."

    try {
        # 启用网络性能监控
        Write-ColorOutput Yellow "正在启用网络性能监控..."
        Set-NetAdapterAdvancedProperty -Name $NetworkAdapter -DisplayName "网络直接" -DisplayValue "已启用" -ErrorAction SilentlyContinue

        # 启用扩展事件跟踪
        Write-ColorOutput Yellow "正在配置网络事件跟踪..."
        $logName = "Microsoft-Windows-TCPIP/Diagnostic"
        wevtutil.exe sl $logName /e:true

        # 检查Wireshark是否已安装
        $wiresharkPath = "C:\Program Files\Wireshark\Wireshark.exe"
        if (Test-Path $wiresharkPath) {
            Write-ColorOutput Green "检测到Wireshark已安装"
        }
        else {
            Write-ColorOutput Yellow "未检测到Wireshark，建议安装Wireshark进行深入的网络分析"
        }

        Write-ColorOutput Green "网络监控配置完成"
    }
    catch {
        Write-ColorOutput Red "配置网络监控时出错: $_"
        # 继续执行，这不是关键错误
    }
}

function Test-NetworkConnectivity {
    param (
        [array]$TestIPs = @("192.168.1.101", "192.168.1.102", "192.168.1.103", "192.168.1.104", "192.168.1.105")
    )

    Write-ColorOutput Cyan "正在测试网络连接性..."

    $results = @()

    foreach ($ip in $TestIPs) {
        Write-ColorOutput Yellow "测试连接到 $ip..."
        $pingResult = Test-Connection -ComputerName $ip -Count 2 -Quiet

        if ($pingResult) {
            Write-ColorOutput Green "成功连接到 $ip"
            $results += [PSCustomObject]@{
                "IP地址" = $ip
                "状态" = "可访问"
                "延迟(ms)" = (Test-Connection -ComputerName $ip -Count 1).ResponseTime
            }
        }
        else {
            Write-ColorOutput Red "无法连接到 $ip"
            $results += [PSCustomObject]@{
                "IP地址" = $ip
                "状态" = "不可访问"
                "延迟(ms)" = "N/A"
            }
        }
    }

    Write-ColorOutput Cyan "网络连接测试结果:"
    $results | Format-Table -AutoSize

    # 导出结果到CSV文件
    $outputPath = "$PSScriptRoot\network_test_results.csv"
    $results | Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8
    Write-ColorOutput Green "测试结果已导出到: $outputPath"
}

function Save-NetworkConfiguration {
    param (
        [string]$ConfigPath = "$PSScriptRoot\network_config.json"
    )

    Write-ColorOutput Cyan "正在保存网络配置..."

    $config = @{
        "NetworkAdapter" = $NetworkAdapter
        "TestSubnet" = $TestSubnet
        "ServerIP" = $ServerIP
        "ConfigurationTime" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "FirewallRules" = Get-NetFirewallRule -DisplayName "*TCP_Socket_Adapter_Test*" | Select-Object DisplayName, Enabled, Direction, Action
        "NetworkAdapters" = Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed
        "IPConfiguration" = Get-NetIPAddress | Where-Object { $_.InterfaceAlias -eq $NetworkAdapter } | Select-Object IPAddress, PrefixLength, InterfaceAlias
    }

    $config | ConvertTo-Json -Depth 5 | Out-File -FilePath $ConfigPath -Encoding UTF8

    Write-ColorOutput Green "网络配置已保存到: $ConfigPath"
}

# 主执行流程
try {
    # 检查管理员权限
    Test-AdminPrivileges

    # 显示脚本信息
    Write-ColorOutput Green "===== TCP/Socket协议适配器测试网络配置工具 ====="
    Write-ColorOutput Green "日期: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-ColorOutput Green "------------------------------------------------"

    # 配置网络适配器
    Configure-NetworkAdapter -AdapterName $NetworkAdapter -IPAddress $ServerIP

    # 配置防火墙规则
    Configure-FirewallRules

    # 创建虚拟测试网络（如果需要）
    if ($CreateVirtualNetwork) {
        Create-VirtualTestNetwork
    }

    # 配置网络监控
    Configure-NetworkMonitoring

    # 测试网络连接性
    Test-NetworkConnectivity

    # 保存网络配置
    Save-NetworkConfiguration

    Write-ColorOutput Green "===== 网络配置完成 ====="
    Write-ColorOutput Green "测试网络已成功配置，可以开始进行TCP/Socket协议适配器测试。"
}
catch {
    Write-ColorOutput Red "配置过程中发生错误: $_"
    exit 1
}
