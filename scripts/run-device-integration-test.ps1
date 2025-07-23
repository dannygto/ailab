#!/usr/bin/env powershell

# TCP/Socket设备集成测试工具执行脚本
#
# 该脚本用于执行TCP/Socket设备集成测试工具
#
# 使用方法:
# ./run-device-integration-test.ps1 [参数]

# 脚本参数
param (
    [string]$HostAddress = "",
    [int]$PortNumber = 0,
    [ValidateSet("discovery", "connect", "send", "receive", "monitor", "full")]
    [string]$Mode = "full",
    [string]$Command = "",
    [int]$Timeout = 10000,
    [switch]$Verbose = $false,
    [switch]$Secure = $false,
    [switch]$NoDiscover = $false,
    [int]$Duration = 0,
    [string]$OutputFile = "",
    [string]$DeviceType = ""
)

# 颜色常量
$COLOR_INFO = "Cyan"
$COLOR_SUCCESS = "Green"
$COLOR_WARNING = "Yellow"
$COLOR_ERROR = "Red"

# 设置工作目录为项目根目录
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

Write-Host "正在执行 TCP/Socket 设备集成测试..." -ForegroundColor $COLOR_INFO

# 构建执行命令
$executeParams = @()

if ($HostAddress) {
    $executeParams += "--host=""$HostAddress"""
}

if ($PortNumber -gt 0) {
    $executeParams += "--port=""$PortNumber"""
}

$executeParams += "--type=""$Mode"""

if ($Command) {
    $executeParams += "--command=""$Command"""
}

$executeParams += "--timeout=""$Timeout"""

if ($Verbose) {
    $executeParams += "--verbose"
}

if ($Secure) {
    $executeParams += "--secure"
}

if ($NoDiscover) {
    $executeParams += "--no-discover"
}

if ($Duration -gt 0) {
    $executeParams += "--duration=""$Duration"""
}

if ($OutputFile) {
    $executeParams += "--output-file=""$OutputFile"""
}

if ($DeviceType) {
    $executeParams += "--device-type=""$DeviceType"""
}

# 显示执行命令
$executeCommand = "npx ts-node ./scripts/tcp-socket-device-integration-test.ts $($executeParams -join ' ')"
Write-Host "执行命令: $executeCommand" -ForegroundColor $COLOR_INFO

# 执行测试工具
try {
    # 编译TypeScript
    Write-Host "编译 TypeScript 文件..." -ForegroundColor $COLOR_INFO
    & npx tsc --noEmit ./scripts/tcp-socket-device-integration-test.ts

    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript 编译失败，请修复错误后再试" -ForegroundColor $COLOR_ERROR
        exit 1
    }

    # 执行测试工具
    Write-Host "开始测试..." -ForegroundColor $COLOR_INFO
    Invoke-Expression $executeCommand

    if ($LASTEXITCODE -eq 0) {
        Write-Host "测试完成!" -ForegroundColor $COLOR_SUCCESS
    } else {
        Write-Host "测试失败，退出码: $LASTEXITCODE" -ForegroundColor $COLOR_ERROR
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "执行测试时出错: $($_.Exception.Message)" -ForegroundColor $COLOR_ERROR
    exit 1
}
