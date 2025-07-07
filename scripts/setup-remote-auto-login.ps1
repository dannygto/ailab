# 设置远程服务器自动登录
# 此脚本会自动配置SSH免密登录远程开发机

# 远程服务器信息
$remoteHost = "82.156.75.232"
$remoteUser = "ubuntu"
$remotePassword = "Danny486020!!&&"

# 本地SSH目录
$sshDir = "$env:USERPROFILE\.ssh"
$configFile = "$sshDir\config"
$keyFile = "$sshDir\id_rsa_aicam"
$pubKeyFile = "$keyFile.pub"
$knownHostsFile = "$sshDir\known_hosts"

# 确保SSH目录存在
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "创建SSH目录: $sshDir" -ForegroundColor Green
}

# 移除旧的host key（如果主机信息已变更）
if (Test-Path $knownHostsFile) {
    $content = Get-Content $knownHostsFile -Raw
    $updatedContent = $content -replace "[^\n]*$remoteHost[^\n]*\n", ""
    Set-Content -Path $knownHostsFile -Value $updatedContent -Force
    Write-Host "已清除旧的主机密钥" -ForegroundColor Yellow
}

# 生成SSH密钥对（如果不存在）
if (-not (Test-Path $keyFile)) {
    Write-Host "生成SSH密钥对..." -ForegroundColor Cyan
    ssh-keygen -t rsa -b 4096 -f $keyFile -N '""'
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "SSH密钥生成失败，尝试使用OpenSSL..." -ForegroundColor Yellow
        # 如果ssh-keygen失败，尝试使用OpenSSL（可能需要先安装OpenSSL）
        & openssl genrsa -out $keyFile 4096
        & openssl rsa -in $keyFile -pubout -out "$keyFile.pub"
    }
    
    Write-Host "SSH密钥已生成: $keyFile" -ForegroundColor Green
}

# 创建SSH配置文件
$configContent = @"
Host aicam-remote
    HostName $remoteHost
    User $remoteUser
    IdentityFile $keyFile
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
"@

Set-Content -Path $configFile -Value $configContent -Force
Write-Host "SSH配置文件已更新: $configFile" -ForegroundColor Green

# 创建一个临时脚本文件，用于远程执行的命令
$tempScriptPath = [System.IO.Path]::GetTempFileName() + ".ps1"
$tempExpectScriptPath = [System.IO.Path]::GetTempFileName() + ".exp"

# 创建自动化脚本将公钥复制到远程服务器
$expectScript = @"
#!/usr/bin/expect -f
spawn ssh-copy-id -i "$keyFile" $remoteUser@$remoteHost
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$remotePassword\r"; exp_continue }
    eof
}
"@

# 保存expect脚本
Set-Content -Path $tempExpectScriptPath -Value $expectScript -Force

# 检查是否有expect命令
$hasExpect = $null -ne (Get-Command "expect" -ErrorAction SilentlyContinue)

