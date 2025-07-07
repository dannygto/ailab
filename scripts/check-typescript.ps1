#!/usr/bin/env powershell
# TypeScript绫诲瀷妫€鏌ヨ剼鏈?
# 鐢ㄤ簬杩愯鍓嶇浠ｇ爜鐨凾ypeScript绫诲瀷妫€鏌?

Write-Host "===== 寮€濮婽ypeScript绫诲瀷妫€鏌?=====" -ForegroundColor Cyan

$projectRoot = $PSScriptRoot
Set-Location "$projectRoot\frontend"

# 杩愯TypeScript绫诲瀷妫€鏌?
Write-Host "姝ｅ湪妫€鏌ypeScript绫诲瀷閿欒..." -ForegroundColor Yellow
npx tsc --noEmit

# 妫€鏌ョ粨鏋?
if ($LASTEXITCODE -eq 0) {
    Write-Host "鉁?TypeScript绫诲瀷妫€鏌ラ€氳繃!" -ForegroundColor Green
} else {
    Write-Host "鉂?TypeScript绫诲瀷妫€鏌ュけ璐? 璇蜂慨澶嶄互涓婇敊璇? -ForegroundColor Red
}

Write-Host "===== TypeScript绫诲瀷妫€鏌ュ畬鎴?=====" -ForegroundColor Cyan

