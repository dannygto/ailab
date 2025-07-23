#!/usr/bin/env pwsh

<#
.SYNOPSIS
    执行TCP/Socket协议适配器与实际设备的集成测试 V2
.DESCRIPTION
    本脚本执行TCP/Socket协议适配器与实际设备的集成测试，测试连接建立、命令发送和响应处理
.PARAMETER Device
    要测试的设备名称，可选: GX-5000, OS-2500, MC-3000, CH-7000, TH-1200
.PARAMETER Mode
    测试模式，可选: test (自动测试), interactive (交互式)
.PARAMETER Host
    设备的主机地址，可选参数，覆盖默认配置
.PARAMETER Port
    设备的端口号，可选参数，覆盖默认配置
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
    [switch]$VerboseOutput = $false,

    [Parameter(Mandatory=$false)]
    [switch]$Secure = $false
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 脚本路径
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath

# 显示测试信息
Write-Host "TCP/Socket协议适配器实际设备集成测试 V2" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "设备: $Device" -ForegroundColor Yellow
Write-Host "模式: $Mode" -ForegroundColor Yellow
if ($Host) { Write-Host "主机: $Host" -ForegroundColor Yellow }
if ($Port -gt 0) { Write-Host "端口: $Port" -ForegroundColor Yellow }
if ($VerboseOutput) { Write-Host "详细输出: 启用" -ForegroundColor Yellow }
if ($Secure) { Write-Host "安全连接: 启用" -ForegroundColor Yellow }
Write-Host "----------------------------------------" -ForegroundColor Cyan

# 检查依赖项
try {
    Write-Host "检查依赖项..." -ForegroundColor Gray

    # 检查Node.js
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Gray

    # 检查TypeScript
    $tsVersion = npx -c "tsc --version" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "未找到TypeScript，正在全局安装..." -ForegroundColor Yellow
        npm install -g typescript
        if ($LASTEXITCODE -ne 0) {
            Write-Host "安装TypeScript失败，请手动安装后重试" -ForegroundColor Red
            exit 1
        }
        $tsVersion = npx -c "tsc --version"
    }
    Write-Host "TypeScript版本: $tsVersion" -ForegroundColor Gray

    # 检查ts-node
    $tsNodeVersion = npx -c "ts-node --version" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "未找到ts-node，正在全局安装..." -ForegroundColor Yellow
        npm install -g ts-node
        if ($LASTEXITCODE -ne 0) {
            Write-Host "安装ts-node失败，请手动安装后重试" -ForegroundColor Red
            exit 1
        }
        $tsNodeVersion = npx -c "ts-node --version"
    }
    Write-Host "ts-node版本: $tsNodeVersion" -ForegroundColor Gray

} catch {
    Write-Host "检查依赖项时出错: $_" -ForegroundColor Red
    exit 1
}

# 创建必要的目录
try {
    # 创建日志目录
    if (-not (Test-Path "$ProjectRoot\logs\test-results")) {
        New-Item -ItemType Directory -Path "$ProjectRoot\logs\test-results" -Force | Out-Null
        Write-Host "已创建测试结果目录" -ForegroundColor Gray
    }

    # 创建设备配置目录
    if (-not (Test-Path "$ProjectRoot\config\devices")) {
        New-Item -ItemType Directory -Path "$ProjectRoot\config\devices" -Force | Out-Null
        Write-Host "已创建设备配置目录" -ForegroundColor Gray
    }
} catch {
    Write-Host "创建目录时出错: $_" -ForegroundColor Red
    exit 1
}

# 构建命令参数
$cmdArgs = @("$ScriptPath\device-integration-test-v2.ts", "--device=$Device", "--mode=$Mode")
if ($Host) { $cmdArgs += "--host=$Host" }
if ($Port -gt 0) { $cmdArgs += "--port=$Port" }
if ($VerboseOutput) { $cmdArgs += "--verbose" }
if ($Secure) { $cmdArgs += "--secure" }

# 执行测试
try {
    Write-Host "正在执行设备集成测试..." -ForegroundColor Green

    # 确保后端目录下的node_modules存在
    if (-not (Test-Path "$ProjectRoot\src\backend\node_modules")) {
        Write-Host "后端依赖项未安装，正在安装..." -ForegroundColor Yellow
        Push-Location "$ProjectRoot\src\backend"
        npm install
        Pop-Location
    }

    # 使用ts-node执行测试脚本
    npx ts-node $cmdArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host "测试成功完成！" -ForegroundColor Green
    } else {
        Write-Host "测试失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "执行测试时出错: $_" -ForegroundColor Red
    exit 1
}
