# 测试设备连接检查工具

此脚本用于检查TCP/Socket协议适配器测试环境中设备的连接状态。
适用于Windows Server 2025和Windows 11环境。

.SYNOPSIS
检查TCP/Socket协议适配器测试设备的连接状态。

.DESCRIPTION
此脚本执行以下操作：
1. 检查设备网络连接状态
2. 测试TCP端口是否可访问
3. 尝试与设备建立简单的TCP连接
4. 验证基本命令响应
5. 生成设备连接报告

.PARAMETER DeviceConfigPath
设备配置文件路径，默认为"./devices.json"

.EXAMPLE
.\Check-DeviceConnectivity.ps1 -DeviceConfigPath "./custom-devices.json"

#>

param (
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

function Test-DeviceNetworkConnectivity {
    param (
        [string]$DeviceIP,
        [string]$DeviceName
    )

    Write-ColorOutput Cyan "正在测试设备网络连接: $DeviceName ($DeviceIP)..."

    $pingResult = Test-Connection -ComputerName $DeviceIP -Count 2 -Quiet

    if ($pingResult) {
        $pingDetails = Test-Connection -ComputerName $DeviceIP -Count 4
        $avgResponseTime = ($pingDetails | Measure-Object -Property ResponseTime -Average).Average
        Write-ColorOutput Green "设备 $DeviceName 网络连接正常。平均响应时间: $($avgResponseTime.ToString('0.00')) ms"
        return @{
            Status = $true
            ResponseTime = $avgResponseTime
            Details = $pingDetails
        }
    }
    else {
        Write-ColorOutput Red "无法连接到设备 $DeviceName ($DeviceIP)"
        return @{
            Status = $false
            ResponseTime = $null
            Details = $null
        }
    }
}

function Test-TCPPort {
    param (
        [string]$DeviceIP,
        [int]$Port,
        [string]$DeviceName,
        [int]$TimeoutMilliseconds = 3000
    )

    Write-ColorOutput Cyan "正在测试设备 $DeviceName 的TCP端口 $Port..."

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($DeviceIP, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutMilliseconds, $false)

        if (!$wait) {
            $tcpClient.Close()
            Write-ColorOutput Red "连接到设备 $DeviceName 的端口 $Port 超时"
            return @{
                Status = $false
                Message = "连接超时"
            }
        }
        else {
            try {
                $tcpClient.EndConnect($connect)
                Write-ColorOutput Green "设备 $DeviceName 的端口 $Port 可访问"
                $tcpClient.Close()
                return @{
                    Status = $true
                    Message = "端口开放"
                }
            }
            catch {
                $tcpClient.Close()
                Write-ColorOutput Red "连接到设备 $DeviceName 的端口 $Port 失败: $_"
                return @{
                    Status = $false
                    Message = "连接失败: $_"
                }
            }
        }
    }
    catch {
        Write-ColorOutput Red "测试设备 $DeviceName 的端口 $Port 时出错: $_"
        return @{
            Status = $false
            Message = "测试出错: $_"
        }
    }
}

