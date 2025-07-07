$ErrorActionPreference = "Stop"

Write-Host "璁剧疆鐣岄潰鍔熻兘鍋ュ悍妫€鏌? -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

# 妫€鏌ラ」鐩牴鐩綍
$projectRoot = "D:\AICAMV2"

# 璁剧疆鍓嶇鐩綍
$frontendDir = Join-Path $projectRoot "frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Host "鎵句笉鍒板墠绔洰褰? $frontendDir" -ForegroundColor Red
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
        Write-Host "鎵句笉鍒拌缃浉鍏虫枃浠? $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "涓€浜涜缃浉鍏虫枃浠剁己澶憋紝璇锋鏌ラ」鐩粨鏋勩€? -ForegroundColor Red
    exit 1
}

# 妫€鏌ヨ缃湇鍔℃槸鍚︽纭鍑?
$serviceIndexContent = Get-Content (Join-Path $frontendDir "src\services\index.ts") -Raw
if (-not ($serviceIndexContent -match "systemSettingsService")) {
    Write-Host "SystemSettingsService鍙兘鏈湪services/index.ts涓纭鍑? -ForegroundColor Yellow
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
    Write-Host "璁剧疆缁勪欢涓己灏戜互涓嬪嚱鏁拌皟鐢? $($missingFunctions -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "璁剧疆缁勪欢涓寘鍚墍鏈夊繀瑕佺殑鍑芥暟璋冪敤" -ForegroundColor Green
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
    Write-Host "SystemSettingsService涓己灏戜互涓嬫柟娉? $($missingMethods -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "SystemSettingsService涓寘鍚墍鏈夊繀瑕佺殑鏂规硶" -ForegroundColor Green
}

# 鎬荤粨
Write-Host "------------------------" -ForegroundColor Cyan
Write-Host "璁剧疆鐣岄潰鍋ュ悍妫€鏌ュ畬鎴? -ForegroundColor Cyan
Write-Host "璁剧疆鐣岄潰鍔熻兘鍋ュ悍鐘舵€? 鑹ソ" -ForegroundColor Green

