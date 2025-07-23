# 运行TCP设备测试分析工具
# 此脚本用于分析TCP设备测试结果并生成报告

# 转换并运行TypeScript文件
Write-Host "正在启动TCP设备测试分析工具..."
npx ts-node $PSScriptRoot\tcp-device-test-analyzer.ts

# 打开HTML报告(如果存在)
$reportsDir = Join-Path $PSScriptRoot "..\tests\reports\analysis"
if (Test-Path $reportsDir) {
    $latestReport = Get-ChildItem -Path $reportsDir -Filter "tcp-device-analysis-*.html" |
                   Sort-Object LastWriteTime -Descending |
                   Select-Object -First 1

    if ($latestReport) {
        Write-Host "正在打开HTML报告..."
        Start-Process $latestReport.FullName
    }
}

Write-Host "分析完成"
