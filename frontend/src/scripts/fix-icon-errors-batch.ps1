# 批量修复图标导入错误的PowerShell脚本

$ErrorActionPreference = "Continue"

# 定义源文件夹
$frontendSrc = "d:\AICAMV2\frontend\src"

# 定义需要修复的图标名称映射
$iconMappings = @{
    'RefreshIconIcon' = 'RefreshIcon'
    'SettingsIconIcon' = 'SettingsIcon'
    'PauseIconIcon' = 'PauseIcon'
    'StopIconIcon' = 'StopIcon'
    'AdminPanelSettingsIconIcon' = 'AdminPanelSettingsIcon'
    'RefreshIconOutlined' = 'RefreshIcon'
    'SettingsIconOutlined' = 'SettingsIcon'
    'SignalCellularAltIcon1BarIcon' = 'SignalCellularAlt1BarIcon'
    'PowerSettingsIconNew' = 'PowerSettingsNewIcon'
    'TrendingDown' = 'TrendingDownIcon'
    'BatteryChargingFull' = 'BatteryChargingFullIcon'
    'DeviceThermostat' = 'DeviceThermostatIcon'
    'FiberManualRecord' = 'FiberManualRecordIcon'
    'LinkOutlined' = 'LinkOutlinedIcon'
    'DragIndicator' = 'DragIndicatorIcon'
    'ArrowDownward' = 'ArrowDownwardIcon'
    'BookmarkBorder' = 'BookmarkBorderIcon'
    'SentimentDissatisfied' = 'SentimentDissatisfiedIcon'
    'Notifications' = 'NotificationsIcon'
    'PhoneAndroid' = 'PhoneAndroidIcon'
    'VideoLibrary' = 'VideoLibraryIcon'
    'DevicesOther' = 'DevicesOtherIcon'
}

# 定义需要查找和替换的模式
$replacements = @()

# 对于每个图标映射，创建替换规则
foreach ($oldIcon in $iconMappings.Keys) {
    $newIcon = $iconMappings[$oldIcon]
    
    # 替换导入语句中的图标名称
    $replacements += @{
        Pattern = "import \{ ([^}]*?)$oldIcon( as [^,}]+)?([^}]*?) \} from"
        Replacement = "import { `$1$newIcon`$2`$3 } from"
    }
    
    # 替换单独的导入
    $replacements += @{
        Pattern = "\b$oldIcon\b"
        Replacement = $newIcon
    }
}

# 其他通用的替换规则
$generalReplacements = @(
    @{
        Pattern = 'from ''([^'']*)/DevicesIcon'''
        Replacement = "from '`$1/devices'"
    },
    @{
        Pattern = 'from ''([^'']*)/SettingsIcon/([^'']*)'''
        Replacement = "from '`$1/settings/`$2'"
    },
    @{
        Pattern = '\.StopIconPropagation\(\)'
        Replacement = '.stopPropagation()'
    },
    @{
        Pattern = '\.StopIconExperiment\('
        Replacement = '.stopExperiment('
    },
    @{
        Pattern = '\.onStopIcon\s*='
        Replacement = '.onstop ='
    },
    @{
        Pattern = '\.StopIcon\(\)'
        Replacement = '.stop()'
    },
    @{
        Pattern = '\.SendIcon\('
        Replacement = '.send('
    },
    @{
        Pattern = '''StorageIcon'''
        Replacement = "'storage'"
    },
    @{
        Pattern = 'theme\.PaletteIcon\.'
        Replacement = 'theme.palette.'
    },
    @{
        Pattern = '''PauseIcond'''
        Replacement = "'paused'"
    },
    @{
        Pattern = 'component="LabelIcon"'
        Replacement = 'component="label"'
    },
    @{
        Pattern = '\.LabelIcon:'
        Replacement = '.label:'
    },
    @{
        Pattern = 'LabelIcon:'
        Replacement = 'label:'
    },
    @{
        Pattern = '\.CategoryIcon'
        Replacement = '.category'
    },
    @{
        Pattern = 'CategoryIcon:'
        Replacement = 'category:'
    }
)

# 合并所有替换规则
$allReplacements = $replacements + $generalReplacements

Write-Host "开始批量修复图标导入错误..." -ForegroundColor Green

# 获取所有需要处理的文件
$files = Get-ChildItem -Path $frontendSrc -Recurse -Include "*.tsx", "*.ts" -Exclude "node_modules", "*.d.ts"

$processedFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "处理文件" -Status "正在处理: $($file.Name)" -PercentComplete (($processedFiles / $files.Count) * 100)
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $modified = $false
        
        # 应用所有替换规则
        foreach ($replacement in $allReplacements) {
            $newContent = $content -replace $replacement.Pattern, $replacement.Replacement
            if ($newContent -ne $content) {
                $content = $newContent
                $modified = $true
            }
        }
        
        # 如果文件被修改，保存它
        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $modifiedFiles++
            Write-Host "修改文件: $($file.FullName)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Warning "处理文件 $($file.FullName) 时出错: $($_.Exception.Message)"
    }
}

Write-Host "批量修复完成!" -ForegroundColor Green
Write-Host "处理了 $processedFiles 个文件，修改了 $modifiedFiles 个文件" -ForegroundColor Cyan
