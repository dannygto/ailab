# Deploy fixes to remote server (PowerShell version)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  Deploy fixes to remote server" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "82.156.75.232"
$REMOTE_PATH = "/home/ubuntu/ailab"
$SSH_KEY = "ailab.pem"

# Check SSH key
if (!(Test-Path $SSH_KEY)) {
    Write-Host "SSH key file not found: $SSH_KEY" -ForegroundColor Red
    Write-Host "Please ensure the key file is in current directory" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing local changes to remote server..." -ForegroundColor Yellow

# 1. Transfer fix script
Write-Host "Transferring fix script..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/fix-frontend-routing.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 2. Transfer updated deployment script
Write-Host "Transferring deployment script..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/minimal-fix.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/scripts/deployment/

# 3. Transfer backend server.ts (restore WebSocket)
Write-Host "Transferring backend server file..." -ForegroundColor Cyan
scp -i $SSH_KEY src/backend/src/server.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/src/backend/src/

# 4. Transfer settings controller
Write-Host "Transferring settings controller..." -ForegroundColor Cyan
scp -i $SSH_KEY src/backend/src/controllers/settings.controller.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/src/backend/src/controllers/

# 5. Connect to remote server and execute fixes
Write-Host "Connecting to remote server to execute fixes..." -ForegroundColor Cyan

$sshCommands = @"
cd /home/ubuntu/ailab
echo "Current directory: `$(pwd)"

# Give execute permissions
chmod +x fix-frontend-routing.sh
chmod +x scripts/deployment/minimal-fix.sh

# Execute frontend routing fix
echo "Executing frontend routing fix..."
./fix-frontend-routing.sh

# Restart backend service (restore WebSocket)
echo "Restarting backend service..."
pm2 restart ailab-backend

# Show final status
echo "Final service status:"
pm2 status

echo ""
echo "Remote fixes completed!"
echo "Test URL: http://82.156.75.232:3000"
"@

ssh -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} $sshCommands

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verification steps:" -ForegroundColor Yellow
Write-Host "  1. Visit: http://82.156.75.232:3000" -ForegroundColor White
Write-Host "  2. Navigate to any page" -ForegroundColor White
Write-Host "  3. Refresh page to test SPA routing" -ForegroundColor White
Write-Host "  4. Check WebSocket functionality" -ForegroundColor White
