# 远程开发机自动连接设置脚本
# 创建于: 2025年7月3日

# 确保使用UTF-8编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 远程服务器信息
$remoteHost = "82.156.75.232"
$remoteUser = "ubuntu"
$remotePass = "Danny486020!!&&"

# SSH目录检查与创建
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    Write-Host "创建SSH目录: $sshDir" -ForegroundColor Yellow
    New-Item -Path $sshDir -ItemType Directory | Out-Null
}

# 配置文件检查与创建
$configPath = "$sshDir\config"
if (-not (Test-Path $configPath)) {
    Write-Host "创建SSH配置文件" -ForegroundColor Yellow
    New-Item -Path $configPath -ItemType File | Out-Null
}

# 检查是否已经有配置
$configContent = Get-Content $configPath -ErrorAction SilentlyContinue
$hostConfigExists = $configContent -match "Host aicam-dev"

if (-not $hostConfigExists) {
    Write-Host "添加远程主机配置到SSH config" -ForegroundColor Green
    Add-Content -Path $configPath -Value @"

# AICAM远程开发机配置
Host aicam-dev
    HostName $remoteHost
    User $remoteUser
    IdentityFile $sshDir\id_rsa_aicam
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

"@
}

# 检查是否已有SSH密钥
$keyPath = "$sshDir\id_rsa_aicam"
if (-not (Test-Path $keyPath)) {
    Write-Host "生成新的SSH密钥对" -ForegroundColor Yellow
    
    # 生成新的SSH密钥对
    & ssh-keygen -t rsa -b 4096 -f $keyPath -N """" -C "AICAM_Remote_Dev"
    
    # 检查密钥是否生成成功
    if (-not (Test-Path $keyPath)) {
        Write-Host "SSH密钥生成失败，请手动生成" -ForegroundColor Red
        exit 1
    }
}

# 上传公钥到远程服务器
Write-Host "准备上传SSH公钥到远程服务器..." -ForegroundColor Cyan
Write-Host "将使用一次性密码登录，随后将无需密码" -ForegroundColor Yellow

# 清除已知主机记录中的远程主机
Write-Host "清除已知主机记录中的远程主机" -ForegroundColor Yellow
& ssh-keygen -R $remoteHost

# 使用sshpass上传公钥(需要先安装sshpass)
# 由于Windows下没有原生的sshpass，我们使用PowerShell的方式
$publicKey = Get-Content "$keyPath.pub"

# 创建一个临时脚本来上传公钥
$tempScript = "$env:TEMP\upload-key.ps1"
@"
`$password = '$remotePass'
`$command = "ssh $remoteUser@$remoteHost 'mkdir -p .ssh && echo `"$publicKey`" >> .ssh/authorized_keys && chmod 700 .ssh && chmod 600 .ssh/authorized_keys'"

# 使用SSH命令上传公钥
Write-Host "正在上传公钥到远程服务器..."
`$process = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no $remoteUser@$remoteHost 'mkdir -p .ssh && chmod 700 .ssh'" -NoNewWindow -PassThru -Wait

# 写入公钥到远程authorized_keys文件
`$command = "echo `"$publicKey`" | ssh -o StrictHostKeyChecking=no $remoteUser@$remoteHost 'cat >> .ssh/authorized_keys'"
Invoke-Expression `$command

# 设置权限
ssh -o StrictHostKeyChecking=no $remoteUser@$remoteHost 'chmod 600 .ssh/authorized_keys'
"@ | Out-File -FilePath $tempScript -Encoding utf8

# 执行临时脚本
Write-Host "执行公钥上传脚本..." -ForegroundColor Green
& powershell.exe -ExecutionPolicy Bypass -File $tempScript

# 测试无密码连接
Write-Host "`n正在测试SSH无密码连接..." -ForegroundColor Cyan
& ssh -o StrictHostKeyChecking=no -i $keyPath $remoteUser@$remoteHost "echo '连接成功！'; whoami; pwd"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 自动连接设置完成！" -ForegroundColor Green
    Write-Host "现在您可以使用以下命令连接远程开发机:" -ForegroundColor Yellow
    Write-Host "   ssh aicam-dev" -ForegroundColor Cyan
    Write-Host "或使用完整命令:" -ForegroundColor Yellow
    Write-Host "   ssh -i $keyPath $remoteUser@$remoteHost" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 自动连接设置失败，请检查错误信息" -ForegroundColor Red
}

# 清理临时文件
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host "`n完成!" -ForegroundColor Green
