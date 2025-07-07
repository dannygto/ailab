# Fix common icon import errors
$ErrorActionPreference = "Continue"

$frontendSrc = "d:\AICAMV2\frontend\src"

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path $frontendSrc -Recurse -Include "*.tsx", "*.ts" -Exclude "node_modules", "*.d.ts"

$modifiedFiles = 0

Write-Host "Starting to fix icon import errors..." -ForegroundColor Green

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Fix common icon name issues
        $content = $content -replace 'RefreshIconIcon', 'RefreshIcon'
        $content = $content -replace 'SettingsIconIcon', 'SettingsIcon'
        $content = $content -replace 'PauseIconIcon', 'PauseIcon'
        $content = $content -replace 'StopIconIcon', 'StopIcon'
        $content = $content -replace 'AdminPanelSettingsIconIcon', 'AdminPanelSettingsIcon'
        
        # Fix theme palette references
        $content = $content -replace 'theme\.PaletteIcon\.', 'theme.palette.'
        
        # Fix component prop issues
        $content = $content -replace 'component="LabelIcon"', 'component="label"'
        
        # Fix event method names
        $content = $content -replace '\.StopIconPropagation\(\)', '.stopPropagation()'
        $content = $content -replace '\.StopIconExperiment\(', '.stopExperiment('
        $content = $content -replace '\.SendIcon\(', '.send('
        
        # Fix status comparisons
        $content = $content -replace '''PauseIcond''', "'paused'"
        
        # Fix object property names
        $content = $content -replace '\.LabelIcon:', '.label:'
        $content = $content -replace 'LabelIcon:', 'label:'
        $content = $content -replace '\.CategoryIcon', '.category'
        $content = $content -replace 'CategoryIcon:', 'category:'
        
        # Fix module paths
        $content = $content -replace '/DevicesIcon''', "/devices'"
        $content = $content -replace '/SettingsIcon/', '/settings/'
        $content = $content -replace '''StorageIcon''', "'storage'"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $modifiedFiles++
            Write-Host "Modified: $($file.FullName)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Warning "Error processing $($file.FullName): $($_.Exception.Message)"
    }
}

Write-Host "Batch fix completed! Modified $modifiedFiles files" -ForegroundColor Green
