# Automated Optimization Script
# Created: 2025-07-21

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
"Optimization Log - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logFile

function Write-Log {
    param (
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $Message" | Out-File -Append -FilePath $logFile
    Write-Host $Message
}

function Backup-Files {
    Write-Log "Creating backup folder: $backupFolder"
    New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

    # Backup frontend directory
    $frontendBackupPath = Join-Path $backupFolder "src\frontend"
    Write-Log "Backing up frontend files..."

    New-Item -ItemType Directory -Force -Path $frontendBackupPath | Out-Null
    Copy-Item -Path "$frontendPath\*" -Destination $frontendBackupPath -Recurse -Force

    Write-Log "Backup complete."
}

function Repair-FileEncoding {
    Write-Log "Fixing file encoding issues..."

    $files = Get-ChildItem -Path $componentsPath -Recurse -Include "*.tsx","*.ts"
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        if ($content -match "����") {
            Write-Log "  Fixing file: $($file.FullName)"

            # Try to detect and fix common encoding issues
            $newContent = $content -replace "����", "input"
            $newContent = $newContent -replace "����", "select"
            $newContent = $newContent -replace "����", "search"
            $newContent = $newContent -replace "����", "tag"
            $newContent = $newContent -replace "����", "notification"
            $newContent = $newContent -replace "����", "confirm"
            $newContent = $newContent -replace "����", "cancel"
            $newContent = $newContent -replace "����", "delete"
            $newContent = $newContent -replace "����", "add"
            $newContent = $newContent -replace "����", "edit"
            $newContent = $newContent -replace "����", "view"
            $newContent = $newContent -replace "����", "settings"
            $newContent = $newContent -replace "����", "save"

            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $count++
        }
    }

    Write-Log "Encoding fixes complete, fixed $count files."
}

function Remove-ConsoleLog {
    Write-Log "Cleaning up console.log statements..."

    $files = Get-ChildItem -Path $frontendPath -Recurse -Include "*.tsx","*.ts","*.js","*.jsx"
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        if ($content -match "console\.log\(") {
            Write-Log "  Cleaning file: $($file.FullName)"

            # Remove console.log statements in production
            $newContent = $content -replace "console\.log\(([^;]*)\);", "// console.log removed"
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $count++
        }
    }

    Write-Log "console.log cleanup complete, modified $count files."
}

function Update-NamingConvention {
    Write-Log "Fixing naming convention issues..."

    $apiFile = Join-Path $servicesPath "api.ts"
    $deviceServiceFile = Join-Path $servicesPath "device.service.ts"
    $count = 0

    if (Test-Path $apiFile) {
        $content = Get-Content -Path $apiFile -Raw -Encoding UTF8

        if ($content -match "getdevices") {
            Write-Log "  Fixing API naming: $apiFile"

            # Fix naming conventions
            $newContent = $content -replace "getdevices", "getDevices"
            Set-Content -Path $apiFile -Value $newContent -Encoding UTF8
            $count++
        }
    }

    if (Test-Path $deviceServiceFile) {
        $content = Get-Content -Path $deviceServiceFile -Raw -Encoding UTF8

        if ($content -match "getdevices") {
            Write-Log "  Fixing Service naming: $deviceServiceFile"

            # Fix naming conventions
            $newContent = $content -replace "getdevices", "getDevices"
            $newContent = $newContent -replace "deviceservice", "DeviceService"
            Set-Content -Path $deviceServiceFile -Value $newContent -Encoding UTF8
            $count++
        }
    }

    Write-Log "Naming convention fixes complete, modified $count files."
}

# Start execution
Write-Log "Starting automatic optimization of AILAB project..."
Backup-Files

if ($FixEncoding -or $All) {
    Repair-FileEncoding
}

if ($RemoveConsoleLog -or $All) {
    Remove-ConsoleLog
}

if ($FixNaming -or $All) {
    Update-NamingConvention
}

Write-Log "Optimization complete. Log saved to: $logFile"
Write-Log "Please check the backup folder ($backupFolder) to restore original files if needed."
