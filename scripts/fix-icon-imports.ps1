# 修复图标导入问题的脚本
Write-Host "正在修复图标导入问题..." -ForegroundColor Yellow

# 定义图标映射表（错误名称 -> 正确名称）
$iconMappings = @{
    "Add" = "AddIcon"
    "Delete" = "DeleteIcon"
    "Edit" = "EditIcon"
    "Save" = "SaveIcon"
    "Search" = "SearchIcon"
    "Clear" = "ClearIcon"
    "Close" = "CloseIcon"
    "Check" = "CheckIcon"
    "Refresh" = "RefreshIcon"
    "Settings" = "SettingsIcon"
    "Download" = "DownloadIcon"
    "Upload" = "UploadIcon"
    "Image" = "ImageIcon"
    "Home" = "HomeIcon"
    "Dashboard" = "DashboardIcon"
    "Menu" = "MenuIcon"
    "ExpandMore" = "ExpandMoreIcon"
    "ExpandLess" = "ExpandLessIcon"
    "NavigateNext" = "NavigateNextIcon"
    "NavigateBefore" = "NavigateBeforeIcon"
    "PlayArrow" = "PlayArrowIcon"
    "Pause" = "PauseIcon"
    "Stop" = "StopIcon"
    "Mic" = "MicIcon"
    "BarChart" = "BarChartIcon"
    "PieChart" = "PieChartIcon"
    "Assessment" = "AssessmentIcon"
    "ShowChart" = "ShowChartIcon"
    "Timeline" = "TimelineIcon"
    "DataObject" = "DataObjectIcon"
    "Functions" = "FunctionsIcon"
    "CheckCircle" = "CheckCircleIcon"
    "Error" = "ErrorIcon"
    "Warning" = "WarningIcon"
    "Info" = "InfoIcon"
    "Person" = "PersonIcon"
    "PersonOutline" = "PersonOutlineIcon"
    "Group" = "GroupIcon"
    "Share" = "ShareIcon"
    "Favorite" = "FavoriteIcon"
    "FavoriteBorder" = "FavoriteBorderIcon"
    "Science" = "ScienceIcon"
    "Biotech" = "BiotechIcon"
    "MenuBook" = "MenuBookIcon"
    "Code" = "CodeIcon"
    "Security" = "SecurityIcon"
    "Lock" = "LockIcon"
    "LockOpen" = "LockOpenIcon"
    "Visibility" = "VisibilityIcon"
    "VisibilityOff" = "VisibilityOffIcon"
    "Devices" = "DevicesIcon"
    "Computer" = "ComputerIcon"
    "Monitor" = "MonitorIcon"
    "Notifications" = "NotificationsIcon"
    "NotificationsOff" = "NotificationsOffIcon"
    "Storage" = "StorageIcon"
    "Backup" = "BackupIcon"
    "Restore" = "RestoreIcon"
    "Sync" = "SyncIcon"
    "CloudDownload" = "CloudDownloadIcon"
    "CloudUpload" = "CloudUploadIcon"
    "SmartToy" = "SmartToyIcon"
    "Psychology" = "PsychologyIcon"
    "AutoAwesome" = "AutoAwesomeIcon"
    "Tune" = "TuneIcon"
    "Email" = "EmailIcon"
    "Phone" = "PhoneIcon"
    "Chat" = "ChatIcon"
    "Forum" = "ForumIcon"
    "Folder" = "FolderIcon"
    "InsertDriveFile" = "InsertDriveFileIcon"
    "PictureAsPdf" = "PictureAsPdfIcon"
    "Description" = "DescriptionIcon"
    "AttachFile" = "AttachFileIcon"
    "ViewModule" = "ViewModuleIcon"
    "ViewList" = "ViewListIcon"
    "ViewKanban" = "ViewKanbanIcon"
    "GridView" = "GridViewIcon"
    "TableView" = "TableViewIcon"
    "PhoneIphone" = "PhoneIphoneIcon"
    "Tablet" = "TabletIcon"
    "Laptop" = "LaptopIcon"
    "DesktopWindows" = "DesktopWindowsIcon"
    "FilterList" = "FilterListIcon"
    "Sort" = "SortIcon"
    "Fullscreen" = "FullscreenIcon"
    "FullscreenExit" = "FullscreenExitIcon"
    "ZoomIn" = "ZoomInIcon"
    "ZoomOut" = "ZoomOutIcon"
    "Send" = "SendIcon"
    "Reply" = "ReplyIcon"
    "Forward" = "ForwardIcon"
    "Star" = "StarIcon"
    "StarBorder" = "StarBorderIcon"
    "Bookmark" = "BookmarkIcon"
    "BookmarkBorder" = "BookmarkBorderIcon"
    "ThumbUp" = "ThumbUpIcon"
    "ThumbDown" = "ThumbDownIcon"
    "Comment" = "CommentIcon"
    "Launch" = "LaunchIcon"
    "OpenInNew" = "OpenInNewIcon"
    "Print" = "PrintIcon"
    "LocationOn" = "LocationOnIcon"
    "Event" = "EventIcon"
    "Schedule" = "ScheduleIcon"
    "Alarm" = "AlarmIcon"
    "AccessTime" = "AccessTimeIcon"
    "DateRange" = "DateRangeIcon"
    "Today" = "TodayIcon"
    "CalendarToday" = "CalendarTodayIcon"
    "EventNote" = "EventNoteIcon"
    "Contacts" = "ContactsIcon"
    "ContactPhone" = "ContactPhoneIcon"
    "ContactMail" = "ContactMailIcon"
    "AccountBox" = "AccountBoxIcon"
    "AccountCircle" = "AccountCircleIcon"
    "Badge" = "BadgeIcon"
    "Work" = "WorkIcon"
    "Business" = "BusinessIcon"
    "CorporateFare" = "CorporateFareIcon"
    "School" = "SchoolIcon"
    "LibraryBooks" = "LibraryBooksIcon"
    "Brightness4" = "Brightness4Icon"
    "Brightness7" = "Brightness7Icon"
    "Logout" = "LogoutIcon"
    "ContentCopy" = "ContentCopyIcon"
    "RotateLeft" = "RestoreIcon"
    "ArrowBack" = "ArrowBackIcon"
    "MoreVert" = "MoreVertIcon"
}

