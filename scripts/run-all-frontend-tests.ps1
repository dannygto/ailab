$ErrorActionPreference = "Stop"

Write-Host "Running all frontend tests..." -ForegroundColor Cyan

# Change directory to frontend
Set-Location -Path "$PSScriptRoot\..\frontend"

# Install necessary dependencies
Write-Host "Installing test dependencies..." -ForegroundColor Yellow
npm install --no-save @testing-library/react@^16.3.0 @testing-library/jest-dom@^6.6.3 @testing-library/user-event@^14.6.1 jest-environment-jsdom@^27.5.1 @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-nullish-coalescing-operator babel-jest@^27.5.1 identity-obj-proxy

# Create a jest setup file if it doesn't exist
$setupTestsPath = ".\src\setupTests.ts"
if (-not (Test-Path $setupTestsPath)) {
    Write-Host "Creating Jest setup file..." -ForegroundColor Yellow
    @"
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
"@ | Out-File -FilePath $setupTestsPath -Encoding utf8
}

# Move mock files to correct location if needed
if (Test-Path ".\src\__tests__\mockData.ts") {
    Write-Host "Mock data found..." -ForegroundColor Green
} else {
    Write-Host "No mock data found. Tests may fail if they depend on mock data." -ForegroundColor Yellow
}

# Run tests with increased timeout and coverage
Write-Host "Running all tests..." -ForegroundColor Green
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run test -- --coverage --testTimeout=10000 --watchAll=false

# Display result
if ($LASTEXITCODE -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Please check the test report." -ForegroundColor Red
}

# Return to original directory
Set-Location -Path $PSScriptRoot

# Open test report if generated
$reportPath = "$PSScriptRoot\..\frontend\coverage\lcov-report\index.html"
if (Test-Path $reportPath) {
    Write-Host "Test coverage report generated. Opening..." -ForegroundColor Cyan
    Start-Process $reportPath
}

