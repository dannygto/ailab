# Fix all corrupted icon imports in utils/icons.ts

$filePath = "d:\AICAMV2\frontend\src\utils\icons.ts"

if (Test-Path $filePath) {
    Write-Host "Fixing utils/icons.ts..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Replace all corrupted icon import patterns
    $content = $content -replace "from '@mui/icons-material/(\w+)Icon';", "from '@mui/icons-material/`$1';"
    $content = $content -replace "export \{ default as (\w+)IconIcon \}", "export { default as `$1Icon }"
    $content = $content -replace "export \{ default as (\w+)Icon \} from '@mui/icons-material/(\w+)Icon';", "export { default as `$1Icon } from '@mui/icons-material/`$2';"
    
    # Write the fixed content back
    Set-Content $filePath -Value $content -Encoding UTF8
    
    Write-Host "Fixed utils/icons.ts"
} else {
    Write-Host "File not found: $filePath"
}
