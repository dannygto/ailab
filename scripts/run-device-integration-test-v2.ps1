#!/usr/bin/env pwsh

<#
.SYNOPSIS
    执行TCP/Socket协议适配器与实际设备的集成测试 V2
.DESCRIPTION
    本脚本执行TCP/Socket协议适配器与实际设备的集成测试，测试连接建立、命} catch {
    Write-ColorOutput "执行测试时出错: $_" -ForegroundColor Red
    exit 1
}响应处理
.PARAMETER Device
    要测试的设备名称，可选: GX-5000, OS-2500, MC-3000, CH-7000, TH-1200
.PARAMETER Mode
    测试模式，可选: test (自动测试), interactive (交互式)
.PARAMETER Host
    设备的主机地址，可选参数，覆盖默认配置
.PARAMETER Port
    设备的端口号，可选参数，覆盖默认配置
.PARAMETER Timeout
    命令超时时间(毫秒)，默认5000
.PARAMETER Verbose
    启用详细输出
.PARAMETER Secure
    使用安全连接(TLS/SSL)
.PARAMETER OutputFile
    测试结果输出文件路径
.EXAMPLE
    .\run-device-integration-test-v2.ps1 -Device GX-5000
.EXAMPLE
    .\run-device-integration-test-v2.ps1 -Device OS-2500 -Mode interactive
.NOTES
    作者: AI实验室开发团队
    版本: 1.0
    日期: 2025-07-24
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("GX-5000", "OS-2500", "MC-3000", "CH-7000", "TH-1200")]
    [string]$Device = "GX-5000",

    [Parameter(Mandatory=$false)]
    [ValidateSet("test", "interactive")]
    [string]$Mode = "test",

    [Parameter(Mandatory=$false)]
    [string]$Host = "",

    [Parameter(Mandatory=$false)]
    [int]$Port = 0,

    [Parameter(Mandatory=$false)]
    [int]$Timeout = 5000,

    [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput = $false,

    [Parameter(Mandatory=$false)]
    [switch]$Secure = $false,

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = ""
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 脚本路径
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath

# 定义颜色函数
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )

    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

# 显示测试信息
Write-ColorOutput "TCP/Socket协议适配器实际设备集成测试 V2" -ForegroundColor Cyan
Write-ColorOutput "----------------------------------------" -ForegroundColor Cyan
Write-ColorOutput "设备: $Device" -ForegroundColor Yellow
Write-ColorOutput "模式: $Mode" -ForegroundColor Yellow
if ($Host) { Write-ColorOutput "主机: $Host" -ForegroundColor Yellow }
if ($Port -gt 0) { Write-ColorOutput "端口: $Port" -ForegroundColor Yellow }
Write-ColorOutput "超时: $Timeout ms" -ForegroundColor Yellow
if ($VerboseOutput) { Write-ColorOutput "详细输出: 启用" -ForegroundColor Yellow }
if ($Secure) { Write-ColorOutput "安全连接: 启用" -ForegroundColor Yellow }
if ($OutputFile) { Write-ColorOutput "输出文件: $OutputFile" -ForegroundColor Yellow }
Write-ColorOutput "----------------------------------------" -ForegroundColor Cyan

# 检查依赖项
try {
    Write-ColorOutput "检查依赖项..." -ForegroundColor Gray

    # 检查Node.js
    $nodeVersion = node --version
    Write-ColorOutput "Node.js版本: $nodeVersion" -ForegroundColor Gray

    # 检查TypeScript
    $tsVersion = npx -c "tsc --version" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "未找到TypeScript，正在全局安装..." -ForegroundColor Yellow
        npm install -g typescript
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "安装TypeScript失败，请手动安装后重试" -ForegroundColor Red
            exit 1
        }
        $tsVersion = npx -c "tsc --version"
    }
    Write-ColorOutput "TypeScript版本: $tsVersion" -ForegroundColor Gray

    # 检查ts-node
    $tsNodeVersion = npx -c "ts-node --version" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "未找到ts-node，正在全局安装..." -ForegroundColor Yellow
        npm install -g ts-node
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "安装ts-node失败，请手动安装后重试" -ForegroundColor Red
            exit 1
        }
        $tsNodeVersion = npx -c "ts-node --version"
    }
    Write-ColorOutput "ts-node版本: $tsNodeVersion" -ForegroundColor Gray

} catch {
    Write-ColorOutput "检查依赖项时出错: $_" -ForegroundColor Red
    exit 1
}

# 创建必要的目录
try {
    # 创建日志目录
    if (-not (Test-Path "$ProjectRoot\logs\test-results")) {
        New-Item -ItemType Directory -Path "$ProjectRoot\logs\test-results" -Force | Out-Null
        Write-ColorOutput "已创建测试结果目录" -ForegroundColor Gray
    }

    # 创建设备配置目录
    if (-not (Test-Path "$ProjectRoot\config\devices")) {
        New-Item -ItemType Directory -Path "$ProjectRoot\config\devices" -Force | Out-Null
        Write-ColorOutput "已创建设备配置目录" -ForegroundColor Gray
    }
} catch {
    Write-ColorOutput "创建目录时出错: $_" -ForegroundColor Red
    exit 1
}

# 构建命令参数
$cmdArgs = @("$ScriptPath\device-integration-test-v2.ts", "--device=$Device", "--mode=$Mode")
if ($Host) { $cmdArgs += "--host=$Host" }
if ($Port -gt 0) { $cmdArgs += "--port=$Port" }
$cmdArgs += "--timeout=$Timeout"
if ($VerboseOutput) { $cmdArgs += "--verbose" }
if ($Secure) { $cmdArgs += "--secure" }
if ($OutputFile) { $cmdArgs += "--output-file=$OutputFile" }

# 执行测试
try {
    Write-ColorOutput "正在执行设备集成测试..." -ForegroundColor Green

    # 确保后端目录下的node_modules存在
    if (-not (Test-Path "$ProjectRoot\src\backend\node_modules")) {
        Write-ColorOutput "后端依赖项未安装，正在安装..." -ForegroundColor Yellow
        Push-Location "$ProjectRoot\src\backend"
        npm install
        Pop-Location
    }

    # 使用ts-node执行测试脚本
    npx ts-node $cmdArgs

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "测试成功完成！" -ForegroundColor Green
    } else {
        Write-ColorOutput "测试失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-ColorOutput "执行测试时出错: $_" -ForegroundColor Red
    exit 1
}
