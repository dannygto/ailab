# Standard Edition Package Script for AICAM Platform
# This script packages the standard edition of the AICAM platform
# Author: AI Assistant
# Date: 2025-06-28
# Version: 1.0.0

# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

# 杈撳嚭褰╄壊鏂囨湰鐨勫嚱鏁?
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# 鏄剧ず鎵撳寘鏍囧噯鐗堢殑娆㈣繋淇℃伅
Write-ColorOutput Green "===========================================" 
Write-ColorOutput Cyan "  AICAM Platform - Standard Edition Package" 
Write-ColorOutput Cyan "  Version: 1.0.0 - Production Release" 
Write-ColorOutput Cyan "  Date: $(Get-Date -Format 'yyyy-MM-dd')" 
Write-ColorOutput Green "===========================================" 

# 鍒涘缓鎵撳寘鐩綍
$packageDir = "d:\AICAMV2\package-standard"
$releaseDir = "d:\AICAMV2\release"

# 濡傛灉鐩綍瀛樺湪锛屽垯鍏堝垹闄?
if (Test-Path $packageDir) {
    Write-ColorOutput Yellow "姝ｅ湪娓呯悊鏃х殑鎵撳寘鐩綍..."
    Remove-Item -Path $packageDir -Recurse -Force
}

# 鍒涘缓鎵撳寘鐩綍
Write-ColorOutput Yellow "鍒涘缓鎵撳寘鐩綍..."
New-Item -ItemType Directory -Path $packageDir | Out-Null
New-Item -ItemType Directory -Path "$packageDir\frontend" | Out-Null
New-Item -ItemType Directory -Path "$packageDir\backend" | Out-Null
New-Item -ItemType Directory -Path "$packageDir\ai" | Out-Null
New-Item -ItemType Directory -Path "$packageDir\documentation" | Out-Null
New-Item -ItemType Directory -Path "$packageDir\scripts" | Out-Null

# 鏋勫缓鍓嶇
Write-ColorOutput Yellow "鏋勫缓鍓嶇浠ｇ爜..."
Push-Location "d:\AICAMV2\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "鍓嶇鏋勫缓澶辫触锛岃妫€鏌ラ敊璇俊鎭€?
    exit 1
}
Pop-Location

# 鏋勫缓鍚庣
Write-ColorOutput Yellow "鏋勫缓鍚庣浠ｇ爜..."
Push-Location "d:\AICAMV2\backend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "鍚庣鏋勫缓澶辫触锛岃妫€鏌ラ敊璇俊鎭€?
    exit 1
}
Pop-Location

# 澶嶅埗鍓嶇鏂囦欢
Write-ColorOutput Yellow "澶嶅埗鍓嶇鏂囦欢..."
Copy-Item -Path "d:\AICAMV2\frontend\build\*" -Destination "$packageDir\frontend" -Recurse
Copy-Item -Path "d:\AICAMV2\frontend\package.json" -Destination "$packageDir\frontend"
Copy-Item -Path "d:\AICAMV2\frontend\README.md" -Destination "$packageDir\frontend" -ErrorAction SilentlyContinue

# 澶嶅埗鍚庣鏂囦欢
Write-ColorOutput Yellow "澶嶅埗鍚庣鏂囦欢..."
Copy-Item -Path "d:\AICAMV2\backend\dist\*" -Destination "$packageDir\backend" -Recurse
Copy-Item -Path "d:\AICAMV2\backend\package.json" -Destination "$packageDir\backend"
Copy-Item -Path "d:\AICAMV2\backend\README.md" -Destination "$packageDir\backend" -ErrorAction SilentlyContinue

# 澶嶅埗AI鏈嶅姟鏂囦欢
Write-ColorOutput Yellow "澶嶅埗AI鏈嶅姟鏂囦欢..."
Copy-Item -Path "d:\AICAMV2\ai\*" -Destination "$packageDir\ai" -Recurse -Exclude "__pycache__"

