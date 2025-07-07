# Fix corrupted patterns in store/index.ts

$filePath = "d:\AICAMV2\frontend\src\store\index.ts"

if (Test-Path $filePath) {
    Write-Host "Fixing store/index.ts..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Replace all corrupted patterns
    $content = $content -replace 'ApiIconService', 'api'
    $content = $content -replace 'localStorageIcon', 'localStorage'
    $content = $content -replace 'EmailIconIcon', 'email'
    
    # Write the fixed content back
    Set-Content $filePath -Value $content -Encoding UTF8
    
    Write-Host "Fixed store/index.ts"
} else {
    Write-Host "File not found: $filePath"
}
