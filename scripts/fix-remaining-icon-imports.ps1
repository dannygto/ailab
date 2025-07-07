#!/usr/bin/env pwsh
# 修复剩余的图标导入错误

Write-Host "开始修复剩余的图标导入错误..." -ForegroundColor Green

# 定义图标映射
$iconMappings = @{
    'Send' = 'SendIcon'
    'SmartToy' = 'SmartToyIcon'
    'PersonIcon as PersonIcon' = 'PersonIcon'
    'NotificationImportant' = 'NotificationsIcon'
    'NotificationsOff' = 'NotificationsOffIcon'
    'Analytics' = 'AnalyticsIcon'
    'Compare' = 'CompareIcon'
    'TextFields' = 'TextFieldsIcon'
    'Description' = 'DescriptionIcon'
    'Category' = 'CategoryIcon'
    'Summarize' = 'SummarizeIcon'
    'ContentCopy' = 'ContentCopyIcon'
    'Archive' = 'ArchiveIcon'
    'Share' = 'ShareIcon'
    'Label' = 'LabelIcon'
    'CloudDownload' = 'CloudDownloadIcon'
    'Close' = 'CloseIcon'
    'Undo' = 'UndoIcon'
    'GetApp' = 'GetAppIcon'
    'Update' = 'UpdateIcon'
    'WifiOff' = 'WifiOffIcon'
    'Wifi' = 'WifiIcon'
    'PhoneAndroid' = 'PhoneAndroidIcon'
    'Speed' = 'SpeedIcon'
    'Storage' = 'StorageIcon'
    'ViewColumnIcon' = 'ViewColumnIcon'
    'FileDownloadIcon' = 'DownloadIcon'
    'Bolt' = 'BoltIcon'
    'Tune' = 'TuneIcon'
    'TableChart' = 'TableChartIcon'
    'Code' = 'CodeIcon'
    'NotificationsActive' = 'NotificationsActiveIcon'
    'PlayArrow' = 'PlayArrowIcon'
    'Stop' = 'StopIcon'
    'Pause' = 'PauseIcon'
    'Settings' = 'SettingsIcon'
    'PowerSettingsNew' = 'PowerSettingsNewIcon'
    'ThermostatAuto' = 'ThermostatAutoIcon'
    'WaterDrop' = 'WaterDropIcon'
    'ElectricBolt' = 'ElectricBoltIcon'
    'Refresh' = 'RefreshIcon'
    'Block' = 'BlockIcon'
    'SignalCellular4Bar' = 'SignalCellular4BarIcon'
    'SignalCellularAlt' = 'SignalCellularAltIcon'
    'SignalCellularAlt1Bar' = 'SignalCellularAlt1BarIcon'
    'SignalCellularConnectedNoInternet0Bar' = 'SignalCellularConnectedNoInternet0BarIcon'
    'MemoryIcon' = 'MemoryIcon'
    'HistoryIcon' = 'HistoryIcon'
    'UpdateIcon' = 'UpdateIcon'
    'RefreshOutlined' = 'RefreshIcon'
    'DownloadOutlined' = 'DownloadIcon'
    'ZoomInOutlined' = 'ZoomInIcon'
    'ZoomOutOutlined' = 'ZoomOutIcon'
    'SettingsOutlined' = 'SettingsIcon'
    'FilterList' = 'FilterListIcon'
    'ArrowDownward' = 'ArrowDownwardIcon'
    'DeleteOutline' = 'DeleteOutlineIcon'
    'Article' = 'ArticleIcon'
    'Psychology' = 'PsychologyIcon'
    'Biotech' = 'BiotechIcon'
    'Engineering' = 'EngineeringIcon'
    'Schedule' = 'ScheduleIcon'
    'School' = 'SchoolIcon'
    'ExpandLess' = 'ExpandLessIcon'
    'ExpandMore' = 'ExpandMoreIcon'
    'Circle' = 'CircleIcon'
    'CloudQueue' = 'CloudQueueIcon'
    'CheckCircle' = 'CheckCircleIcon'
    'TrendingUp' = 'TrendingUpIcon'
    'TrendingDown' = 'TrendingDownIcon'
    'LinkOutlined' = 'LinkOutlinedIcon'
    'Science' = 'ScienceIcon'
    'ScreenShare' = 'ScreenShareIcon'
    'Chat' = 'ChatIcon'
    'People' = 'PeopleIcon'
    'FiberManualRecord' = 'FiberManualRecordIcon'
    'CloudOff' = 'CloudOffIcon'
    'Devices' = 'DevicesIcon'
    'Assessment' = 'AssessmentIcon'
    'Logout' = 'LogoutIcon'
    'Bookmark' = 'BookmarkIcon'
    'BookmarkBorder' = 'BookmarkBorderIcon'
    'Sort' = 'SortIcon'
    'Visibility' = 'VisibilityIcon'
    'DragIndicator' = 'DragIndicatorIcon'
    'BarChart' = 'BarChartIcon'
    'ShowChart' = 'ShowChartIcon'
    'PieChart' = 'PieChartIcon'
    'ScatterPlot' = 'ScatterPlotIcon'
    'Fullscreen' = 'FullscreenIcon'
    'DevicesOther' = 'DevicesOtherIcon'
    'DataUsage' = 'DataUsageIcon'
    'ChevronLeft' = 'ChevronLeftIcon'
    'LanguageIcon' = 'LanguageIcon'
    'AdminPanelSettingsIcon' = 'AdminPanelSettingsIcon'
    'Cancel' = 'CancelIcon'
    'Api' = 'ApiIcon'
    'Memory' = 'MemoryIcon'
    'CloudSync' = 'CloudSyncIcon'
    'HelpOutline' = 'HelpOutlineIcon'
    'Event' = 'EventIcon'
    'Help' = 'HelpIcon'
    'Phone' = 'PhoneIcon'
    'Email' = 'EmailIcon'
    'Language' = 'LanguageIcon'
    'VideoLibrary' = 'VideoLibraryIcon'
    'SentimentDissatisfied' = 'SentimentDissatisfiedIcon'
    'Notifications' = 'NotificationsIcon'
    'Palette' = 'PaletteIcon'
    'AccessTime' = 'AccessTimeIcon'
    'Business' = 'BusinessIcon'
    'Title' = 'TitleIcon'
    'ContactMail' = 'ContactMailIcon'
    'Check' = 'CheckIcon'
    'CloudUpload' = 'CloudUploadIcon'
    'Backup' = 'BackupIcon'
    'Restore' = 'RestoreIcon'
    'Sms' = 'SmsIcon'
    'ColorLens' = 'ColorLensIcon'
    'FormatSize' = 'FormatSizeIcon'
    'GetAppIcon' = 'GetAppIcon'
    'FileUploadIcon' = 'UploadIcon'
    'AnalyticsIcon' = 'AnalyticsIcon'
    'InsertChartIcon' = 'PieChartIcon'
    'BubbleChartIcon' = 'BubbleChartIcon'
    'DownloadForOfflineIcon' = 'DownloadForOfflineIcon'
    'TrendingUpIcon' = 'TrendingUpIcon'
    'AssignmentTurnedInIcon' = 'AssignmentTurnedInIcon'
    'ErrorOutlineIcon' = 'ErrorOutlineIcon'
    'AutoGraphIcon' = 'AutoGraphIcon'
    'LightbulbIcon' = 'LightbulbIcon'
    'BuildCircle' = 'BuildCircleIcon'
    'BatteryChargingFull' = 'BatteryChargingFullIcon'
    'DeviceThermostat' = 'DeviceThermostatIcon'
}

# 找到所有TypeScript/TSX文件
$files = Get-ChildItem -Path "d:\AICAMV2\frontend\src" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.Name -notmatch "\.test\." -and $_.Name -notmatch "\.spec\." }

$modifiedFiles = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # 检查是否包含图标导入错误
    if ($content -match "from ['\`"].*utils/icons['\`"]") {
        foreach ($mapping in $iconMappings.GetEnumerator()) {
            $oldIcon = $mapping.Key
            $newIcon = $mapping.Value
            
            # 替换导入语句中的图标名称
            $content = $content -replace "\b$oldIcon\b", $newIcon
        }
        
        # 保存修改后的文件
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "已修复: $($file.FullName)" -ForegroundColor Yellow
            $modifiedFiles++
        }
    }
}

Write-Host "修复完成！共修改了 $modifiedFiles 个文件" -ForegroundColor Green
