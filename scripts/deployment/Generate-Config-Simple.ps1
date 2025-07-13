# AILAB Platform Edition Configuration Script
param(
    [string]$Edition = "general",
    [string]$SchoolId = "demo-school-001",
    [string]$SchoolName = "DemoSchool"
)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  AILAB Platform Configuration" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Edition: $Edition" -ForegroundColor Cyan
Write-Host "School ID: $SchoolId" -ForegroundColor Cyan
Write-Host "School Name: $SchoolName" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Green

# Create config directory
$configDir = "config\deployment"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Generate environment file
$envContent = @"
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
AILAB_EDITION=$Edition
AILAB_SCHOOL_ID=$SchoolId
AILAB_SCHOOL_NAME=$SchoolName
AILAB_VERSION=1.0.0-$Edition
MONGODB_URI=mongodb://localhost:27017/ailab_${SchoolId}_${Edition}
"@

$envContent | Out-File -FilePath "$configDir\.env.$Edition" -Encoding UTF8

# Create frontend config directory
$frontendConfigDir = "src\frontend\public\config"
if (!(Test-Path $frontendConfigDir)) {
    New-Item -ItemType Directory -Path $frontendConfigDir -Force | Out-Null
}

# Set edition features
$editionName = switch ($Edition) {
    "general" { "General Education" }
    "vocational" { "Vocational Education" }
    "higher" { "Higher Education" }
    default { "General Education" }
}

$maxStudents = switch ($Edition) {
    "general" { 5000 }
    "vocational" { 8000 }
    "higher" { 20000 }
    default { 5000 }
}

$primaryColor = switch ($Edition) {
    "general" { "#1976d2" }
    "vocational" { "#ff9800" }
    "higher" { "#9c27b0" }
    default { "#1976d2" }
}

# Generate frontend config
$frontendConfigContent = @"
{
  "edition": "$Edition",
  "editionName": "$editionName",
  "schoolId": "$SchoolId",
  "schoolName": "$SchoolName",
  "version": "1.0.0-$Edition",
  "limits": {
    "maxStudents": $maxStudents,
    "maxTeachers": 500,
    "maxCampuses": 10
  },
  "theme": {
    "primaryColor": "$primaryColor"
  }
}
"@

$frontendConfigContent | Out-File -FilePath "$frontendConfigDir\app-config.$Edition.json" -Encoding UTF8

Write-Host ""
Write-Host "Configuration generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "  - $configDir\.env.$Edition" -ForegroundColor White
Write-Host "  - $frontendConfigDir\app-config.$Edition.json" -ForegroundColor White
Write-Host ""
Write-Host "Ready for deployment!" -ForegroundColor Yellow
