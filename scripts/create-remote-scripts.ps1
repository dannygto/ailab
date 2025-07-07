# Create simple login and sync scripts
# Avoid entering password each time

# Remote server information
$remoteHost = "82.156.75.232"
$remoteUser = "ubuntu"
$remWrite-Host "1. ./login-remote.ps1             - Login to remote server" -ForegroundColor Cyan
Write-Host "2. ./sync-to-remote.ps1           - Sync source code to remote server" -ForegroundColor Cyan
Write-Host "3. ./sync-to-remote.ps1 -Full     - Sync entire project to remote server" -ForegroundColor Cyan
Write-Host "4. ./exec-on-remote.ps1 'command' - Execute command on remote server" -ForegroundColor Cyan
Write-Host "5. ./setup-remote-auto-login.ps1  - Setup SSH passwordless login" -ForegroundColor Cyanssword = "Danny486020!!&&"

# 创建一个远程连接脚本
$loginScriptPath = "d:\AICAMV2\scripts\login-remote.ps1"
$loginScript = @"
# 快速登录远程开发机
Write-Host "正在连接远程开发机 $remoteHost..." -ForegroundColor Cyan
`$password = "$remotePassword"
`$securePassword = ConvertTo-SecureString "`$password" -AsPlainText -Force
`$credential = New-Object System.Management.Automation.PSCredential ("$remoteUser", `$securePassword)

# 使用sshpass方式（如果安装了）
`$hasSshpass = `$null -ne (Get-Command "sshpass" -ErrorAction SilentlyContinue)
if (`$hasSshpass) {
    & sshpass -p "$remotePassword" ssh $remoteUser@$remoteHost
} else {
    # 普通登录方式 - 需要手动输入密码
    ssh $remoteUser@$remoteHost
    
    Write-Host "`n要实现完全自动登录，请运行 setup-remote-auto-login.ps1 脚本" -ForegroundColor Yellow
}
"@

Set-Content -Path $loginScriptPath -Value $loginScript -Force
Write-Host "已创建快速登录脚本: $loginScriptPath" -ForegroundColor Green

# 创建一个远程同步脚本
$syncScriptPath = "d:\AICAMV2\scripts\sync-to-remote.ps1"
$syncScript = @"
# 将项目同步到远程开发机
param(
    [switch]`$Full = `$false
)

