# Fix all corrupted component names in settings files

$files = @(
    "d:\AICAMV2\frontend\src\pages\Settings.tsx",
    "d:\AICAMV2\frontend\src\pages\settings\GeneralSettings.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        Write-Host "Fixing $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace all corrupted component names
        $content = $content -replace 'GeneralSettingsIcon', 'GeneralSettings'
        $content = $content -replace 'const GeneralSettings: React.FC', 'const GeneralSettings: React.FC'
        $content = $content -replace 'saveGeneralSettingsIcon', 'saveGeneralSettings'
        $content = $content -replace 'SettingsIcon', 'settings'
        $content = $content -replace 'EventIcon', 'event'
        $content = $content -replace 'React.SyntheticEventIcon', 'React.SyntheticEvent'
        
        # Write the fixed content back
        Set-Content $filePath -Value $content -Encoding UTF8
        
        Write-Host "Fixed $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "All settings files fixed!"
