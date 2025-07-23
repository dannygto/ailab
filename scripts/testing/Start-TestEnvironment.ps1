# 启动TCP/Socket协议适配器测试环境

此脚本用于启动TCP/Socket协议适配器的实际设备测试环境，
包括配置网络环境和检查设备连接状态。

.SYNOPSIS
启动TCP/Socket协议适配器测试环境

.DESCRIPTION
此脚本执行以下操作：
1. 配置测试网络环境
2. 检查设备连接状态
3. 准备测试配置文件
4. 启动必要的监控工具

.PARAMETER ConfigureNetwork
是否配置网络环境，默认为$true

.PARAMETER CheckDevices
是否检查设备连接状态，默认为$true

.PARAMETER DeviceConfigPath
设备配置文件路径，默认为"./devices.json"

.EXAMPLE
.\Start-TestEnvironment.ps1 -ConfigureNetwork $false -CheckDevices $true

#>

param (
    [bool]$ConfigureNetwork = $true,
    [bool]$CheckDevices = $true,
    [string]$DeviceConfigPath = "$PSScriptRoot\devices.json"
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

function Create-TestDirectory {
    param (
        [string]$DirectoryPath
    )

    if (-not (Test-Path $DirectoryPath)) {
        New-Item -ItemType Directory -Path $DirectoryPath | Out-Null
        Write-ColorOutput Green "已创建目录: $DirectoryPath"
    }
}

function Copy-TestConfigFiles {
    param (
        [string]$SourcePath,
        [string]$DestinationPath
    )

    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $DestinationPath -Recurse -Force
        Write-ColorOutput Green "已复制配置文件到: $DestinationPath"
    }
    else {
        Write-ColorOutput Yellow "源配置文件不存在: $SourcePath"
    }
}

