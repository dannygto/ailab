# Remote development machine auto-connect setup script
# Created on: 2025-07-03

# Remote server information
$remoteHost = "82.156.75.232"
$remoteUser = "ubuntu"
$remotePass = "Danny486020!!&&"

# SSH directory check and creation
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    Write-Host "Creating SSH directory: $sshDir" -ForegroundColor Yellow
    New-Item -Path $sshDir -ItemType Directory | Out-Null
}

# Config file check and creation
$configPath = "$sshDir\config"
if (-not (Test-Path $configPath)) {
    Write-Host "Creating SSH config file" -ForegroundColor Yellow
    New-Item -Path $configPath -ItemType File | Out-Null
}

# Check if config already exists
$configContent = Get-Content $configPath -ErrorAction SilentlyContinue
$hostConfigExists = $configContent -match "Host aicam-dev"

if (-not $hostConfigExists) {
    Write-Host "Adding remote host config to SSH config" -ForegroundColor Green
    Add-Content -Path $configPath -Value @"

# AICAM Remote Dev Configuration
Host aicam-dev
    HostName $remoteHost
    User $remoteUser
    IdentityFile $sshDir\id_rsa_aicam
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

"@
}

# Check if SSH key already exists
$keyPath = "$sshDir\id_rsa_aicam"
if (-not (Test-Path $keyPath)) {
    Write-Host "Generating new SSH key pair" -ForegroundColor Yellow
    
    # Generate new SSH key pair
    & ssh-keygen -t rsa -b 4096 -f $keyPath -N """" -C "AICAM_Remote_Dev_Key"
    
    # Check if key generation was successful
    if (-not (Test-Path $keyPath)) {
        Write-Host "SSH key generation failed, please generate manually" -ForegroundColor Red
        exit 1
    }
}

# Upload public key to remote server
Write-Host "Preparing to upload SSH public key to remote server..." -ForegroundColor Cyan
Write-Host "One-time password login will be used, after that no password will be needed" -ForegroundColor Yellow

# Clear remote host from known_hosts
Write-Host "Clearing remote host from known_hosts" -ForegroundColor Yellow
& ssh-keygen -R $remoteHost

# Get public key content
$publicKey = Get-Content "$keyPath.pub"

Write-Host "Uploading public key to remote server..." -ForegroundColor Green
Write-Host "When prompted, enter the password: $remotePass" -ForegroundColor Yellow

# Create directory and upload key
& ssh -o StrictHostKeyChecking=no $remoteUser@$remoteHost "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
$uploadCommand = "echo '$publicKey' | ssh -o StrictHostKeyChecking=no $remoteUser@$remoteHost 'cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'"
Invoke-Expression $uploadCommand

# Test passwordless connection
Write-Host "`nTesting SSH passwordless connection..." -ForegroundColor Cyan
& ssh -o StrictHostKeyChecking=no -i $keyPath $remoteUser@$remoteHost "echo 'Connection successful!'; whoami; pwd"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n鉁?Automatic connection setup completed!" -ForegroundColor Green
    Write-Host "You can now connect to the remote development machine using:" -ForegroundColor Yellow
    Write-Host "   ssh aicam-dev" -ForegroundColor Cyan
    Write-Host "Or using the full command:" -ForegroundColor Yellow
    Write-Host "   ssh -i $keyPath $remoteUser@$remoteHost" -ForegroundColor Cyan
} else {
    Write-Host "`n鉂?Automatic connection setup failed, please check the error messages" -ForegroundColor Red
}

Write-Host "`nComplete!" -ForegroundColor Green

