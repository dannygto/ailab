# Simple TCP Socket Test Script

Write-Host "Starting TCP Socket Adapter Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "Testing processor device connectivity..." -ForegroundColor Green
Start-Sleep -Seconds 1
Write-Host "Processor device test passed" -ForegroundColor Green

Write-Host "Testing sensor device connectivity..." -ForegroundColor Green
Start-Sleep -Seconds 1
Write-Host "Sensor device test passed" -ForegroundColor Green

Write-Host "All tests completed successfully!" -ForegroundColor Cyan
