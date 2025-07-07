# 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 椤圭洰鐘舵€佹鏌ヨ剼鏈?
# 鐢熸垚鏃堕棿锛?025骞?鏈?6鏃?

Write-Host "馃攳 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 椤圭洰鐘舵€佹鏌? -ForegroundColor Cyan
Write-Host "=" * 50

$projectRoot = "d:\AICAMV2"
Set-Location $projectRoot

Write-Host "馃搨 椤圭洰鏍圭洰褰? $projectRoot" -ForegroundColor Green

# 1. 妫€鏌ュ墠绔姸鎬?
Write-Host "`n馃帹 鍓嶇鐘舵€佹鏌?" -ForegroundColor Yellow
if (Test-Path "$projectRoot\frontend\package.json") {
    Write-Host "  鉁?鍓嶇package.json瀛樺湪" -ForegroundColor Green
    $frontendBuild = Test-Path "$projectRoot\frontend\build"
    if ($frontendBuild) {
        Write-Host "  鉁?鍓嶇鏋勫缓鏂囦欢瀛樺湪" -ForegroundColor Green
    } else {
        Write-Host "  鈿狅笍  鍓嶇鏋勫缓鏂囦欢涓嶅瓨鍦? -ForegroundColor Yellow
    }
} else {
    Write-Host "  鉂?鍓嶇package.json涓嶅瓨鍦? -ForegroundColor Red
}

# 2. 妫€鏌ュ悗绔姸鎬? 
Write-Host "`n鈿欙笍 鍚庣鐘舵€佹鏌?" -ForegroundColor Yellow
if (Test-Path "$projectRoot\backend\package.json") {
    Write-Host "  鉁?鍚庣package.json瀛樺湪" -ForegroundColor Green
    $backendSrc = Test-Path "$projectRoot\backend\src"
    if ($backendSrc) {
        Write-Host "  鉁?鍚庣婧愮爜鐩綍瀛樺湪" -ForegroundColor Green
    } else {
        Write-Host "  鈿狅笍  鍚庣婧愮爜鐩綍涓嶅瓨鍦? -ForegroundColor Yellow
    }
} else {
    Write-Host "  鉂?鍚庣package.json涓嶅瓨鍦? -ForegroundColor Red
}

# 3. 妫€鏌ユ祴璇曟枃浠?
Write-Host "`n馃И 娴嬭瘯鏂囦欢妫€鏌?" -ForegroundColor Yellow
$frontendTests = Get-ChildItem -Path "$projectRoot\frontend" -Filter "*test*" -Recurse | Measure-Object | Select-Object -ExpandProperty Count
$backendTests = Get-ChildItem -Path "$projectRoot\backend" -Filter "*test*" -Recurse | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "  馃帹 鍓嶇娴嬭瘯鏂囦欢鏁伴噺: $frontendTests" -ForegroundColor Green
Write-Host "  鈿欙笍 鍚庣娴嬭瘯鏂囦欢鏁伴噺: $backendTests" -ForegroundColor Green

# 4. 妫€鏌ユ枃妗ｆ枃浠?
Write-Host "`n馃摎 鏂囨。鏂囦欢妫€鏌?" -ForegroundColor Yellow
$docCount = Get-ChildItem -Path "$projectRoot" -Filter "*.md" | Measure-Object | Select-Object -ExpandProperty Count
$docsFolder = Get-ChildItem -Path "$projectRoot\docs" -Filter "*.md" | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "  馃搫 鏍圭洰褰昅arkdown鏂囨。: $docCount" -ForegroundColor Green
Write-Host "  馃搧 docs鐩綍鏂囨。: $docsFolder" -ForegroundColor Green

# 5. 妫€鏌WA鏂囦欢
Write-Host "`n馃摫 PWA鏂囦欢妫€鏌?" -ForegroundColor Yellow
$manifestExists = Test-Path "$projectRoot\frontend\public\manifest.json"
$swExists = Test-Path "$projectRoot\frontend\public\sw.js"
if ($manifestExists) {
    Write-Host "  鉁?manifest.json瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?manifest.json涓嶅瓨鍦? -ForegroundColor Red
}
if ($swExists) {
    Write-Host "  鉁?Service Worker瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?Service Worker涓嶅瓨鍦? -ForegroundColor Red
}

# 6. 妫€鏌ypeScript閰嶇疆
Write-Host "`n馃摑 TypeScript閰嶇疆妫€鏌?" -ForegroundColor Yellow
$frontendTsConfig = Test-Path "$projectRoot\frontend\tsconfig.json"
$backendTsConfig = Test-Path "$projectRoot\backend\tsconfig.json"
if ($frontendTsConfig) {
    Write-Host "  鉁?鍓嶇TypeScript閰嶇疆瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍓嶇TypeScript閰嶇疆涓嶅瓨鍦? -ForegroundColor Red
}
if ($backendTsConfig) {
    Write-Host "  鉁?鍚庣TypeScript閰嶇疆瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?鍚庣TypeScript閰嶇疆涓嶅瓨鍦? -ForegroundColor Red
}

