# Quick Fix for School Management and Frontend Routing
param(
    [string]$RemoteServer = "82.156.75.232",
    [string]$Username = "ubuntu",
    [string]$KeyFile = "ailab.pem"
)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  Quick Fix for AILAB Platform" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 1. Build frontend locally
Write-Host "1. Building frontend..." -ForegroundColor Yellow
cd src\frontend
npm run build
cd ..\..

# 2. Create fix script for remote server
$remoteFixScript = @"
#!/bin/bash
echo "=== AILAB Platform Quick Fix ==="

# Stop services
echo "Stopping services..."
pm2 stop all

# Pull latest code
echo "Pulling latest code..."
cd /home/ubuntu/ailab
git pull origin main

# Install any new dependencies
echo "Installing dependencies..."
cd src/backend
npm install
cd ../frontend
npm install

# Rebuild frontend
echo "Building frontend..."
npm run build

# Update PM2 config for frontend routing support
echo "Updating PM2 configuration..."
cd /home/ubuntu/ailab

# Create updated ecosystem config with proper frontend routing
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './src/backend',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --experimental-specifier-resolution=node --max-old-space-size=2048',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json',
        TS_NODE_ESM: 'true',
        AILAB_EDITION: 'general',
        AILAB_SCHOOL_ID: 'demo-school-001',
        AILAB_SCHOOL_NAME: 'DemoSchool'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log',
      time: true
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: '/usr/bin/npx',
      args: ['http-server', 'build', '-p', '3000', '-a', '0.0.0.0', '--proxy', 'http://localhost:3001?', '--cors', '--spa'],
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log',
      time: true
    }
  ]
};
EOF

# Start services
echo "Starting services..."
pm2 start ecosystem.config.js

# Wait and check status
sleep 10
pm2 status

echo "=== Fix completed! ==="
echo "Frontend: http://82.156.75.232:3000"
echo "Backend:  http://82.156.75.232:3001"
echo ""
echo "Testing frontend routing..."
curl -s http://localhost:3000/dashboard | head -20
"@

# Save the fix script
$remoteFixScript | Out-File -FilePath "remote-fix.sh" -Encoding UTF8

# 3. Upload and execute fix
Write-Host "2. Uploading fix script..." -ForegroundColor Yellow
scp -i $KeyFile remote-fix.sh $Username@${RemoteServer}:/home/ubuntu/

Write-Host "3. Executing fix on remote server..." -ForegroundColor Yellow
ssh -i $KeyFile $Username@$RemoteServer "chmod +x /home/ubuntu/remote-fix.sh && /home/ubuntu/remote-fix.sh"

Write-Host "4. Verification..." -ForegroundColor Yellow
ssh -i $KeyFile $Username@$RemoteServer "pm2 status && echo '--- Testing APIs ---' && curl -s http://localhost:3001/api/schools | head -10"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  Fix completed!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Frontend: http://$RemoteServer:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://$RemoteServer:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test frontend routing:" -ForegroundColor Yellow
Write-Host "- http://$RemoteServer:3000/dashboard" -ForegroundColor White
Write-Host "- http://$RemoteServer:3000/settings/general" -ForegroundColor White
Write-Host ""
Write-Host "Test backend APIs:" -ForegroundColor Yellow
Write-Host "- http://$RemoteServer:3001/api/schools" -ForegroundColor White
Write-Host "- http://$RemoteServer:3001/api/settings/general" -ForegroundColor White
