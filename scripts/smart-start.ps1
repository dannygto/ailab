# 智能启动脚本
# 此脚本用于智能启动AICAM平台的所有服务，包含环境检查和错误处理

# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# 设置错误处理策略
$ErrorActionPreference = "Stop"

# 计时开始
$startTime = Get-Date

function Show-Banner {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  AICAM智能启动系统 (Smart Start System)" -ForegroundColor Cyan
    Write-Host "  人工智能辅助实验平台 v2.0" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Prerequisites {
    Write-Host "正在检查先决条件..." -ForegroundColor Yellow
    
    # 检查Node.js
    try {
        $nodeVersion = node -v
        Write-Host "✓ Node.js已安装: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Node.js未安装或不在PATH中" -ForegroundColor Red
        Write-Host "  请安装Node.js 18.0.0或更高版本" -ForegroundColor Red
        exit 1
    }
    
    # 检查npm
    try {
        $npmVersion = npm -v
        Write-Host "✓ npm已安装: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ npm未安装或不在PATH中" -ForegroundColor Red
        exit 1
    }
    
    # 检查环境文件
    if (Test-Path -Path "../.env") {
        Write-Host "✓ 环境配置文件(.env)已存在" -ForegroundColor Green
    } else {
        Write-Host "! 环境配置文件未找到，将从模板创建..." -ForegroundColor Yellow
        if (Test-Path -Path "../env.example") {
            Copy-Item -Path "../env.example" -Destination "../.env"
            Write-Host "✓ 已从模板创建环境配置文件" -ForegroundColor Green
        } else {
            Write-Host "✗ 环境配置模板文件(env.example)未找到" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "先决条件检查完成" -ForegroundColor Green
    Write-Host ""
}

function Start-Services {
    Write-Host "正在启动服务..." -ForegroundColor Yellow
    
    # 启动服务
    $startPlatformPath = Join-Path $PSScriptRoot "start-platform.ps1"
    if (Test-Path $startPlatformPath) {
        try {
            & $startPlatformPath
            Write-Host "✓ 服务启动成功" -ForegroundColor Green
        } catch {
            Write-Host "✗ 服务启动失败: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ 错误: 找不到启动脚本: $startPlatformPath" -ForegroundColor Red
        Write-Host "请确保scripts目录中存在start-platform.ps1文件" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

function Check-Health {
    Write-Host "正在执行健康检查..." -ForegroundColor Yellow
    
    $healthCheckPath = Join-Path $PSScriptRoot "health-check.ps1"
    if (Test-Path $healthCheckPath) {
        try {
            & $healthCheckPath
            Write-Host "✓ 健康检查通过" -ForegroundColor Green
        } catch {
            Write-Host "! 健康检查未通过: $_" -ForegroundColor Yellow
            Write-Host "部分服务可能未正确启动，但系统将继续运行" -ForegroundColor Yellow
        }
    } else {
        Write-Host "! 健康检查脚本未找到: $healthCheckPath" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Show-Summary {
    # 计算运行时间
    $endTime = Get-Date
    $duration = $endTime - $startTime
    $formattedTime = "{0:mm}分{0:ss}秒" -f $duration
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  AICAM平台启动完成" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "启动用时: $formattedTime" -ForegroundColor Yellow
    Write-Host "前端地址: http://localhost:3000" -ForegroundColor Green
    Write-Host "后端API: http://localhost:3002/api" -ForegroundColor Green
    Write-Host "API文档: http://localhost:3002/api-docs" -ForegroundColor Green
    Write-Host ""
    Write-Host "使用VS Code任务'5-停止所有服务'来关闭平台" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
}

# 主函数
function Main {
    try {
        Show-Banner
        Check-Prerequisites
        Start-Services
        Check-Health
        Show-Summary
    } catch {
        Write-Host "启动过程中发生错误: $_" -ForegroundColor Red
        exit 1
    }
}

# 执行主函数
Main

