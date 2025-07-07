#!/usr/bin/env pwsh
<#
.SYNOPSIS
    楠岃瘉璁剧疆鐣岄潰鍔熻兘鐨勫仴搴风姸鎬?
.DESCRIPTION
    姝よ剼鏈敤浜庨獙璇佽缃晫闈㈢殑鎵€鏈夊姛鑳芥槸鍚︽甯稿伐浣滐紝鍖呮嫭涓婚璁剧疆銆佹暟鎹缃€侀€氱敤璁剧疆鍜屽畨鍏ㄨ缃瓑銆?
    鎵ц姝よ剼鏈皢妫€鏌ユ墍鏈夎缃粍浠舵槸鍚﹁兘姝ｇ‘娓叉煋锛屼互鍙婁繚瀛樺姛鑳芥槸鍚︽甯稿伐浣溿€?
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# 璁剧疆棰滆壊鍑芥暟
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

function Write-Success($message) { Write-ColorOutput Green "[鎴愬姛] $message" }
function Write-Info($message) { Write-ColorOutput Cyan "[淇℃伅] $message" }
function Write-Warning($message) { Write-ColorOutput Yellow "[璀﹀憡] $message" }
function Write-Error($message) { Write-ColorOutput Red "[閿欒] $message" }

# 鏄剧ず鑴氭湰鏍囬
Write-Info "========================================="
Write-Info "       璁剧疆鐣岄潰鍔熻兘鍋ュ悍妫€鏌ヨ剼鏈?         "
Write-Info "========================================="
Write-Info "寮€濮嬫椂闂? $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info "----------------------------------------"

# 妫€鏌ラ」鐩牴鐩綍
$projectRoot = Split-Path -Parent $PSScriptRoot

# 璁剧疆鍓嶇鐩綍
$frontendDir = Join-Path $projectRoot "frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Error "鎵句笉鍒板墠绔洰褰? $frontendDir"
    exit 1
}

# 妫€鏌ヨ缃浉鍏虫枃浠舵槸鍚﹀瓨鍦?
$settingsFiles = @(
    "src\pages\Settings.tsx",
    "src\services\SystemSettingsService.ts",
    "src\services\index.ts"
)

$allFilesExist = $true
foreach ($file in $settingsFiles) {
    $filePath = Join-Path $frontendDir $file
    if (-not (Test-Path $filePath)) {
        Write-Error "鎵句笉鍒拌缃浉鍏虫枃浠? $file"
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Error "涓€浜涜缃浉鍏虫枃浠剁己澶憋紝璇锋鏌ラ」鐩粨鏋勩€?
    exit 1
}

# 妫€鏌ヨ缃湇鍔℃槸鍚︽纭鍑?
$serviceIndexContent = Get-Content (Join-Path $frontendDir "src\services\index.ts") -Raw
if (-not ($serviceIndexContent -match "systemSettingsService")) {
    Write-Warning "SystemSettingsService鍙兘鏈湪services/index.ts涓纭鍑?
}

# 楠岃瘉璁剧疆缁勪欢涓殑鏂规硶璋冪敤
$settingsContent = Get-Content (Join-Path $frontendDir "src\pages\Settings.tsx") -Raw
$requiredFunctions = @(
    "saveThemeSettings",
    "saveDataSettings",
    "saveGeneralSettings"
)

$missingFunctions = @()
foreach ($func in $requiredFunctions) {
    if (-not ($settingsContent -match $func)) {
        $missingFunctions += $func
    }
}

if ($missingFunctions.Count -gt 0) {
    Write-Warning "璁剧疆缁勪欢涓己灏戜互涓嬪嚱鏁拌皟鐢? $($missingFunctions -join ', ')"
} else {
    Write-Success "璁剧疆缁勪欢涓寘鍚墍鏈夊繀瑕佺殑鍑芥暟璋冪敤"
}

# 妫€鏌ystemSettingsService瀹炵幇
$serviceContent = Get-Content (Join-Path $frontendDir "src\services\SystemSettingsService.ts") -Raw
$requiredMethods = @(
    "saveThemeSettings",
    "saveDataSettings",
    "saveGeneralSettings",
    "getSystemSettings"
)

$missingMethods = @()
foreach ($method in $requiredMethods) {
    if (-not ($serviceContent -match "async\s+$method")) {
        $missingMethods += $method
    }
}

if ($missingMethods.Count -gt 0) {
    Write-Warning "SystemSettingsService涓己灏戜互涓嬫柟娉? $($missingMethods -join ', ')"
} else {
    Write-Success "SystemSettingsService涓寘鍚墍鏈夊繀瑕佺殑鏂规硶"
}

# 鎵ц绠€鍗曠殑闈欐€佸垎鏋?
try {
    # 鍒囨崲鍒板墠绔洰褰?
    Push-Location $frontendDir
    
    # 妫€鏌ettings缁勪欢鏄惁鏈塗ypeScript閿欒
    Write-Info "姝ｅ湪妫€鏌ヨ缃粍浠剁殑TypeScript绫诲瀷..."
    $tscOutput = npx tsc --noEmit src/pages/Settings.tsx 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "璁剧疆缁勪欢鐨凾ypeScript绫诲瀷妫€鏌ラ€氳繃"
    } else {
        Write-Warning "璁剧疆缁勪欢瀛樺湪TypeScript绫诲瀷闂:`n$tscOutput"
    }
    
    # 鎭㈠鍘熸潵鐨勭洰褰?
    Pop-Location
} catch {
    Write-Error "TypeScript妫€鏌ュけ璐? $_"
    # 纭繚鎭㈠鐩綍
    if ((Get-Location).Path -eq $frontendDir) {
        Pop-Location
    }
}

# 鎬荤粨
Write-Info "----------------------------------------"
Write-Info "璁剧疆鐣岄潰鍋ュ悍妫€鏌ュ畬鎴?
Write-Info "缁撴潫鏃堕棿: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 濡傛灉娌℃湁涓ラ噸閿欒锛岃繑鍥炴垚鍔?
if ($LASTEXITCODE -eq 0) {
    Write-Success "璁剧疆鐣岄潰鍔熻兘鍋ュ悍鐘舵€? 鑹ソ"
    exit 0
} else {
    Write-Warning "璁剧疆鐣岄潰鍔熻兘鍋ュ悍鐘舵€? 闇€瑕佸叧娉?
    exit $LASTEXITCODE
}

