# Fix icon imports script
Write-Host "Fixing icon imports..." -ForegroundColor Yellow

# Get all TypeScript and TSX files
$files = Get-ChildItem -Path "D:\AICAMV2\frontend\src" -Include "*.ts", "*.tsx" -Recurse

$modifiedFiles = 0
$totalFiles = $files.Count

Write-Host "Found $totalFiles files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    # Fix common icon import patterns
    $patterns = @{
        "Add as AddIcon" = "AddIcon as AddIcon"
        "Delete as DeleteIcon" = "DeleteIcon as DeleteIcon"
        "Edit as EditIcon" = "EditIcon as EditIcon"
        "Save as SaveIcon" = "SaveIcon as SaveIcon"
        "Search as SearchIcon" = "SearchIcon as SearchIcon"
        "Clear as ClearIcon" = "ClearIcon as ClearIcon"
        "Refresh as RefreshIcon" = "RefreshIcon as RefreshIcon"
        "Settings as SettingsIcon" = "SettingsIcon as SettingsIcon"
        "Download as DownloadIcon" = "DownloadIcon as DownloadIcon"
        "Upload as UploadIcon" = "UploadIcon as UploadIcon"
        "Image as ImageIcon" = "ImageIcon as ImageIcon"
        "PlayArrow as PlayArrowIcon" = "PlayArrowIcon as PlayArrowIcon"
        "Pause as PauseIcon" = "PauseIcon as PauseIcon"
        "Stop as StopIcon" = "StopIcon as StopIcon"
        "Error as ErrorIcon" = "ErrorIcon as ErrorIcon"
        "Warning as WarningIcon" = "WarningIcon as WarningIcon"
        "Info as InfoIcon" = "InfoIcon as InfoIcon"
        "CheckCircle as CheckCircleIcon" = "CheckCircleIcon as CheckCircleIcon"
        "Science as ScienceIcon" = "ScienceIcon as ScienceIcon"
        "Security as SecurityIcon" = "SecurityIcon as SecurityIcon"
        "Visibility as VisibilityIcon" = "VisibilityIcon as VisibilityIcon"
        "VisibilityOff as VisibilityOffIcon" = "VisibilityOffIcon as VisibilityOffIcon"
        "Computer as ComputerIcon" = "ComputerIcon as ComputerIcon"
        "Storage as StorageIcon" = "StorageIcon as StorageIcon"
        "Group as GroupIcon" = "GroupIcon as GroupIcon"
        "Person as PersonIcon" = "PersonIcon as PersonIcon"
        "PersonOutline as ProfileIcon" = "PersonOutlineIcon as ProfileIcon"
        "Menu as MenuIcon" = "MenuIcon as MenuIcon"
        "Dashboard as DashboardIcon" = "DashboardIcon as DashboardIcon"
        "ExpandMore as ExpandMoreIcon" = "ExpandMoreIcon as ExpandMoreIcon"
        "ExpandLess as ExpandLessIcon" = "ExpandLessIcon as ExpandLessIcon"
        "Brightness4 as DarkModeIcon" = "Brightness4Icon as DarkModeIcon"
        "Brightness7 as LightModeIcon" = "Brightness7Icon as LightModeIcon"
        "ExitToApp as LogoutIcon" = "LogoutIcon as LogoutIcon"
        "Notifications as NotificationsIcon" = "NotificationsIcon as NotificationsIcon"
        "AccountCircle as AccountIcon" = "AccountCircleIcon as AccountIcon"
        "RotateLeft as ResetIcon" = "RestoreIcon as ResetIcon"
        "ArrowBack as ArrowBackIcon" = "ArrowBackIcon as ArrowBackIcon"
        "MoreVert as MoreVertIcon" = "MoreVertIcon as MoreVertIcon"
    }
    
    foreach ($pattern in $patterns.Keys) {
        $replacement = $patterns[$pattern]
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replacement
            $modified = $true
        }
    }
    
    # Save if modified
    if ($modified -and $content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $modifiedFiles++
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to fix: $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Completed!" -ForegroundColor Green
Write-Host "Total files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Cyan