`$remoteHost = "$remoteHost"
`$remoteUser = "$remoteUser"
`$remotePassword = "$remotePassword"
`$sourceDir = "d:\AICAMV2"
`$remotePath = "`$remoteUser@`$remoteHost:~/AICAMV2"

# 确保远程目录存在
ssh `$remoteUser@`$remoteHost "mkdir -p ~/AICAMV2"

# 检查是否有rsync命令
`$hasRsync = `$null -ne (Get-Command "rsync" -ErrorAction SilentlyContinue)

if (`$hasRsync) {
    # 使用rsync同步
    if (`$Full) {
        # 完整同步
        Write-Host "正在执行完整项目同步..." -ForegroundColor Cyan
        & rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' "`$sourceDir/" "`$remotePath/"
    } else {
        # 增量同步（仅源代码和配置文件）
        Write-Host "正在执行增量同步（源代码和配置文件）..." -ForegroundColor Cyan
        & rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' --include '*/' --include '*.ts' --include '*.tsx' --include '*.js' --include '*.jsx' --include '*.json' --include '*.md' --include '*.yml' --include '*.html' --include '*.css' --include '*.scss' --include '*.py' --exclude '*' "`$sourceDir/" "`$remotePath/"
    }
} else {
    # 使用SCP同步关键文件
    Write-Host "未检测到rsync，使用SCP进行基本同步..." -ForegroundColor Yellow
    
    # 创建一个临时目录来存放要同步的文件列表
    `$tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
    New-Item -ItemType Directory -Path `$tempDir -Force | Out-Null
    
    # 创建文件列表
    `$fileList = @()
    if (`$Full) {
        # 完整同步 - 递归查找所有文件，排除node_modules等
        `$fileList = Get-ChildItem -Path `$sourceDir -Recurse -File | 
                    Where-Object { 
                        `$_.FullName -notmatch 'node_modules' -and 
                        `$_.FullName -notmatch '\.git' -and
                        `$_.FullName -notmatch 'dist' -and
                        `$_.FullName -notmatch 'build'
                    }
    } else {
        # 增量同步 - 仅同步源代码和配置文件
        `$fileList = Get-ChildItem -Path `$sourceDir -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.md,*.yml,*.html,*.css,*.scss,*.py | 
                    Where-Object { 
                        `$_.FullName -notmatch 'node_modules' -and 
                        `$_.FullName -notmatch '\.git' -and
                        `$_.FullName -notmatch 'dist' -and
                        `$_.FullName -notmatch 'build'
                    }
    }
    
    # 同步文件
    `$totalFiles = `$fileList.Count
    `$currentFile = 0
    
    foreach (`$file in `$fileList) {
        `$currentFile++
        `$relativePath = `$file.FullName.Substring(`$sourceDir.Length + 1)
        `$remoteFilePath = "~/AICAMV2/" + `$relativePath.Replace('\', '/')
        `$remoteDir = [System.IO.Path]::GetDirectoryName(`$remoteFilePath).Replace('\', '/')
        
        # 创建远程目录
        ssh `$remoteUser@`$remoteHost "mkdir -p `"`$remoteDir`""
        
        # 同步文件
        Write-Progress -Activity "同步文件" -Status "正在处理: `$relativePath" -PercentComplete ((`$currentFile / `$totalFiles) * 100)
        scp "`$(`$file.FullName)" `$remoteUser@`$remoteHost:`"`$remoteFilePath`"
    }
    
    Write-Progress -Activity "同步文件" -Completed
    
    # 清理临时目录
    Remove-Item -Path `$tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

if (`$LASTEXITCODE -eq 0) {
    Write-Host "✅ 同步完成!" -ForegroundColor Green
} else {
    Write-Host "❌ 同步失败，请检查错误信息。" -ForegroundColor Red
}

# 提示如何使用SSH免密登录
Write-Host "`n要实现完全免密同步，请运行 setup-remote-auto-login.ps1 脚本" -ForegroundColor Yellow
"@

Set-Content -Path $syncScriptPath -Value $syncScript -Force
Write-Host "已创建项目同步脚本: $syncScriptPath" -ForegroundColor Green

# 创建一个远程执行脚本
$execScriptPath = "d:\AICAMV2\scripts\exec-on-remote.ps1"
$execScript = @"
# 在远程开发机上执行命令
param(
    [Parameter(Mandatory=`$true)]
    [string]`$Command
)

`$remoteHost = "$remoteHost"
`$remoteUser = "$remoteUser"
`$remotePassword = "$remotePassword"

Write-Host "在远程开发机上执行命令: `$Command" -ForegroundColor Cyan

# 使用sshpass方式（如果安装了）
`$hasSshpass = `$null -ne (Get-Command "sshpass" -ErrorAction SilentlyContinue)
if (`$hasSshpass) {
    & sshpass -p "$remotePassword" ssh $remoteUser@$remoteHost "`$Command"
} else {
    # 普通方式 - 可能需要手动输入密码
    ssh $remoteUser@$remoteHost "`$Command"
    
    Write-Host "`n要实现完全自动执行，请运行 setup-remote-auto-login.ps1 脚本" -ForegroundColor Yellow
}

if (`$LASTEXITCODE -eq 0) {
    Write-Host "✅ 命令执行成功!" -ForegroundColor Green
} else {
    Write-Host "❌ 命令执行失败，返回代码: `$LASTEXITCODE" -ForegroundColor Red
}
"@

Set-Content -Path $execScriptPath -Value $execScript -Force
Write-Host "已创建远程执行脚本: $execScriptPath" -ForegroundColor Green

Write-Host "`n所有脚本已创建完成。您可以使用以下命令:" -ForegroundColor Green
Write-Host "1. ./login-remote.ps1             - 登录远程开发机" -ForegroundColor Cyan
Write-Host "2. ./sync-to-remote.ps1           - 同步源代码到远程开发机" -ForegroundColor Cyan
Write-Host "3. ./sync-to-remote.ps1 -Full     - 同步整个项目到远程开发机" -ForegroundColor Cyan
Write-Host "4. ./exec-on-remote.ps1 '命令'    - 在远程开发机上执行命令" -ForegroundColor Cyan
Write-Host "5. ./setup-remote-auto-login.ps1  - 设置SSH免密登录" -ForegroundColor Cyan
