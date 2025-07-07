#!/usr/bin/env pwsh

# 浜や簰寮忎换鍔¤彍鍗?
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

function Show-Menu {
    Clear-Host
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "            AICAM骞冲彴 - 浠诲姟鑿滃崟                " -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "璇烽€夋嫨瑕佹墽琛岀殑浠诲姟:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 鍚姩鍏ㄩ儴鏈嶅姟" -ForegroundColor Green
    Write-Host "2. 鍚姩鍓嶇" -ForegroundColor Green
    Write-Host "3. 鍚姩鍚庣" -ForegroundColor Green
    Write-Host "4. 娴嬭瘯AI鏈嶅姟" -ForegroundColor Green
    Write-Host "5. 鍋滄鎵€鏈夋湇鍔? -ForegroundColor Red
    Write-Host "6. AI鍔╂墜娴嬭瘯" -ForegroundColor Green
    Write-Host "7. 瀹夎鎵€鏈変緷璧? -ForegroundColor Green
    Write-Host "8. 绯荤粺鍋ュ悍妫€鏌? -ForegroundColor Green
    Write-Host "9. 鏋勫缓椤圭洰" -ForegroundColor Green
    Write-Host "10. TypeScript绫诲瀷妫€鏌? -ForegroundColor Green
    Write-Host "11. 閰嶇疆AI瀵嗛挜" -ForegroundColor Green
    Write-Host "12. 鍚姩鍚庣骞舵祴璇旳I" -ForegroundColor Green
    Write-Host "13. 娓呯悊椤圭洰" -ForegroundColor Green
    Write-Host "14. 绯荤粺鐘舵€佹鏌? -ForegroundColor Green
    Write-Host ""
    Write-Host "0. 閫€鍑? -ForegroundColor Gray
    Write-Host ""
}

function Execute-Task {
    param (
        [int]$TaskNumber
    )
    
    switch ($TaskNumber) {
        1 { & "$PSScriptRoot/scripts/run-all-services.ps1" }
        2 { & "$PSScriptRoot/scripts/run-frontend.ps1" }
        3 { & "$PSScriptRoot/scripts/run-backend.ps1" }
        4 { & "$PSScriptRoot/scripts/run-ai-test.ps1" }
        5 { 
            Write-Host "姝ｅ湪鍋滄鎵€鏈夋湇鍔?.." -ForegroundColor Yellow
            Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
            Get-NetTCPConnection -LocalPort 3000,3002 -ErrorAction SilentlyContinue | ForEach-Object { 
                try { 
                    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
                } catch {} 
            }
            Write-Host "姝ｅ湪娓呯悊涓存椂鑴氭湰..." -ForegroundColor Yellow
            Remove-Item $env:TEMP\run-*-*.ps1 -ErrorAction SilentlyContinue
            Write-Host "鎵€鏈夋湇鍔″凡鍋滄" -ForegroundColor Green
        }
        6 { node "$PSScriptRoot/test-ai-assistant.js" }
        7 { & "$PSScriptRoot/scripts/install-dependencies.ps1" }
        8 { & "$PSScriptRoot/scripts/health-check.ps1" }
        9 { & "$PSScriptRoot/scripts/build-project.ps1" }
        10 { & "$PSScriptRoot/scripts/typescript-check.ps1" }
        11 { & "$PSScriptRoot/scripts/setup-ai-keys.ps1" }
        12 { & "$PSScriptRoot/scripts/run-backend-with-test.ps1" }
        13 { & "$PSScriptRoot/scripts/clean-project.ps1" }
        14 { & "$PSScriptRoot/system-check.ps1" }
        0 { exit }
        default { Write-Host "鏃犳晥鐨勯€夋嫨锛岃閲嶈瘯" -ForegroundColor Red }
    }
    
    if ($TaskNumber -ne 0 -and $TaskNumber -ne 1 -and $TaskNumber -ne 2 -and $TaskNumber -ne 3 -and $TaskNumber -ne 5 -and $TaskNumber -ne 12) {
        Write-Host ""
        Read-Host "鎸塃nter閿户缁?
    }
}

# 涓诲惊鐜?
do {
    Show-Menu
    $choice = Read-Host "璇疯緭鍏ラ€夐」"
    $validChoice = $choice -match '^\d+$' -and [int]$choice -ge 0 -and [int]$choice -le 14
    
    if ($validChoice) {
        Execute-Task -TaskNumber ([int]$choice)
    } else {
        Write-Host "鏃犳晥鐨勯€夋嫨锛岃杈撳叆0-14涔嬮棿鐨勬暟瀛? -ForegroundColor Red
        Start-Sleep -Seconds 2
    }
} while ($choice -ne 0)

