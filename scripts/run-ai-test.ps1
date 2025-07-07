# Run AI Test Script
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

Write-Host "姝ｅ湪杩愯AI娴嬭瘯..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 妫€鏌ュ悗绔湇鍔℃槸鍚﹀凡鍚姩
try {
    $backendStatus = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($backendStatus.StatusCode -eq 200) {
        Write-Host "鉁?鍚庣鏈嶅姟宸插惎鍔紝鐘舵€佹甯? -ForegroundColor Green
    }
} catch {
    Write-Host "鉂?鍚庣鏈嶅姟鏈惎鍔ㄦ垨鏃犲搷搴? -ForegroundColor Red
    Write-Host "璇峰厛鍚姩鍚庣鏈嶅姟锛岀劧鍚庡啀杩愯AI娴嬭瘯" -ForegroundColor Yellow
    Write-Host "鍙互浣跨敤浠诲姟 '3-鍚姩鍚庣' 鍚姩鍚庣鏈嶅姟" -ForegroundColor Yellow
    exit 1
}

# 杩愯AI娴嬭瘯
try {
    Set-Location $PSScriptRoot/..
    Write-Host "寮€濮嬭繍琛孉I娴嬭瘯..." -ForegroundColor Green
    node test-ai-complete.js
} catch {
    Write-Host "杩愯AI娴嬭瘯鏃跺嚭閿? $_" -ForegroundColor Red
    exit 1
}