function Test-TCPCommunication {
    param (
        [string]$DeviceIP,
        [int]$Port,
        [string]$DeviceName,
        [string]$TestCommand,
        [string]$CommandTerminator = "`r`n",
        [int]$TimeoutMilliseconds = 5000
    )

    Write-ColorOutput Cyan "正在测试与设备 $DeviceName 的TCP通信..."

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.SendTimeout = $TimeoutMilliseconds
        $tcpClient.ReceiveTimeout = $TimeoutMilliseconds

        $connect = $tcpClient.BeginConnect($DeviceIP, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutMilliseconds, $false)

        if (!$wait) {
            $tcpClient.Close()
            Write-ColorOutput Red "连接到设备 $DeviceName 超时"
            return @{
                Status = $false
                Response = $null
                Message = "连接超时"
            }
        }

        try {
            $tcpClient.EndConnect($connect)

            if ($TestCommand) {
                $stream = $tcpClient.GetStream()
                $writer = New-Object System.IO.StreamWriter($stream)
                $reader = New-Object System.IO.StreamReader($stream)

                # 设置流的超时时间
                $stream.ReadTimeout = $TimeoutMilliseconds
                $stream.WriteTimeout = $TimeoutMilliseconds

                # 发送测试命令
                $commandToSend = $TestCommand + $CommandTerminator
                $writer.Write($commandToSend)
                $writer.Flush()

                Write-ColorOutput Yellow "已发送命令: $TestCommand"

                # 等待响应
                $response = ""
                $buffer = New-Object System.Byte[] 1024
                $encoding = New-Object System.Text.ASCIIEncoding

                try {
                    # 设置异步读取超时
                    $readTask = [System.Threading.Tasks.Task]::Run({
                        while ($stream.DataAvailable -or $response -eq "") {
                            $bytesRead = $stream.Read($buffer, 0, 1024)
                            if ($bytesRead -gt 0) {
                                $response += $encoding.GetString($buffer, 0, $bytesRead)
                            }
                            Start-Sleep -Milliseconds 100
                        }
                        return $response
                    })

                    $completed = $readTask.Wait($TimeoutMilliseconds)

                    if ($completed) {
                        $response = $readTask.Result
                        Write-ColorOutput Green "收到响应: $response"
                    }
                    else {
                        Write-ColorOutput Yellow "读取响应超时，可能设备不返回响应或使用不同的协议"
                    }
                }
                catch {
                    Write-ColorOutput Yellow "读取响应时出错: $_"
                }
            }

            $tcpClient.Close()

            if ($response) {
                return @{
                    Status = $true
                    Response = $response
                    Message = "通信成功"
                }
            }
            else {
                return @{
                    Status = $true
                    Response = $null
                    Message = "连接成功，但未收到响应"
                }
            }
        }
        catch {
            $tcpClient.Close()
            Write-ColorOutput Red "与设备 $DeviceName 通信失败: $_"
            return @{
                Status = $false
                Response = $null
                Message = "通信失败: $_"
            }
        }
    }
    catch {
        Write-ColorOutput Red "测试与设备 $DeviceName 的TCP通信时出错: $_"
        return @{
            Status = $false
            Response = $null
            Message = "测试出错: $_"
        }
    }
}

