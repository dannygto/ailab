Write-Host "Starting cleanup of corrupted files..." -ForegroundColor Yellow

# List of corrupted files to remove
$filesToRemove = @(
    "src\__tests__\Button.test.tsx",
    "src\__tests__\Card.test.tsx",
    "src\components\ai-assistant\AIChatInterface.tsx",
    "src\features\licensing.tsx",
    "src\fixtures\devices.ts",
    "src\hooks\usePWA.ts",
    "src\pages\experiments\components\ExperimentDataPanel.tsx",
    "src\pages\experiments\ExperimentCreate.tsx",
    "src\pages\experiments\ExperimentCreateFinal.tsx",
    "src\pages\experiments\ExperimentCreateFixed.tsx",
    "src\pages\experiments\ExperimentCreateNew.tsx",
    "src\pages\Settings.tsx",
    "src\pages\templates\TemplateCreate.tsx",
    "src\services\base\apiService.ts"
)

# Remove corrupted files
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing: $file" -ForegroundColor Red
        Remove-Item $file -Force
    }
}

Write-Host "Cleanup complete!" -ForegroundColor Green
