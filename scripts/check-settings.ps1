Write-Host "Checking Settings interface..." -ForegroundColor Cyan

# Frontend directory
$frontendDir = "D:\AICAMV2\frontend"

# Check files
$settingsFiles = @(
    "src\pages\Settings.tsx",
    "src\services\SystemSettingsService.ts"
)

foreach ($file in $settingsFiles) {
    $filePath = Join-Path $frontendDir $file
    if (Test-Path $filePath) {
        Write-Host "Found file: $file" -ForegroundColor Green
    } else {
        Write-Host "Missing file: $file" -ForegroundColor Red
    }
}

# Check key functions
$settingsPath = Join-Path $frontendDir "src\pages\Settings.tsx"
if (Test-Path $settingsPath) {
    $content = Get-Content $settingsPath -Raw
    if ($content -match "saveThemeSettings") {
        Write-Host "Found saveThemeSettings call" -ForegroundColor Green
    }
    if ($content -match "saveDataSettings") {
        Write-Host "Found saveDataSettings call" -ForegroundColor Green
    }
}

# Check service implementation
$servicePath = Join-Path $frontendDir "src\services\SystemSettingsService.ts"
if (Test-Path $servicePath) {
    $content = Get-Content $servicePath -Raw
    if ($content -match "async\s+saveThemeSettings") {
        Write-Host "Found saveThemeSettings method implementation" -ForegroundColor Green
    }
    if ($content -match "async\s+saveDataSettings") {
        Write-Host "Found saveDataSettings method implementation" -ForegroundColor Green
    }
}

Write-Host "Settings interface check completed" -ForegroundColor Cyan

