# 自动代码优化脚本
# 创建日期: 2025-07-21

param (
    [switch]$FixEncoding = $false,
    [switch]$RemoveConsoleLog = $false,
    [switch]$FixNaming = $false,
    [switch]$All = $false
)

$rootPath = "D:\ailab\ailab"
$backupFolder = Join-Path $rootPath "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$frontendPath = Join-Path $rootPath "src\frontend"
$componentsPath = Join-Path $frontendPath "src\components"
$servicesPath = Join-Path $frontendPath "src\services"

$logFile = Join-Path $rootPath "optimization-log.txt"
"优化日志 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logFile

function Write-Log {
    param (
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $Message" | Out-File -Append -FilePath $logFile
    Write-Host $Message
}

function Backup-Files {
    Write-Log "创建备份到 $backupFolder"

    if (!(Test-Path $backupFolder)) {
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
    }

    # 备份前端代码
    $frontendBackupPath = Join-Path $backupFolder "src\frontend"
    if (!(Test-Path $frontendBackupPath)) {
        New-Item -ItemType Directory -Path $frontendBackupPath -Force | Out-Null
    }

    Copy-Item -Path "$frontendPath\*" -Destination $frontendBackupPath -Recurse -Force
    Write-Log "备份完成"
}

function Fix-FileEncoding {
    Write-Log "开始修复文件编码问题..."

    $files = Get-ChildItem -Path $componentsPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        # 检查编码问题的模式
        if ($content -match "\\u[0-9a-fA-F]{4}") {
            $newContent = $content -replace "\\u([0-9a-fA-F]{4})", { [char][int]"0x$($matches[1])" }
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            $count++
            Write-Log "修复文件: $($file.FullName)"
        }
    }

    Write-Log "修复了 $count 个文件的编码问题"
}

function Remove-ConsoleLogStatements {
    Write-Log "开始移除控制台日志..."

    $files = Get-ChildItem -Path $frontendPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        # 移除console.log语句
        $newContent = $content -replace "console\.log\(.*\);?(\r?\n)?", ""

        # 仅当内容发生变化时才写入文件
        if ($content -ne $newContent) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            $count++
            Write-Log "处理文件: $($file.FullName)"
        }
    }

    Write-Log "移除了 $count 个文件中的控制台日志"
}

function Fix-NamingConventions {
    Write-Log "开始修复命名约定问题..."

    $files = Get-ChildItem -Path $frontendPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"
    $count = 0

    # 命名约定映射
    $namingMappings = @{
        "device_list" = "deviceList"
        "device_detail" = "deviceDetail"
        "user_info" = "userInfo"
        "get_data" = "getData"
        "fetch_items" = "fetchItems"
        "update_info" = "updateInfo"
        "create_new" = "createNew"
        "delete_item" = "deleteItem"
    }

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content

        # 应用命名映射
        foreach ($key in $namingMappings.Keys) {
            $value = $namingMappings[$key]
            $content = $content -replace "\b$key\b", $value
        }

        # 仅当内容发生变化时才写入文件
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $count++
            Write-Log "修复文件: $($file.FullName)"
        }
    }

    Write-Log "修复了 $count 个文件的命名约定问题"
}

# 主执行逻辑
try {
    Write-Log "开始自动代码优化..."

    # 创建备份
    Backup-Files

    # 根据参数执行相应优化
    if ($FixEncoding -or $All) {
        Fix-FileEncoding
    }

    if ($RemoveConsoleLog -or $All) {
        Remove-ConsoleLogStatements
    }

    if ($FixNaming -or $All) {
        Fix-NamingConventions
    }

    Write-Log "代码优化完成"
    Write-Host "优化完成。日志保存在: $logFile" -ForegroundColor Green
}
catch {
    Write-Log "错误: $_"
    Write-Host "优化过程中发生错误。详情请查看日志: $logFile" -ForegroundColor Red
}