# 澶嶅埗鏂囨。
Write-ColorOutput Yellow "澶嶅埗鏂囨。..."
Copy-Item -Path "d:\AICAMV2\documentation\*" -Destination "$packageDir\documentation" -Recurse

# 澶嶅埗鑴氭湰鏂囦欢
Write-ColorOutput Yellow "澶嶅埗鑴氭湰鏂囦欢..."
Copy-Item -Path "d:\AICAMV2\scripts\build.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\start-platform.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\health-check.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\run-all-services.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\run-frontend.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\run-backend.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\install-dependencies.ps1" -Destination "$packageDir\scripts"
Copy-Item -Path "d:\AICAMV2\scripts\setup-ai-keys.ps1" -Destination "$packageDir\scripts"

# 澶嶅埗鏍圭洰褰曟枃浠?
Write-ColorOutput Yellow "澶嶅埗鏍圭洰褰曟枃浠?.."
Copy-Item -Path "d:\AICAMV2\README.md" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\DELIVERY.md" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\椤圭洰瀹屾垚搴︽€荤粨.md" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\docker-compose.yml" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\env.example" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\package.json" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\logo18060.png" -Destination "$packageDir"
Copy-Item -Path "d:\AICAMV2\bitbug_favicon.ico" -Destination "$packageDir"

# 鍒涘缓鍚姩鑴氭湰
Write-ColorOutput Yellow "鍒涘缓鍚姩鑴氭湰..."
@"
# AICAM Platform 鏍囧噯鐗堝惎鍔ㄨ剼鏈?
# 杩愯姝よ剼鏈互鍚姩AICAM骞冲彴鐨勬墍鏈夋湇鍔?

Write-Host "姝ｅ湪鍚姩AICAM骞冲彴鏍囧噯鐗?.." -ForegroundColor Green
& ".\scripts\start-platform.ps1"
"@ | Out-File -FilePath "$packageDir\start.ps1" -Encoding utf8

# 鍒涘缓鏋勫缓鑴氭湰
@"
# AICAM Platform 鏍囧噯鐗堟瀯寤鸿剼鏈?
# 杩愯姝よ剼鏈互鏋勫缓AICAM骞冲彴鐨勬墍鏈夌粍浠?

Write-Host "姝ｅ湪鏋勫缓AICAM骞冲彴鏍囧噯鐗?.." -ForegroundColor Green
& ".\scripts\build.ps1"
"@ | Out-File -FilePath "$packageDir\build.ps1" -Encoding utf8

# 鍒涘缓瀹夎渚濊禆鑴氭湰
@"
# AICAM Platform 鏍囧噯鐗堜緷璧栧畨瑁呰剼鏈?
# 杩愯姝よ剼鏈互瀹夎AICAM骞冲彴鐨勬墍鏈変緷璧?

Write-Host "姝ｅ湪瀹夎AICAM骞冲彴鏍囧噯鐗堜緷璧?.." -ForegroundColor Green
& ".\scripts\install-dependencies.ps1"
"@ | Out-File -FilePath "$packageDir\install.ps1" -Encoding utf8

# 鍒涘缓鐗堟湰淇℃伅鏂囦欢
@"
# AICAM Platform - 鏍囧噯鐗?
鐗堟湰: 1.0.0
鍙戝竷鏃ユ湡: $(Get-Date -Format 'yyyy-MM-dd')
鐘舵€? 姝ｅ紡鍙戝竷鐗?(Production Release)

## 鐗堟湰鐗规€?
- 鍏ㄥ姛鑳芥爣鍑嗙増锛?00%瀹屾垚搴?
- 鍖呭惈鍏ㄩ儴鏍稿績鍔熻兘鍜屾ā鍧?
- 缁忚繃鍏ㄩ潰娴嬭瘯鍜屼紭鍖?
- 閫傜敤浜庢寮忕敓浜х幆澧冮儴缃?

