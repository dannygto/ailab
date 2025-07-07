#!/usr/bin/env powershell
# Fix missing icon imports - replace non-existent icons with available ones

Write-Host "Fixing missing icon imports..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.FullName -notmatch "node_modules" }

$replacements = @{
    # Missing icons - replace with available alternatives
    "PowerSettingsIconNew" = "PowerSettingsNewIcon"
    "Speed" = "SpeedIcon"
    "SignalCellularAltIcon1BarIcon" = "SignalCellularAlt1BarIcon"
    "RefreshIconOutlined" = "RefreshIcon"
    "SettingsIconOutlined" = "SettingsIcon"
    "BuildCircle" = "BuildIcon"
    "BatteryChargingFull" = "BatteryChargingFullIcon"
    "DeviceThermostat" = "DeviceThermostatIcon"
    "Biotech" = "BiotechIcon"
    "Engineering" = "EngineeringIcon"
    "Schedule" = "ScheduleIcon"
    "School" = "SchoolIcon"
    "ExpandLess" = "ExpandLessIcon"
    "ExpandMore" = "ExpandMoreIcon"
    "Circle" = "CircleIcon"
    "CloudQueue" = "CloudQueueIcon"
    "CheckCircle" = "CheckCircleIcon"
    "TrendingUp" = "TrendingUpIcon"
    "TrendingDown" = "TrendingDownIcon"
    "LinkOutlined" = "LinkOutlinedIcon"
    "Science" = "ScienceIcon"
    "ScreenShare" = "ScreenShareIcon"
    "Chat" = "ChatIcon"
    "People" = "PeopleIcon"
    "FiberManualRecord" = "FiberManualRecordIcon"
    "CloudOff" = "CloudOffIcon"
    "Assessment" = "AssessmentIcon"
    "Logout" = "LogoutIcon"
    "ArrowDownward" = "ArrowDownwardIcon"
    "FilterList" = "FilterListIcon"
    "Bookmark" = "BookmarkIcon"
    "BookmarkBorder" = "BookmarkBorderIcon"
    "Sort" = "SortIcon"
    "Visibility" = "VisibilityIcon"
    "DragIndicator" = "DragIndicatorIcon"
    "BarChart" = "BarChartIcon"
    "ShowChart" = "ShowChartIcon"
    "PieChart" = "PieChartIcon"
    "ScatterPlot" = "ScatterPlotIcon"
    "Fullscreen" = "FullscreenIcon"
    "DevicesOther" = "DevicesOtherIcon"
    "Storage" = "StorageIcon"
    "ChevronLeft" = "ChevronLeftIcon"
    "Cancel" = "CancelIcon"
    "Api" = "ApiIcon"
    "Memory" = "MemoryIcon"
    "CloudSync" = "CloudSyncIcon"
    "HelpOutline" = "HelpIcon"
    "DataUsage" = "DataUsageIcon"
    "Event" = "EventIcon"
    "CloudUpload" = "CloudUploadIcon"
    "Notifications" = "NotificationsIcon"
    "Palette" = "PaletteIcon"
    "Language" = "LanguageIcon"
    "AccessTime" = "AccessTimeIcon"
    "Business" = "BusinessIcon"
    "Title" = "TitleIcon"
    "ContactMail" = "ContactMailIcon"
    "Devices" = "DevicesIcon"
    "GetApp" = "GetAppIcon"
    "Check" = "CheckIcon"
    "Backup" = "BackupIcon"
    "Restore" = "RestoreIcon"
    "Email" = "EmailIcon"
    "Sms" = "SmsIcon"
    "PhoneAndroid" = "PhoneAndroidIcon"
    "ColorLens" = "ColorLensIcon"
    "FormatSize" = "FormatSizeIcon"
    "SentimentDissatisfied" = "SentimentDissatisfiedIcon"
    "VideoLibrary" = "VideoLibraryIcon"
    "Help" = "HelpIcon"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content -match $old) {
            $content = $content -replace $old, $new
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Missing icon imports fixed!" -ForegroundColor Green