function Create-TestReport {
    param (
        [string]$ReportPath = "$PSScriptRoot\test_environment_setup_report.html"
    )

    $reportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $computerInfo = Get-ComputerInfo | Select-Object CsName, CsManufacturer, CsModel, OsName, OsVersion
    $networkInfo = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed
    $diskInfo = Get-Volume | Where-Object { $_.DriveLetter } | Select-Object DriveLetter, FileSystemLabel, FileSystem, DriveType, SizeRemaining, Size

    $htmlReport = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCP/Socket协议适配器测试环境设置报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2980b9; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:hover { background-color: #f5f5f5; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .section { background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>TCP/Socket协议适配器测试环境设置报告</h1>
    <p>生成时间: $reportDate</p>

    <div class="section">
        <h2>系统信息</h2>
        <table>
            <tr><td>计算机名称</td><td>$($computerInfo.CsName)</td></tr>
            <tr><td>制造商</td><td>$($computerInfo.CsManufacturer)</td></tr>
            <tr><td>型号</td><td>$($computerInfo.CsModel)</td></tr>
            <tr><td>操作系统</td><td>$($computerInfo.OsName)</td></tr>
            <tr><td>OS版本</td><td>$($computerInfo.OsVersion)</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>网络适配器</h2>
        <table>
            <tr>
                <th>名称</th>
                <th>描述</th>
                <th>MAC地址</th>
                <th>链接速度</th>
            </tr>
"@

    foreach ($adapter in $networkInfo) {
        $htmlReport += @"
            <tr>
                <td>$($adapter.Name)</td>
                <td>$($adapter.InterfaceDescription)</td>
                <td>$($adapter.MacAddress)</td>
                <td>$($adapter.LinkSpeed)</td>
            </tr>
"@
    }

    $htmlReport += @"
        </table>
    </div>

    <div class="section">
        <h2>磁盘信息</h2>
        <table>
            <tr>
                <th>驱动器</th>
                <th>卷标</th>
                <th>文件系统</th>
                <th>类型</th>
                <th>剩余空间</th>
                <th>总大小</th>
            </tr>
"@

    foreach ($disk in $diskInfo) {
        $freeSpaceGB = [math]::Round($disk.SizeRemaining / 1GB, 2)
        $totalSpaceGB = [math]::Round($disk.Size / 1GB, 2)
        $htmlReport += @"
            <tr>
                <td>$($disk.DriveLetter):</td>
                <td>$($disk.FileSystemLabel)</td>
                <td>$($disk.FileSystem)</td>
                <td>$($disk.DriveType)</td>
                <td>${freeSpaceGB} GB</td>
                <td>${totalSpaceGB} GB</td>
            </tr>
"@
    }

    $htmlReport += @"
        </table>
    </div>

    <div class="section">
        <h2>测试环境设置</h2>
        <table>
            <tr>
                <th>任务</th>
                <th>状态</th>
                <th>详情</th>
            </tr>
            <tr>
                <td>网络环境配置</td>
                <td class="$($configureNetworkStatus)">$($configureNetworkResult)</td>
                <td>$($configureNetworkDetails)</td>
            </tr>
            <tr>
                <td>设备连接检查</td>
                <td class="$($checkDevicesStatus)">$($checkDevicesResult)</td>
                <td>$($checkDevicesDetails)</td>
            </tr>
            <tr>
                <td>测试目录准备</td>
                <td class="success">完成</td>
                <td>已创建必要的测试目录</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>后续步骤</h2>
        <ol>
            <li>检查设备连接报告，确保所有设备都可以正常连接</li>
            <li>验证网络配置是否正确</li>
            <li>准备测试用例和测试数据</li>
            <li>启动TCP/Socket协议适配器测试</li>
        </ol>
    </div>

    <hr>
    <p>此报告由TCP/Socket协议适配器测试环境设置工具自动生成</p>
</body>
</html>
"@

    $htmlReport | Out-File -FilePath $ReportPath -Encoding UTF8

    Write-ColorOutput Green "测试环境设置报告已生成: $ReportPath"

    # 如果存在默认浏览器，则打开报告
    try {
        Start-Process $ReportPath
    }
    catch {
        Write-ColorOutput Yellow "无法自动打开报告，请手动打开: $ReportPath"
    }
}

# 主执行流程
try {
    # 显示脚本信息
    Write-ColorOutput Green "===== TCP/Socket协议适配器测试环境启动工具 ====="
    Write-ColorOutput Green "日期: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-ColorOutput Green "------------------------------------------------"

    # 创建测试目录
    $testLogsDir = "$PSScriptRoot\logs"
    $testReportsDir = "$PSScriptRoot\reports"
    $testConfigDir = "$PSScriptRoot\config"

    Create-TestDirectory -DirectoryPath $testLogsDir
    Create-TestDirectory -DirectoryPath $testReportsDir
    Create-TestDirectory -DirectoryPath $testConfigDir

    # 配置网络环境
    $configureNetworkStatus = "success"
    $configureNetworkResult = "完成"
    $configureNetworkDetails = "网络环境配置成功"

    if ($ConfigureNetwork) {
        Write-ColorOutput Cyan "正在配置测试网络环境..."

        try {
            & "$PSScriptRoot\Configure-TestNetwork.ps1"
            Write-ColorOutput Green "网络环境配置完成"
        }
        catch {
            Write-ColorOutput Red "配置网络环境时出错: $_"
            $configureNetworkStatus = "error"
            $configureNetworkResult = "失败"
            $configureNetworkDetails = "错误: $_"
        }
    }
    else {
        Write-ColorOutput Yellow "跳过网络环境配置"
        $configureNetworkStatus = "warning"
        $configureNetworkResult = "跳过"
        $configureNetworkDetails = "用户选择跳过网络环境配置"
    }

    # 检查设备连接状态
    $checkDevicesStatus = "success"
    $checkDevicesResult = "完成"
    $checkDevicesDetails = "所有设备连接正常"

    if ($CheckDevices) {
        Write-ColorOutput Cyan "正在检查设备连接状态..."

        try {
            & "$PSScriptRoot\Check-DeviceConnectivity.ps1" -DeviceConfigPath $DeviceConfigPath
            Write-ColorOutput Green "设备连接检查完成"
        }
        catch {
            Write-ColorOutput Red "检查设备连接时出错: $_"
            $checkDevicesStatus = "error"
            $checkDevicesResult = "失败"
            $checkDevicesDetails = "错误: $_"
        }
    }
    else {
        Write-ColorOutput Yellow "跳过设备连接检查"
        $checkDevicesStatus = "warning"
        $checkDevicesResult = "跳过"
        $checkDevicesDetails = "用户选择跳过设备连接检查"
    }

    # 创建测试环境设置报告
    Create-TestReport -ReportPath "$testReportsDir\test_environment_setup_report.html"

    Write-ColorOutput Green "===== TCP/Socket协议适配器测试环境启动完成 ====="
    Write-ColorOutput Green "您现在可以开始进行TCP/Socket协议适配器测试"
}
catch {
    Write-ColorOutput Red "测试环境启动过程中发生错误: $_"
    exit 1
}