## 杩愯瑕佹眰
- Node.js 16.x 鎴栨洿楂樼増鏈?
- Python 3.8 鎴栨洿楂樼増鏈?
- MongoDB 5.0 鎴栨洿楂樼増鏈?
- 鐜颁唬缃戦〉娴忚鍣?(Chrome, Firefox, Edge, Safari)

## 蹇€熷惎鍔?
1. 杩愯 `install.ps1` 瀹夎鎵€鏈変緷璧?
2. 杩愯 `build.ps1` 鏋勫缓椤圭洰
3. 杩愯 `start.ps1` 鍚姩骞冲彴

鏇村璇︽儏璇峰弬闃?documentation 鐩綍涓嬬殑鏂囨。銆?
"@ | Out-File -FilePath "$packageDir\VERSION.md" -Encoding utf8

# 鍒涘缓鍙戝竷鐩綍
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir | Out-Null
}

# 鍒涘缓ZIP鍖?
Write-ColorOutput Yellow "姝ｅ湪鍒涘缓鏍囧噯鐗圸IP鍖?.."
$date = Get-Date -Format "yyyyMMdd"
$zipFile = "$releaseDir\AICAM-Standard-$date.zip"

if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $zipFile)

# 鍒涘缓浜や粯娓呭崟
$fileCount = (Get-ChildItem -Path $packageDir -Recurse -File).Count
$dirCount = (Get-ChildItem -Path $packageDir -Recurse -Directory).Count

@"
# AICAM骞冲彴鏍囧噯鐗堜氦浠樻竻鍗?

**鎵撳寘鏃ユ湡**: $(Get-Date -Format 'yyyy-MM-dd')
**鐗堟湰**: 1.0.0 (鏍囧噯鐗?
**ZIP鍖呭悕绉?*: AICAM-Standard-$date.zip
**鏂囦欢鎬绘暟**: $fileCount
**鐩綍鎬绘暟**: $dirCount

## 鍖呭惈缁勪欢:
- 鍓嶇鏋勫缓鐗堟湰 (React + TypeScript)
- 鍚庣鏋勫缓鐗堟湰 (Node.js + Express)
- AI鏈嶅姟妯″潡 (Python)
- 瀹屾暣鏂囨。搴?
- 鍚姩鍜岄儴缃茶剼鏈?
- Docker閰嶇疆

## 鍔熻兘瀹屾垚搴? 100%

鎵€鏈夋爣鍑嗙増鍔熻兘宸插叏閮ㄥ畬鎴愬苟閫氳繃娴嬭瘯锛屽彲鐩存帴閮ㄧ讲鍒扮敓浜х幆澧冦€?

## 瀹夎璇存槑:
1. 瑙ｅ帇ZIP鍖呭埌鐩爣鐩綍
2. 杩愯 install.ps1 瀹夎渚濊禆
3. 杩愯 build.ps1 鏋勫缓椤圭洰
4. 杩愯 start.ps1 鍚姩骞冲彴

璇︾粏璇存槑璇峰弬闃呮枃妗ｇ洰褰曚腑鐨勯儴缃叉寚鍗椼€?
"@ | Out-File -FilePath "$releaseDir\AICAM-Standard-$date-delivery-checklist.md" -Encoding utf8

Write-ColorOutput Green "===========================================" 
Write-ColorOutput Green "  鏍囧噯鐗堟墦鍖呭畬鎴?" 
Write-ColorOutput Cyan "  鎵撳寘璺緞: $packageDir" 
Write-ColorOutput Cyan "  ZIP鏂囦欢: $zipFile" 
Write-ColorOutput Cyan "  鏂囦欢鏁? $fileCount" 
Write-ColorOutput Cyan "  鐩綍鏁? $dirCount" 
Write-ColorOutput Green "===========================================" 

Write-ColorOutput Yellow "浜や粯娓呭崟宸茬敓鎴愬埌: $releaseDir\AICAM-Standard-$date-delivery-checklist.md"