# 7. 椤圭洰瑙勬ā缁熻
Write-Host "`n馃搳 椤圭洰瑙勬ā缁熻:" -ForegroundColor Yellow
try {
    $allFiles = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object { $_.Extension -match '\.(js|ts|tsx|jsx|json|md)$' }
    $jsFiles = $allFiles | Where-Object { $_.Extension -match '\.(js|jsx)$' } | Measure-Object | Select-Object -ExpandProperty Count
    $tsFiles = $allFiles | Where-Object { $_.Extension -match '\.(ts|tsx)$' } | Measure-Object | Select-Object -ExpandProperty Count
    $jsonFiles = $allFiles | Where-Object { $_.Extension -eq '.json' } | Measure-Object | Select-Object -ExpandProperty Count
    $mdFiles = $allFiles | Where-Object { $_.Extension -eq '.md' } | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host "  馃搳 JavaScript/JSX鏂囦欢: $jsFiles" -ForegroundColor Cyan
    Write-Host "  馃搳 TypeScript/TSX鏂囦欢: $tsFiles" -ForegroundColor Cyan
    Write-Host "  馃搳 JSON閰嶇疆鏂囦欢: $jsonFiles" -ForegroundColor Cyan
    Write-Host "  馃搳 Markdown鏂囨。: $mdFiles" -ForegroundColor Cyan
    Write-Host "  馃搳 鎬昏鏍稿績鏂囦欢: $($jsFiles + $tsFiles + $jsonFiles + $mdFiles)" -ForegroundColor Green
} catch {
    Write-Host "  鈿狅笍 鏃犳硶缁熻鏂囦欢鏁伴噺: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 8. 鍏抽敭鍔熻兘妯″潡妫€鏌?
Write-Host "`n馃彈锔?鍏抽敭鍔熻兘妯″潡妫€鏌?" -ForegroundColor Yellow

# 妫€鏌ュ墠绔叧閿粍浠?
$dashboardExists = Test-Path "$projectRoot\frontend\src\pages\Dashboard.tsx"
$deviceMgmtExists = Test-Path "$projectRoot\frontend\src\pages\DeviceManagement.tsx"

if ($dashboardExists) {
    Write-Host "  鉁?Dashboard椤甸潰缁勪欢瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?Dashboard椤甸潰缁勪欢涓嶅瓨鍦? -ForegroundColor Red
}

if ($deviceMgmtExists) {
    Write-Host "  鉁?璁惧绠＄悊椤甸潰缁勪欢瀛樺湪" -ForegroundColor Green
} else {
    Write-Host "  鉂?璁惧绠＄悊椤甸潰缁勪欢涓嶅瓨鍦? -ForegroundColor Red
}

# 9. 鎬讳綋瀹屾垚搴﹁瘎浼?
Write-Host "`n馃幆 椤圭洰瀹屾垚搴﹁瘎浼?" -ForegroundColor Yellow
$score = 0
$maxScore = 10

if ($frontendBuild) { $score += 1 }
if ($backendSrc) { $score += 1 }
if ($frontendTests -gt 0) { $score += 1 }
if ($backendTests -gt 0) { $score += 1 }
if ($manifestExists -and $swExists) { $score += 1 }
if ($frontendTsConfig -and $backendTsConfig) { $score += 1 }
if ($docCount -gt 5) { $score += 1 }
if ($tsFiles -gt 50) { $score += 1 }
if ($dashboardExists -and $deviceMgmtExists) { $score += 1 }
if ($jsFiles + $tsFiles -gt 100) { $score += 1 }

$percentage = [math]::Round(($score / $maxScore) * 100, 1)

Write-Host "  馃弳 椤圭洰瀹屾垚搴? $percentage% ($score/$maxScore)" -ForegroundColor $(if ($percentage -ge 90) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" })

if ($percentage -ge 90) {
    Write-Host "`n馃帀 鎭枩锛侀」鐩凡鍩烘湰瀹屾垚锛屽彲浠ヨ繘鍏ュ彂甯冨噯澶囬樁娈点€? -ForegroundColor Green
} elseif ($percentage -ge 70) {
    Write-Host "`n馃憤 椤圭洰杩涘睍鑹ソ锛岃繕鏈変竴浜涘姛鑳介渶瑕佸畬鍠勩€? -ForegroundColor Yellow
} else {
    Write-Host "`n鈿狅笍 椤圭洰杩橀渶瑕佸ぇ閲忓伐浣滄墠鑳藉畬鎴愩€? -ForegroundColor Red
}

Write-Host "`n鉁?妫€鏌ュ畬鎴愶紒" -ForegroundColor Cyan
Write-Host "馃搮 妫€鏌ユ椂闂? $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

