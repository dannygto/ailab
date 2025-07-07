# Quick login to remote development machine
param(
    [switch]$setup
)

$remoteHost = "82.156.75.232"
$username = "ubuntu"
$password = "Danny486020!!&&"

if ($setup) {
    Write-Host "正在设置远程开发机的SSH配置..." -ForegroundColor Cyan
    
    # 创建或更新SSH配置文件
    $sshFolder = "$env:USERPROFILE\.ssh"
    $configFile = "$sshFolder\config"
    
    # 确保SSH文件夹存在
    if (!(Test-Path $sshFolder)) {
        New-Item -Path $sshFolder -ItemType Directory
    }
    
    # 添加主机配置到SSH配置文件
    $configContent = @"
Host aicam-remote
    HostName $remoteHost
    User $username
    IdentityFile ~/.ssh/id_rsa
"@
    
    if (!(Test-Path $configFile) -or !(Select-String -Path $configFile -Pattern "Host aicam-remote" -Quiet)) {
        Add-Content -Path $configFile -Value $configContent
        Write-Host "已添加SSH配置" -ForegroundColor Green
    }
    
    # 安装PuTTY工具
    if (!(Get-Command plink -ErrorAction SilentlyContinue)) {
        Write-Host "正在安装PuTTY工具..." -ForegroundColor Yellow
        if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
            Write-Host "请先安装Chocolatey，然后运行: choco install putty -y" -ForegroundColor Red
            exit
        }
        choco install putty -y
    }
    
    # 创建自动登录批处理文件
    $batchContent = @"
@echo off
echo 正在连接到远程开发机...
plink -ssh $username@$remoteHost -pw "$password"
"@
    
    Set-Content -Path "D:\AICAMV2\scripts\remote-login.bat" -Value $batchContent
    Write-Host "已创建自动登录批处理文件: D:\AICAMV2\scripts\remote-login.bat" -ForegroundColor Green
    
    # 创建项目同步批处理文件
    $syncContent = @"
@echo off
echo 正在同步项目到远程开发机...
pscp -r -pw "$password" D:\AICAMV2 $username@$remoteHost:/home/$username/
echo 同步完成！
pause
"@
    
    Set-Content -Path "D:\AICAMV2\scripts\sync-project.bat" -Value $syncContent
    Write-Host "已创建项目同步批处理文件: D:\AICAMV2\scripts\sync-project.bat" -ForegroundColor Green
    
    Write-Host "设置完成！现在可以使用以下命令:" -ForegroundColor Green
    Write-Host "1. 自动登录远程开发机: .\remote-login.bat" -ForegroundColor Cyan
    Write-Host "2. 同步项目到远程开发机: .\sync-project.bat" -ForegroundColor Cyan
} else {
    # 直接尝试使用plink连接
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        Write-Host "正在连接到远程开发机..." -ForegroundColor Cyan
        plink -ssh $username@$remoteHost -pw "$password"
    } else {
        Write-Host "未找到plink命令。请先运行: ./login-remote.ps1 -setup" -ForegroundColor Yellow
        Write-Host "或使用标准SSH命令: ssh $username@$remoteHost" -ForegroundColor Yellow
        ssh $username@$remoteHost
    }
}
