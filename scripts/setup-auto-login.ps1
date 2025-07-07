# Setup remote auto-login
# Store password in Windows Credential Manager

# Remote server information
$remoteHost = "82.156.75.232"
$remoteUser = "ubuntu" 
$remotePassword = "Danny486020!!&&"

# Store password in Windows Credential Manager
Write-Host "Storing credentials in Windows Credential Manager..." -ForegroundColor Cyan
cmdkey /add:$remoteHost /user:$remoteUser /pass:$remotePassword

# Create SSH config
$sshDir = "$env:USERPROFILE\.ssh"
$configFile = "$sshDir\config"

if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "Created SSH directory: $sshDir" -ForegroundColor Green
}

# Create or update SSH config
$configContent = @"
Host aicam-remote
    HostName $remoteHost
    User $remoteUser
    StrictHostKeyChecking no
"@

if (-not (Test-Path $configFile) -or (Get-Content $configFile -Raw) -notmatch "Host aicam-remote") {
    Add-Content -Path $configFile -Value $configContent -Force
    Write-Host "Updated SSH config file: $configFile" -ForegroundColor Green
}

Write-Host "Auto-login setup completed!" -ForegroundColor Green
Write-Host "You can now use 'ssh aicam-remote' to connect to the server." -ForegroundColor Green
