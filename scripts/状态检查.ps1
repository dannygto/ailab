Write-Host "浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 椤圭洰鐘舵€佹鏌? -ForegroundColor Cyan

$successCount = 0
$errorCount = 0

# 妫€鏌ュ叧閿枃浠?
$files = @("frontend/package.json", "backend/package.json", "frontend/src/App.tsx", "backend/src/server.ts")

Write-Host "`n鍏抽敭鏂囦欢妫€鏌?" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "鉁?$file" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "鉂?$file" -ForegroundColor Red
        $errorCount++
    }
}

# 妫€鏌ヤ緷璧?
Write-Host "`n渚濊禆妫€鏌?" -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "鉁?鍓嶇渚濊禆宸插畨瑁? -ForegroundColor Green
    $successCount++
} else {
    Write-Host "鈿狅笍  鍓嶇渚濊禆闇€瑕佸畨瑁? -ForegroundColor Yellow
}

if (Test-Path "backend/node_modules") {
    Write-Host "鉁?鍚庣渚濊禆宸插畨瑁? -ForegroundColor Green  
    $successCount++
} else {
    Write-Host "鈿狅笍  鍚庣渚濊禆闇€瑕佸畨瑁? -ForegroundColor Yellow
}

# 妫€鏌ユ瀯寤轰骇鐗?
Write-Host "`n鏋勫缓浜х墿妫€鏌?" -ForegroundColor Yellow
if (Test-Path "frontend/build") {
    Write-Host "鉁?鍓嶇宸叉瀯寤? -ForegroundColor Green
    $successCount++
} else {
    Write-Host "鈿狅笍  鍓嶇闇€瑕佹瀯寤? -ForegroundColor Yellow
}

# 缁熻缁撴灉
Write-Host "`n妫€鏌ョ粨鏋?" -ForegroundColor Cyan
Write-Host "鎴愬姛椤? $successCount" -ForegroundColor Green
Write-Host "閿欒椤? $errorCount" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host "鉁?椤圭洰鐘舵€佽壇濂? -ForegroundColor Green
} else {
    Write-Host "鈿狅笍  闇€瑕佷慨澶?$errorCount 涓棶棰? -ForegroundColor Yellow
}

