# Fix AIChatInterface.tsx corrupted patterns

$filePath = "d:\AICAMV2\frontend\src\components\ai-assistant\AIChatInterface.tsx"

if (Test-Path $filePath) {
    Write-Host "Fixing AIChatInterface.tsx..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Replace all corrupted patterns
    $content = $content -replace 'ApiIconService', 'ApiService'
    $content = $content -replace 'localStorageIcon', 'localStorage'
    $content = $content -replace 'KeyboardEventIcon', 'KeyboardEvent'
    $content = $content -replace 'ChangeEventIcon', 'ChangeEvent'
    $content = $content -replace 'subTitleIcon2', 'subtitle2'
    $content = $content -replace 'EventIcon', 'Event'
    $content = $content -replace 'React.SyntheticEventIcon', 'React.SyntheticEvent'
    
    # Write the fixed content back
    Set-Content $filePath -Value $content -Encoding UTF8
    
    Write-Host "Fixed AIChatInterface.tsx"
} else {
    Write-Host "File not found: $filePath"
}
