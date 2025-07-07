Write-Host "妫€鏌ヨ缃晫闈㈠姛鑳?.." -ForegroundColor Cyan

# 璁剧疆鍓嶇鐩綍
$frontendDir = "D:\AICAMV2\frontend"

# 妫€鏌ユ枃浠舵槸鍚﹀瓨鍦?
$settingsFiles = @(
    "src\pages\Settings.tsx",
    "src\services\SystemSettingsService.ts"
)

foreach ($file in $settingsFiles) {
    $filePath = Join-Path $frontendDir $file
    if (Test-Path $filePath) {
        Write-Host "鎵惧埌鏂囦欢: $file" -ForegroundColor Green
    } else {
        Write-Host "鎵句笉鍒版枃浠? $file" -ForegroundColor Red
    }
}

# 妫€鏌ュ叧閿嚱鏁?
$settingsPath = Join-Path $frontendDir "src\pages\Settings.tsx"
if (Test-Path $settingsPath) {
    $content = Get-Content $settingsPath -Raw
    if ($content -match "saveThemeSettings") {
        Write-Host "鍙戠幇saveThemeSettings璋冪敤" -ForegroundColor Green
    }
    if ($content -match "saveDataSettings") {
        Write-Host "鍙戠幇saveDataSettings璋冪敤" -ForegroundColor Green
    }
}

# 妫€鏌ユ湇鍔″疄鐜?
$servicePath = Join-Path $frontendDir "src\services\SystemSettingsService.ts"
if (Test-Path $servicePath) {
    $content = Get-Content $servicePath -Raw
    if ($content -match "async\s+saveThemeSettings") {
        Write-Host "鍙戠幇saveThemeSettings鏂规硶瀹炵幇" -ForegroundColor Green
    }
    if ($content -match "async\s+saveDataSettings") {
        Write-Host "鍙戠幇saveDataSettings鏂规硶瀹炵幇" -ForegroundColor Green
    }
}

Write-Host "璁剧疆鐣岄潰鍔熻兘妫€鏌ュ畬鎴? -ForegroundColor Cyan

