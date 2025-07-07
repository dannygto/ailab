Write-Host "馃攳 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 椤圭洰鐘舵€佹鏌? -ForegroundColor Cyan
Write-Host "=" * 50

$projectRoot = "d:\AICAMV2"
Set-Location $projectRoot

Write-Host "馃搨 椤圭洰鏍圭洰褰? $projectRoot" -ForegroundColor Green

# 妫€鏌ュ叧閿枃浠?
Write-Host "`n馃搫 鍏抽敭鏂囦欢妫€鏌?" -ForegroundColor Yellow

$frontendPackage = Test-Path "$projectRoot\frontend\package.json"
$backendPackage = Test-Path "$projectRoot\backend\package.json"
$manifestFile = Test-Path "$projectRoot\frontend\public\manifest.json"
$serviceWorker = Test-Path "$projectRoot\frontend\public\sw.js"

if ($frontendPackage) {
    Write-Host "  鉁?鍓嶇package.json瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍓嶇package.json涓嶅瓨鍦? -ForegroundColor Red
}

if ($backendPackage) {
    Write-Host "  鉁?鍚庣package.json瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍚庣package.json涓嶅瓨鍦? -ForegroundColor Red
}

if ($manifestFile) {
    Write-Host "  鉁?PWA manifest.json瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?PWA manifest.json涓嶅瓨鍦? -ForegroundColor Red
}

if ($serviceWorker) {
    Write-Host "  鉁?Service Worker瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?Service Worker涓嶅瓨鍦? -ForegroundColor Red
}

# 缁熻鏂囦欢鏁伴噺
Write-Host "`n馃搳 椤圭洰瑙勬ā:" -ForegroundColor Yellow
try {
    $mdFiles = (Get-ChildItem -Path $projectRoot -Filter "*.md" -Recurse).Count
    $jsFiles = (Get-ChildItem -Path $projectRoot -Filter "*.js" -Recurse).Count
    $tsFiles = (Get-ChildItem -Path $projectRoot -Filter "*.ts*" -Recurse).Count
    
    Write-Host "  馃摑 Markdown鏂囨。: $mdFiles" -ForegroundColor Cyan
    Write-Host "  馃摐 JavaScript鏂囦欢: $jsFiles" -ForegroundColor Cyan
    Write-Host "  馃搫 TypeScript鏂囦欢: $tsFiles" -ForegroundColor Cyan
} catch {
    Write-Host "  鈿狅笍 鏃犳硶缁熻鏂囦欢" -ForegroundColor Yellow
}

# 妫€鏌ユ祴璇曟枃浠?
Write-Host "`n馃И 娴嬭瘯妫€鏌?" -ForegroundColor Yellow
$frontendJest = Test-Path "$projectRoot\frontend\jest.config.js"
$backendJest = Test-Path "$projectRoot\backend\jest.config.js"
$frontendSetup = Test-Path "$projectRoot\frontend\src\setupTests.ts"
$backendSetup = Test-Path "$projectRoot\backend\src\setupTests.ts"

if ($frontendJest) {
    Write-Host "  鉁?鍓嶇Jest閰嶇疆瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍓嶇Jest閰嶇疆涓嶅瓨鍦? -ForegroundColor Red
}

if ($backendJest) {
    Write-Host "  鉁?鍚庣Jest閰嶇疆瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍚庣Jest閰嶇疆涓嶅瓨鍦? -ForegroundColor Red
}

# 椤圭洰瀹屾垚搴﹁瘎浼?
Write-Host "`n馃幆 椤圭洰瀹屾垚搴﹁瘎浼?" -ForegroundColor Yellow
$score = 0
if ($frontendPackage) { $score++ }
if ($backendPackage) { $score++ }
if ($manifestFile) { $score++ }
if ($serviceWorker) { $score++ }
if ($frontendJest) { $score++ }
if ($backendJest) { $score++ }
if ($mdFiles -gt 10) { $score++ }
if ($tsFiles -gt 30) { $score++ }

$percentage = [math]::Round(($score / 8) * 100, 1)

Write-Host "  馃弳 瀹屾垚搴? $percentage% ($score/8)" -ForegroundColor Green

Write-Host "`n鉁?妫€鏌ュ畬鎴愶紒" -ForegroundColor Cyan
Write-Host "馃搮 妫€鏌ユ椂闂? $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

