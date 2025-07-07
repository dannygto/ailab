# Sync project to remote development machine
param(
    [switch]$Full = $false
)

$sourceDir = "d:\AICAMV2"
$remotePath = "~/AICAMV2"

# Ensure remote directory exists
Write-Host "Creating remote directory structure..." -ForegroundColor Cyan
ssh aicam-remote "mkdir -p $remotePath"

if ($Full) {
    # Full sync - excluding node_modules and other large directories
    Write-Host "Performing full project sync..." -ForegroundColor Cyan
    
    # Get all directories to create
    $dirs = Get-ChildItem -Path $sourceDir -Directory -Recurse | 
            Where-Object { 
                $_.FullName -notmatch 'node_modules' -and 
                $_.FullName -notmatch '\.git' -and
                $_.FullName -notmatch 'dist' -and
                $_.FullName -notmatch 'build'
            }
    
    # Create directory structure on remote server
    foreach ($dir in $dirs) {
        $relativePath = $dir.FullName.Substring($sourceDir.Length + 1)
        $remoteDir = "$remotePath/" + $relativePath.Replace('\', '/')
        ssh aicam-remote "mkdir -p '$remoteDir'"
    }
    
    # Get all files to sync
    $files = Get-ChildItem -Path $sourceDir -File -Recurse | 
            Where-Object { 
                $_.FullName -notmatch 'node_modules' -and 
                $_.FullName -notmatch '\.git' -and
                $_.FullName -notmatch 'dist' -and
                $_.FullName -notmatch 'build'
            }
} else {
    # Incremental sync - only source code and config files
    Write-Host "Performing incremental sync (source code and config files)..." -ForegroundColor Cyan
    
    # Get all directories to create
    $dirs = Get-ChildItem -Path $sourceDir -Directory -Recurse | 
            Where-Object { 
                $_.FullName -notmatch 'node_modules' -and 
                $_.FullName -notmatch '\.git' -and
                $_.FullName -notmatch 'dist' -and
                $_.FullName -notmatch 'build'
            }
    
    # Create directory structure on remote server
    foreach ($dir in $dirs) {
        $relativePath = $dir.FullName.Substring($sourceDir.Length + 1)
        $remoteDir = "$remotePath/" + $relativePath.Replace('\', '/')
        ssh aicam-remote "mkdir -p '$remoteDir'"
    }
    
    # Get only source code and config files
    $files = Get-ChildItem -Path $sourceDir -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.md,*.yml,*.yaml,*.html,*.css,*.scss,*.py,*.ps1 | 
            Where-Object { 
                $_.FullName -notmatch 'node_modules' -and 
                $_.FullName -notmatch '\.git' -and
                $_.FullName -notmatch 'dist' -and
                $_.FullName -notmatch 'build'
            }
}

# Sync files
$totalFiles = $files.Count
$currentFile = 0

Write-Host "Syncing $totalFiles files..." -ForegroundColor Cyan

foreach ($file in $files) {
    $currentFile++
    $relativePath = $file.FullName.Substring($sourceDir.Length + 1)
    $remoteFilePath = "$remotePath/" + $relativePath.Replace('\', '/')
    
    # Show progress
    $percentComplete = [math]::Round(($currentFile / $totalFiles) * 100)
    Write-Progress -Activity "Syncing files" -Status "Processing: $relativePath ($currentFile of $totalFiles)" -PercentComplete $percentComplete
    
    # Sync file
    scp "$($file.FullName)" "aicam-remote:$remoteFilePath"
}

Write-Progress -Activity "Syncing files" -Completed

Write-Host "Sync completed successfully!" -ForegroundColor Green
