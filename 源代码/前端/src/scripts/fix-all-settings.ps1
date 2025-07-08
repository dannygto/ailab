# Fix all corrupted settings files

$files = @(
    "d:\AICAMV2\frontend\src\pages\settings\ThemeSettings.tsx",
    "d:\AICAMV2\frontend\src\pages\settings\DataSettings.tsx",
    "d:\AICAMV2\frontend\src\pages\settings\SecuritySettings.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        Write-Host "Fixing $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace all corrupted patterns
        $content = $content -replace 'ThemeSettingsIcon', 'ThemeSettings'
        $content = $content -replace 'DataSettingsIcon', 'DataSettings'
        $content = $content -replace 'SecuritySettingsIcon', 'SecuritySettings'
        $content = $content -replace 'themeSettingsIcon', 'themeSettings'
        $content = $content -replace 'setThemeSettingsIcon', 'setThemeSettings'
        $content = $content -replace 'dataSettingsIcon', 'dataSettings'
        $content = $content -replace 'setDataSettingsIcon', 'setDataSettings'
        $content = $content -replace 'securitySettingsIcon', 'securitySettings'
        $content = $content -replace 'setSecuritySettingsIcon', 'setSecuritySettings'
        $content = $content -replace 'CheckIconed', 'checked'
        $content = $content -replace 'SettingsIcon', 'settings'
        $content = $content -replace 'localStorageIcon', 'localStorage'
        $content = $content -replace 'EventIcon', 'event'
        $content = $content -replace 'React.SyntheticEventIcon', 'React.SyntheticEvent'
        $content = $content -replace 'React.ChangeEventIcon', 'React.ChangeEvent'
        
        # Write the fixed content back
        Set-Content $filePath -Value $content -Encoding UTF8
        
        Write-Host "Fixed $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "All settings files fixed!"
