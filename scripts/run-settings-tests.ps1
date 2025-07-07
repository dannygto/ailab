$ErrorActionPreference = "Stop"

Write-Host "Running Settings UI tests..." -ForegroundColor Cyan

# Change directory to frontend
Set-Location -Path "$PSScriptRoot\..\frontend"

# Install necessary dependencies
Write-Host "Checking test dependencies..." -ForegroundColor Yellow
npm install --no-save @testing-library/react@^16.3.0 @testing-library/jest-dom@^6.6.3 @testing-library/user-event@^14.6.1 jest-environment-jsdom@^27.5.1 @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-nullish-coalescing-operator babel-jest@^27.5.1 identity-obj-proxy

# Run Settings-related tests
Write-Host "Running Settings UI tests..." -ForegroundColor Green
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run test -- --testPathPattern="(\/|\\\\)Settings\.test\.(tsx|jsx|js)$" --testTimeout=10000 --watchAll=false

# Display result
if ($LASTEXITCODE -eq 0) {
    Write-Host "Tests passed!" -ForegroundColor Green
} else {
    Write-Host "Tests failed. Please check the test report." -ForegroundColor Red
}

# Return to original directory
Set-Location -Path $PSScriptRoot

# Open test report if generated
$reportPath = "$PSScriptRoot\..\frontend\coverage\lcov-report\index.html"
if (Test-Path $reportPath) {
    Write-Host "Test coverage report generated. Opening..." -ForegroundColor Cyan
    Start-Process $reportPath
}

