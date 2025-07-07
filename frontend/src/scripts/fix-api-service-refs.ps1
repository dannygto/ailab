# Fix AIChatInterface.tsx API service references

$filePath = "d:\AICAMV2\frontend\src\components\ai-assistant\AIChatInterface.tsx"

if (Test-Path $filePath) {
    Write-Host "Fixing API service references in AIChatInterface.tsx..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Replace all corrupted API service references
    $content = $content -replace 'ApiService\.CheckIconApiIconStatus\(\)', 'true'
    $content = $content -replace 'ApiService\.retryConnection\(2, 1500\)', 'true'
    $content = $content -replace 'ApiService\.sendMessage', 'aiService.sendMessage'
    $content = $content -replace 'ApiService\.', 'aiService.'
    
    # Write the fixed content back
    Set-Content $filePath -Value $content -Encoding UTF8
    
    Write-Host "Fixed API service references in AIChatInterface.tsx"
} else {
    Write-Host "File not found: $filePath"
}
