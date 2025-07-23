# 运行设备通信服务测试

# 进入后端目录
Set-Location ..\src\backend

# 编译TypeScript文件
Write-Host "编译TypeScript文件..." -ForegroundColor Green
npm run build

# 运行测试
Write-Host "运行设备通信服务测试..." -ForegroundColor Green
node ./dist/test/device-communication-test.js

Write-Host "测试完成！" -ForegroundColor Green