function Generate-DeviceConnectionReport {
    param (
        [array]$DeviceResults,
        [string]$ReportPath = "$PSScriptRoot\device_connection_report.html"
    )

    Write-ColorOutput Cyan "正在生成设备连接报告..."

    $reportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $htmlHeader = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TCP/Socket协议适配器设备连接报告</title>
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
        .device-card { background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
        .device-header { display: flex; justify-content: space-between; align-items: center; }
        .status-indicator { width: 15px; height: 15px; border-radius: 50%; display: inline-block; margin-right: 10px; }
        .status-online { background-color: green; }
        .status-partial { background-color: orange; }
        .status-offline { background-color: red; }
        .detail-section { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body>
    <h1>TCP/Socket协议适配器设备连接报告</h1>
    <p>生成时间: $reportDate</p>
    <p>测试服务器: $env:COMPUTERNAME</p>

    <h2>设备连接摘要</h2>
    <table>
        <tr>
            <th>设备ID</th>
            <th>设备名称</th>
            <th>IP地址</th>
            <th>端口</th>
            <th>网络连接</th>
            <th>端口可访问</th>
            <th>TCP通信</th>
            <th>总体状态</th>
        </tr>
"@

    $htmlDeviceCards = ""
    $htmlRows = ""

    foreach ($device in $DeviceResults) {
        $networkStatus = if ($device.NetworkTest.Status) { "成功" } else { "失败" }
        $networkStatusClass = if ($device.NetworkTest.Status) { "success" } else { "error" }

        $portStatus = if ($device.PortTest.Status) { "开放" } else { "关闭" }
        $portStatusClass = if ($device.PortTest.Status) { "success" } else { "error" }

        $commStatus = if ($device.CommTest.Status) { "成功" } else { "失败" }
        $commStatusClass = if ($device.CommTest.Status) { "success" } else { "error" }

        # 计算总体状态
        $overallStatus = "离线"
        $overallStatusClass = "error"
        $statusIndicatorClass = "status-offline"

        if ($device.NetworkTest.Status) {
            if ($device.PortTest.Status) {
                if ($device.CommTest.Status) {
                    $overallStatus = "在线"
                    $overallStatusClass = "success"
                    $statusIndicatorClass = "status-online"
                }
                else {
                    $overallStatus = "部分在线"
                    $overallStatusClass = "warning"
                    $statusIndicatorClass = "status-partial"
                }
            }
            else {
                $overallStatus = "部分在线"
                $overallStatusClass = "warning"
                $statusIndicatorClass = "status-partial"
            }
        }

        $htmlRows += @"
        <tr>
            <td>$($device.DeviceId)</td>
            <td>$($device.DeviceName)</td>
            <td>$($device.IP)</td>
            <td>$($device.Port)</td>
            <td class="$networkStatusClass">$networkStatus</td>
            <td class="$portStatusClass">$portStatus</td>
            <td class="$commStatusClass">$commStatus</td>
            <td class="$overallStatusClass">$overallStatus</td>
        </tr>
"@

        $htmlDeviceCards += @"
    <div class="device-card">
        <div class="device-header">
            <h3><span class="status-indicator $statusIndicatorClass"></span>$($device.DeviceName) ($($device.DeviceId))</h3>
            <span class="$overallStatusClass">$overallStatus</span>
        </div>
        <p>IP地址: $($device.IP):$($device.Port)</p>
        <p>设备类型: $($device.DeviceType)</p>

        <div class="detail-section">
            <h4>网络连接测试</h4>
            <p class="$networkStatusClass">状态: $networkStatus</p>
"@

        if ($device.NetworkTest.Status) {
            $htmlDeviceCards += @"
            <p>响应时间: $($device.NetworkTest.ResponseTime.ToString('0.00')) ms</p>
"@
        }
        else {
            $htmlDeviceCards += @"
            <p class="error">错误: 设备无法ping通</p>
"@
        }

        $htmlDeviceCards += @"
        </div>

        <div class="detail-section">
            <h4>端口测试</h4>
            <p class="$portStatusClass">状态: $portStatus</p>
            <p>测试端口: $($device.Port)</p>
            <p>详情: $($device.PortTest.Message)</p>
        </div>

        <div class="detail-section">
            <h4>TCP通信测试</h4>
            <p class="$commStatusClass">状态: $commStatus</p>
"@

        if ($device.TestCommand) {
            $htmlDeviceCards += @"
            <p>测试命令: $($device.TestCommand)</p>
"@
        }

        if ($device.CommTest.Response) {
            $htmlDeviceCards += @"
            <p>响应: $($device.CommTest.Response)</p>
"@
        }

        $htmlDeviceCards += @"
            <p>详情: $($device.CommTest.Message)</p>
        </div>
    </div>
"@
    }

    $htmlFooter = @"
    </table>

    <h2>设备详细信息</h2>
    $htmlDeviceCards

    <hr>
    <p>此报告由TCP/Socket协议适配器测试设备连接检查工具自动生成</p>
</body>
</html>
"@

    $htmlReport = $htmlHeader + $htmlRows + $htmlFooter
    $htmlReport | Out-File -FilePath $ReportPath -Encoding UTF8

    Write-ColorOutput Green "设备连接报告已生成: $ReportPath"

    # 如果存在默认浏览器，则打开报告
    try {
        Start-Process $ReportPath
    }
    catch {
        Write-ColorOutput Yellow "无法自动打开报告，请手动打开: $ReportPath"
    }
}

function Get-DeviceConfig {
    param (
        [string]$ConfigPath
    )

    if (Test-Path $ConfigPath) {
        try {
            $deviceConfig = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
            return $deviceConfig
        }
        catch {
            Write-ColorOutput Red "读取设备配置文件出错: $_"
            return $null
        }
    }
    else {
        Write-ColorOutput Yellow "设备配置文件不存在: $ConfigPath"
        Write-ColorOutput Yellow "使用默认测试设备配置..."

        # 创建默认配置
        $defaultConfig = @(
            @{
                DeviceId = "DEV001"
                DeviceName = "数字多功能测量仪"
                DeviceType = "测量仪器"
                IP = "192.168.1.101"
                Port = 5001
                Protocol = "TCP纯文本"
                TestCommand = "*IDN?"
                CommandTerminator = "`r`n"
                ExpectedResponse = "KETAI,DMM5000"
            },
            @{
                DeviceId = "DEV002"
                DeviceName = "高精度示波器"
                DeviceType = "示波器"
                IP = "192.168.1.102"
                Port = 5002
                Protocol = "TCP二进制"
                TestCommand = $null  # 二进制命令无法在此表示
                CommandTerminator = $null
                ExpectedResponse = $null
            },
            @{
                DeviceId = "DEV003"
                DeviceName = "环境监测系统"
                DeviceType = "监测系统"
                IP = "192.168.1.103"
                Port = 5003
                Protocol = "TCP/JSON"
                TestCommand = '{"action":"ping"}'
                CommandTerminator = "`r`n"
                ExpectedResponse = "ping"
            },
            @{
                DeviceId = "DEV004"
                DeviceName = "工业控制器"
                DeviceType = "控制器"
                IP = "192.168.1.104"
                Port = 502
                Protocol = "Modbus TCP"
                TestCommand = $null  # Modbus命令无法用简单字符串表示
                CommandTerminator = $null
                ExpectedResponse = $null
            },
            @{
                DeviceId = "DEV005"
                DeviceName = "机器人控制单元"
                DeviceType = "控制单元"
                IP = "192.168.1.105"
                Port = 5005
                Protocol = "TCP/XML"
                TestCommand = "<Command><Header><Name>Status</Name></Header></Command>"
                CommandTerminator = "`r`n"
                ExpectedResponse = "<Response>"
            }
        )

        # 保存默认配置
        $defaultConfigJson = $defaultConfig | ConvertTo-Json -Depth 5
        $defaultConfigJson | Out-File -FilePath $ConfigPath -Encoding UTF8

        Write-ColorOutput Green "已创建默认设备配置文件: $ConfigPath"
        return $defaultConfig
    }
}

# 主执行流程
try {
    # 显示脚本信息
    Write-ColorOutput Green "===== TCP/Socket协议适配器测试设备连接检查工具 ====="
    Write-ColorOutput Green "日期: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-ColorOutput Green "------------------------------------------------"

    # 获取设备配置
    $devices = Get-DeviceConfig -ConfigPath $DeviceConfigPath

    if ($null -eq $devices) {
        Write-ColorOutput Red "无法获取设备配置，检查终止"
        exit 1
    }

    Write-ColorOutput Green "找到 $($devices.Count) 个测试设备"

    $deviceResults = @()

    foreach ($device in $devices) {
        Write-ColorOutput Cyan "===== 检查设备: $($device.DeviceName) ($($device.DeviceId)) ====="

        # 测试网络连接
        $networkTest = Test-DeviceNetworkConnectivity -DeviceIP $device.IP -DeviceName $device.DeviceName

        # 测试TCP端口
        $portTest = Test-TCPPort -DeviceIP $device.IP -Port $device.Port -DeviceName $device.DeviceName

        # 测试TCP通信
        $commTest = Test-TCPCommunication -DeviceIP $device.IP -Port $device.Port -DeviceName $device.DeviceName -TestCommand $device.TestCommand -CommandTerminator $device.CommandTerminator

        # 记录结果
        $deviceResult = @{
            DeviceId = $device.DeviceId
            DeviceName = $device.DeviceName
            DeviceType = $device.DeviceType
            IP = $device.IP
            Port = $device.Port
            Protocol = $device.Protocol
            TestCommand = $device.TestCommand
            NetworkTest = $networkTest
            PortTest = $portTest
            CommTest = $commTest
        }

        $deviceResults += $deviceResult
    }

    # 生成报告
    Generate-DeviceConnectionReport -DeviceResults $deviceResults

    Write-ColorOutput Green "===== 设备连接检查完成 ====="
}
catch {
    Write-ColorOutput Red "检查过程中发生错误: $_"
    exit 1
}