if ($hasExpect) {
    # 使用expect脚本
    Write-Host "使用expect自动上传公钥..." -ForegroundColor Cyan
    & expect -f $tempExpectScriptPath
} else {
    # 使用手动方式
    Write-Host "未检测到expect工具，使用手动方式..." -ForegroundColor Yellow
    
    # 使用sshpass（如果有）
    $hasSshpass = $null -ne (Get-Command "sshpass" -ErrorAction SilentlyContinue)
    
    if ($hasSshpass) {
        & sshpass -p "$remotePassword" ssh-copy-id -i $keyFile $remoteUser@$remoteHost
    } else {
        # 获取公钥内容
        $pubKey = Get-Content $pubKeyFile -Raw
        
        # 创建PowerShell脚本，使用普通SSH命令和echo
        $sshScript = @"
# 创建临时密码文件
`$tempPasswordFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path `$tempPasswordFile -Value "$remotePassword" -NoNewline

# 使用echo命令发送密码，然后执行远程命令
Write-Host "正在上传公钥到远程服务器..." -ForegroundColor Cyan
`$pubKey = '$pubKey'.Trim()

# 使用echo传递密码到SSH命令
Get-Content `$tempPasswordFile | ssh $remoteUser@$remoteHost "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo `"`$pubKey`" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

# 删除临时密码文件
Remove-Item -Path `$tempPasswordFile -Force

# 测试免密登录
Write-Host "测试免密登录..." -ForegroundColor Cyan
ssh -o "StrictHostKeyChecking no" -i "$keyFile" $remoteUser@$remoteHost "echo '免密登录成功！'"

if (`$LASTEXITCODE -eq 0) {
    Write-Host "SSH免密登录配置成功!" -ForegroundColor Green
    Write-Host "现在您可以使用以下命令登录远程开发机:" -ForegroundColor Green
    Write-Host "ssh aicam-remote" -ForegroundColor Cyan
} else {
    Write-Host "SSH免密登录配置可能未成功，请检查错误信息。" -ForegroundColor Red
}
"@
        
        # 保存脚本
        Set-Content -Path $tempScriptPath -Value $sshScript -Force
        
        # 执行脚本
        & powershell -ExecutionPolicy Bypass -File $tempScriptPath
    }
}

# 清理临时文件
Remove-Item -Path $tempScriptPath -Force -ErrorAction SilentlyContinue
Remove-Item -Path $tempExpectScriptPath -Force -ErrorAction SilentlyContinue

# 测试免密登录
Write-Host "测试免密登录..." -ForegroundColor Cyan
ssh -o "StrictHostKeyChecking no" -i $keyFile $remoteUser@$remoteHost "echo '免密登录测试'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH免密登录配置成功!" -ForegroundColor Green
    Write-Host "现在您可以使用以下命令登录远程开发机:" -ForegroundColor Green
    Write-Host "ssh aicam-remote" -ForegroundColor Cyan
    
    # 创建一个简单的登录脚本
    $loginScriptPath = "d:\AICAMV2\scripts\login-remote.ps1"
    $loginScript = @"
# 快速登录远程开发机
Write-Host "正在连接远程开发机..." -ForegroundColor Cyan
ssh aicam-remote
"@
    
    Set-Content -Path $loginScriptPath -Value $loginScript -Force
    Write-Host "已创建快速登录脚本: $loginScriptPath" -ForegroundColor Green
    
    # 创建一个数据同步脚本
    $syncScriptPath = "d:\AICAMV2\scripts\sync-to-remote.ps1"
    $syncScript = @"
# 将项目同步到远程开发机
param(
    [switch]`$Full = `$false
)

`$sourceDir = "d:\AICAMV2"
`$remotePath = "ubuntu@$remoteHost:~/AICAMV2"

if (`$Full) {
    # 完整同步
    Write-Host "正在执行完整项目同步..." -ForegroundColor Cyan
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' "`$sourceDir/" "`$remotePath/"
} else {
    # 增量同步（仅源代码和配置文件）
    Write-Host "正在执行增量同步（源代码和配置文件）..." -ForegroundColor Cyan
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' --include '*/' --include '*.ts' --include '*.tsx' --include '*.js' --include '*.jsx' --include '*.json' --include '*.md' --include '*.yml' --include '*.html' --include '*.css' --include '*.scss' --include '*.py' --exclude '*' "`$sourceDir/" "`$remotePath/"
}

if (`$LASTEXITCODE -eq 0) {
    Write-Host "✅ 同步完成!" -ForegroundColor Green
} else {
    Write-Host "❌ 同步失败，请检查错误信息。" -ForegroundColor Red
}
"@
    
    Set-Content -Path $syncScriptPath -Value $syncScript -Force
    Write-Host "已创建项目同步脚本: $syncScriptPath" -ForegroundColor Green
    
    # 确保远程目录存在
    ssh aicam-remote "mkdir -p ~/AICAMV2"
} else {
    Write-Host "❌ SSH免密登录配置失败，请检查错误信息。" -ForegroundColor Red
}
