# API娴嬭瘯鑴氭湰
# 娴嬭瘯鍓嶅悗绔疉PI瀵瑰簲鍏崇郴

# 璁剧疆UTF-8缂栫爜锛岄伩鍏嶄腑鏂囨樉绀洪棶棰?
# 编码设置已优化

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "          API娴嬭瘯涓庡搴斿叧绯婚獙璇? -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# 妫€鏌ュ悗绔湇鍔℃槸鍚﹁繍琛?
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "鉁?鍚庣鏈嶅姟杩愯涓? -ForegroundColor Green
    }
} 
catch {
    Write-Host "鉂?鍚庣鏈嶅姟鏈繍琛? -ForegroundColor Red
}

# 濡傛灉鍚庣鏈嶅姟鏈繍琛岋紝鍚姩鏈嶅姟
if (-not $backendRunning) {
    Write-Host "`n姝ｅ湪鍚姩鍚庣鏈嶅姟..." -ForegroundColor Yellow
    
    # 鍒涘缓涓存椂鍚姩鑴氭湰
    $tempScript = [System.IO.Path]::Combine($env:TEMP, "run-api-test-backend-$([guid]::NewGuid().ToString()).ps1")
    
    @"
cd $PSScriptRoot\..
Write-Host "鍚姩鍚庣鏈嶅姟..."
cd backend
node simple-start.js
"@ | Out-File -FilePath $tempScript -Encoding utf8
    
    # 鍚姩鍚庣鏈嶅姟锛堟柊绐楀彛锛?
    Start-Process powershell -ArgumentList ("-ExecutionPolicy", "Bypass", "-NoProfile", "-File", "`"$tempScript`"") -WindowStyle Normal
    
    # 绛夊緟鏈嶅姟鍚姩
    Write-Host "绛夊緟鍚庣鏈嶅姟鍚姩..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $backendRunning = $false
    
    while (-not $backendRunning -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET -UseBasicParsing -TimeoutSec 1
            if ($response.StatusCode -eq 200) {
                $backendRunning = $true
                Write-Host "鉁?鍚庣鏈嶅姟宸插惎鍔? -ForegroundColor Green
            }
        } 
        catch {
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    
    if (-not $backendRunning) {
        Write-Host "`n鉂?鍚庣鏈嶅姟鍚姩澶辫触" -ForegroundColor Red
        exit 1
    }
}

# 杩愯API娴嬭瘯
Write-Host "`n杩愯API缁煎悎娴嬭瘯..." -ForegroundColor Cyan
node "$PSScriptRoot\run-api-tests.js"

# 瀹屾垚
Write-Host "`n娴嬭瘯瀹屾垚锛? -ForegroundColor Green

