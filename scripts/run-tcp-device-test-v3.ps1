# 运行TCP设备集成测试 V3 脚本
# 此脚本用于测试实际设备与平台的连接和数据交换

# 确保目录存在
$testReportsDir = Join-Path $PSScriptRoot "..\tests\reports"
if (-not (Test-Path $testReportsDir)) {
    New-Item -ItemType Directory -Path $testReportsDir -Force | Out-Null
    Write-Host "创建测试报告目录: $testReportsDir"
}

# 转换TypeScript文件
Write-Host "编译TypeScript文件..."
npx ts-node $PSScriptRoot\tcp-device-integration-test-v3.ts

# 如果使用编译后的JavaScript
# Write-Host "编译TypeScript到JavaScript..."
# npx tsc $PSScriptRoot\tcp-device-integration-test-v3.ts
# Write-Host "运行测试脚本..."
# node $PSScriptRoot\tcp-device-integration-test-v3.js

Write-Host "测试完成"
