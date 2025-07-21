# Quick Deploy School API Fix to Remote Server
# Encoding: UTF-8

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  Deploy School API Fix to Remote" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "82.156.75.232"
$REMOTE_PATH = "/home/ubuntu/ailab"
$SSH_KEY = "ailab.pem"

# Check SSH Key
if (!(Test-Path $SSH_KEY)) {
    Write-Host "SSH key file not found: $SSH_KEY" -ForegroundColor Red
    Write-Host "Please ensure the key file is in the current directory" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying fix to remote server..." -ForegroundColor Yellow

# 1. Transfer school API fix script
Write-Host "Transferring school API fix script..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/fix-school-api.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 2. Transfer frontend routing fix script
Write-Host "Transferring frontend routing fix script..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/fix-frontend-routing.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 3. Connect to remote server and execute fixes
Write-Host "Connecting to remote server and executing fixes..." -ForegroundColor Cyan

$sshCommands = @"
cd /home/ubuntu/ailab
echo "Current directory: `$(pwd)"

# Give execute permissions
chmod +x fix-school-api.sh
chmod +x fix-frontend-routing.sh

# Execute school API fix (main issue)
echo "Executing school API fix..."
./fix-school-api.sh

# Execute frontend routing fix
echo "Executing frontend routing fix..."
./fix-frontend-routing.sh

# Show final status
echo "Final service status:"
pm2 status

echo ""
echo "Remote fix completed!"
echo "Test URL: http://82.156.75.232:3000"
"@

ssh -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} $sshCommands

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verification steps:" -ForegroundColor Yellow
Write-Host "  1. Visit: http://82.156.75.232:3000" -ForegroundColor White
Write-Host "  2. Navigate to Settings page" -ForegroundColor White
Write-Host "  3. Test school management functions" -ForegroundColor White
Write-Host "  4. Check browser console for API errors" -ForegroundColor White
