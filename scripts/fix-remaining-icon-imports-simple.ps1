#!/usr/bin/env pwsh
# Fix remaining icon import errors

Write-Host "Starting to fix remaining icon import errors..." -ForegroundColor Green

# Find all TypeScript/TSX files
$files = Get-ChildItem -Path "d:\AICAMV2\frontend\src" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.Name -notmatch "\.test\." -and $_.Name -notmatch "\.spec\." }

$modifiedFiles = 0

# Define common icon replacements
$replacements = @{
    'Send as SendIcon' = 'SendIcon'
    'SmartToy as AIIcon' = 'SmartToyIcon as AIIcon'
    'NotificationImportant as CriticalIcon' = 'NotificationsIcon as CriticalIcon'
    'NotificationsOff as NotificationsOffIcon' = 'NotificationsOffIcon as NotificationsOffIcon'
    'Analytics as AnalyticsIcon' = 'AnalyticsIcon as AnalyticsIcon'
    'Compare as CompareIcon' = 'CompareIcon as CompareIcon'
    'TextFields as TextIcon' = 'TextFieldsIcon as TextIcon'
    'Description as ReportIcon' = 'DescriptionIcon as ReportIcon'
    'Category as CategoryIcon' = 'CategoryIcon as CategoryIcon'
    'Summarize as SummarizeIcon' = 'SummarizeIcon as SummarizeIcon'
    'ContentCopy as CopyIcon' = 'ContentCopyIcon as CopyIcon'
    'Archive as ArchiveIcon' = 'ArchiveIcon as ArchiveIcon'
    'Share as ShareIcon' = 'ShareIcon as ShareIcon'
    'Label as LabelIcon' = 'LabelIcon as LabelIcon'
    'CloudDownload as ExportIcon' = 'CloudDownloadIcon as ExportIcon'
    'Close as CloseIcon' = 'CloseIcon as CloseIcon'
    'Undo as UndoIcon' = 'UndoIcon as UndoIcon'
    'GetApp as InstallIcon' = 'GetAppIcon as InstallIcon'
    'Update as UpdateIcon' = 'UpdateIcon as UpdateIcon'
    'WifiOff as OfflineIcon' = 'WifiOffIcon as OfflineIcon'
    'Wifi as OnlineIcon' = 'WifiIcon as OnlineIcon'
    'PhoneAndroid as MobileIcon' = 'PhoneAndroidIcon as MobileIcon'
    'Speed as SpeedIcon' = 'SpeedIcon as SpeedIcon'
    'Storage as CacheIcon' = 'StorageIcon as CacheIcon'
    'ViewColumnIcon' = 'ViewColumnIcon'
    'FileDownloadIcon' = 'DownloadIcon'
    'Bolt as BoltIcon' = 'BoltIcon as BoltIcon'
    'Tune as TuneIcon' = 'TuneIcon as TuneIcon'
    'TableChart as TableChartIcon' = 'TableChartIcon as TableChartIcon'
    'Code as CodeIcon' = 'CodeIcon as CodeIcon'
    'NotificationsActive as NotificationsActiveIcon' = 'NotificationsActiveIcon as NotificationsActiveIcon'
    'PlayArrow as PlayIcon' = 'PlayArrowIcon as PlayIcon'
    'Stop' = 'StopIcon'
    'Pause' = 'PauseIcon'
    'Settings' = 'SettingsIcon'
    'PowerSettingsNew as PowerSettings' = 'PowerSettingsNewIcon as PowerSettings'
    'ThermostatAuto' = 'ThermostatAutoIcon'
    'WaterDrop' = 'WaterDropIcon'
    'ElectricBolt' = 'ElectricBoltIcon'
    'Refresh' = 'RefreshIcon'
    'Block as BlockIcon' = 'BlockIcon as BlockIcon'
    'SignalCellular4Bar' = 'SignalCellular4BarIcon'
    'SignalCellularAlt' = 'SignalCellularAltIcon'
    'SignalCellularAlt1Bar' = 'SignalCellularAlt1BarIcon'
    'SignalCellularConnectedNoInternet0Bar' = 'SignalCellularConnectedNoInternet0BarIcon'
    'MemoryIcon' = 'MemoryIcon'
    'HistoryIcon' = 'HistoryIcon'
    'UpdateIcon' = 'UpdateIcon'
    'RefreshOutlined as RefreshIcon' = 'RefreshIcon as RefreshIcon'
    'DownloadOutlined as DownloadIcon' = 'DownloadIcon as DownloadIcon'
    'ZoomInOutlined as ZoomInIcon' = 'ZoomInIcon as ZoomInIcon'
    'ZoomOutOutlined as ZoomOutIcon' = 'ZoomOutIcon as ZoomOutIcon'
    'SettingsOutlined as SettingsIcon' = 'SettingsIcon as SettingsIcon'
    'FilterList as FilterListIcon' = 'FilterListIcon as FilterListIcon'
    'ArrowDownward as DownloadIcon' = 'ArrowDownwardIcon as DownloadIcon'
    'DeleteOutline as DeleteIcon' = 'DeleteOutlineIcon as DeleteIcon'
    'Article as ReportIcon' = 'ArticleIcon as ReportIcon'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Check if file contains icon imports
    if ($content -match "from ['\`"].*utils/icons['\`"]") {
        foreach ($replacement in $replacements.GetEnumerator()) {
            $oldPattern = $replacement.Key
            $newPattern = $replacement.Value
            
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        }
        
        # Save modified file
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Yellow
            $modifiedFiles++
        }
    }
}

Write-Host "Fix completed! Modified $modifiedFiles files" -ForegroundColor Green
