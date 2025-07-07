# 馃殌 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 绠€鍖栨瀯寤烘鏌?

# 璁剧疆鎺у埗鍙扮紪鐮佷负UTF-8
# 编码设置已优化

Write-Host "馃殌 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 浠ｇ爜鏋勫缓妫€鏌? -ForegroundColor Cyan
Write-Host "鈴?寮€濮嬫椂闂? $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

$ErrorCount = 0
$SuccessCount = 0

# 妫€鏌ラ」鐩叧閿枃浠?
Write-Host "`n馃搳 妫€鏌ラ」鐩叧閿枃浠?.." -ForegroundColor Yellow

$keyFiles = @(
    "frontend/package.json",
    "backend/package.json", 
    "frontend/src/App.tsx",
    "backend/src/server.ts",
    "椤圭洰瀹屾垚搴︽€荤粨.md",
    "浠ｇ爜妯″潡瀹屾垚搴﹁鎯?md"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "鉁?$file" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "鉂?$file - 鏂囦欢涓嶅瓨鍦? -ForegroundColor Red
        $ErrorCount++
    }
}

# 妫€鏌ヤ緷璧栧畨瑁?
Write-Host "`n馃摝 妫€鏌ヤ緷璧栧畨瑁?.." -ForegroundColor Yellow

if (Test-Path "frontend/node_modules") {
    Write-Host "鉁?鍓嶇渚濊禆宸插畨瑁? -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "鈿狅笍  鍓嶇渚濊禆鏈畨瑁? -ForegroundColor Yellow
}

if (Test-Path "backend/node_modules") {
    Write-Host "鉁?鍚庣渚濊禆宸插畨瑁? -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "鈿狅笍  鍚庣渚濊禆鏈畨瑁? -ForegroundColor Yellow
}

# 妫€鏌ユ瀯寤轰骇鐗?
Write-Host "`n馃彈锔?妫€鏌ユ瀯寤轰骇鐗?.." -ForegroundColor Yellow

if (Test-Path "frontend/build") {
    Write-Host "鉁?鍓嶇鏋勫缓浜х墿瀛樺湪" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "鈿狅笍  鍓嶇鏋勫缓浜х墿涓嶅瓨鍦? -ForegroundColor Yellow
}

# 缁熻浠ｇ爜琛屾暟
Write-Host "`n馃搱 浠ｇ爜缁熻..." -ForegroundColor Yellow

$frontendFiles = Get-ChildItem -Path "frontend/src" -Recurse -Include "*.ts","*.tsx" | Where-Object { $_.Name -notlike "*.test.*" }
$backendFiles = Get-ChildItem -Path "backend/src" -Recurse -Include "*.ts","*.js" | Where-Object { $_.Name -notlike "*.test.*" }

if ($frontendFiles -and $backendFiles) {
    $frontendLines = ($frontendFiles | Get-Content | Measure-Object -Line).Lines
    $backendLines = ($backendFiles | Get-Content | Measure-Object -Line).Lines
    $totalLines = $frontendLines + $backendLines
    
    Write-Host "  鍓嶇浠ｇ爜琛屾暟: $frontendLines 琛? -ForegroundColor White
    Write-Host "  鍚庣浠ｇ爜琛屾暟: $backendLines 琛? -ForegroundColor White
    Write-Host "  鎬昏浠ｇ爜琛屾暟: $totalLines 琛? -ForegroundColor Cyan
    $SuccessCount++
}

# 妫€鏌ユ祴璇曟枃浠?
Write-Host "`n馃И 妫€鏌ユ祴璇曟枃浠?.." -ForegroundColor Yellow

$frontendTests = Get-ChildItem -Path "frontend/src" -Recurse -Include "*.test.*","*.spec.*"
$backendTests = Get-ChildItem -Path "backend" -Recurse -Include "*.test.*","*.spec.*"

if ($frontendTests) {
    Write-Host "鉁?鍓嶇娴嬭瘯鏂囦欢: $($frontendTests.Count) 涓? -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "鈿狅笍  鍓嶇娴嬭瘯鏂囦欢杈冨皯" -ForegroundColor Yellow
}

if ($backendTests) {
    Write-Host "鉁?鍚庣娴嬭瘯鏂囦欢: $($backendTests.Count) 涓? -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host "鈿狅笍  鍚庣娴嬭瘯鏂囦欢杈冨皯" -ForegroundColor Yellow
}

# 杈撳嚭鏈€缁堢粨鏋?
Write-Host "`n馃搳 妫€鏌ュ畬鎴愮粺璁?" -ForegroundColor Cyan
Write-Host "鉁?鎴愬姛椤圭洰: $SuccessCount" -ForegroundColor Green
Write-Host "鉂?闂椤圭洰: $ErrorCount" -ForegroundColor Red
Write-Host "鈴?缁撴潫鏃堕棿: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

if ($ErrorCount -eq 0) {
    Write-Host "`n馃帀 椤圭洰鐘舵€佽壇濂斤紒" -ForegroundColor Green
} else {
    Write-Host "`n鈿狅笍 椤圭洰瀛樺湪 $ErrorCount 涓棶棰橈紝寤鸿淇銆? -ForegroundColor Yellow
}

Write-Host "`n馃摑 璇︾粏淇℃伅璇锋煡鐪? 浠ｇ爜妯″潡瀹屾垚搴﹁鎯?md" -ForegroundColor Blue