# 获取所有需要修复的 TypeScript 和 TSX 文件
$files = Get-ChildItem -Path "D:\AICAMV2\frontend\src" -Include "*.ts", "*.tsx" -Recurse

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    Write-Progress -Activity "修复图标导入" -Status "处理文件: $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    # 修复每个映射的图标
    foreach ($key in $iconMappings.Keys) {
        $correctName = $iconMappings[$key]
        
        # 修复 "as" 导入语法
        $pattern1 = "$key as \w+Icon"
        $pattern2 = "$key as \w+"
        
        if ($content -match $pattern1) {
            $content = $content -replace "$key as (\w+Icon)", $correctName + ' as $1'
            $modified = $true
        } elseif ($content -match $pattern2) {
            $content = $content -replace "$key as (\w+)", $correctName + ' as $1'
            $modified = $true
        }
        
        # 修复直接导入
        if ($content -match "\{ $key \}") {
            $content = $content -replace "\{ $key \}", "{ $correctName }"
            $modified = $true
        }
        
        # 修复逗号分隔的导入
        if ($content -match "$key,") {
            $content = $content -replace "$key,", "$correctName,"
            $modified = $true
        }
        
        if ($content -match ", $key") {
            $content = $content -replace ", $key", ", $correctName"
            $modified = $true
        }
    }
    
    # 如果文件被修改，保存
    if ($modified -and $content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $modifiedFiles++
            Write-Host "✅ 修复了文件: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "❌ 修复文件失败: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Progress -Activity "修复图标导入" -Completed
Write-Host ""
Write-Host "修复完成!" -ForegroundColor Green
Write-Host "总共处理文件: $totalFiles" -ForegroundColor Cyan
Write-Host "修改文件数量: $modifiedFiles" -ForegroundColor Cyan

if ($modifiedFiles -gt 0) {
    Write-Host ""
    Write-Host "正在运行类型检查验证修复结果..." -ForegroundColor Yellow
    Set-Location "D:\AICAMV2\frontend"
    $result = npm run type-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 类型检查通过，图标导入问题已修复！" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 仍有一些类型错误，可能需要手动修复" -ForegroundColor Yellow
    }
} else {
    Write-Host "没有文件需要修改" -ForegroundColor Yellow
}
