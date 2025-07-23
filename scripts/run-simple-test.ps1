# 简化的设备数据存储服务测试脚本

Write-Host "开始运行简化的设备数据存储服务测试..."

try {
    # 使用ts-node运行测试脚本
    Write-Host "运行测试..."
    ts-node --project ./src/backend/tsconfig.json ./src/backend/test/device-data-storage-test.ts

    if ($LASTEXITCODE -eq 0) {
        Write-Host "测试成功完成!" -ForegroundColor Green
    } else {
        Write-Host "测试失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "执行测试时出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host "测试完成"
