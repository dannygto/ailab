# AILAB平台版本配置脚本
param(
    [string]$Edition = "general",
    [string]$SchoolId = "demo-school-001",
    [string]$SchoolName = "示范学校"
)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  AILAB平台版本配置" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "版本类型: $Edition" -ForegroundColor Cyan
Write-Host "学校ID: $SchoolId" -ForegroundColor Cyan
Write-Host "学校名称: $SchoolName" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Green

# 创建配置目录
$configDir = "config\deployment"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# 生成环境变量文件
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

# 创建前端配置目录
$frontendConfigDir = "src\frontend\public\config"
if (!(Test-Path $frontendConfigDir)) {
    New-Item -ItemType Directory -Path $frontendConfigDir -Force | Out-Null
}

# 根据版本设置特性
$editionName = switch ($Edition) {
    "general" { "普教版" }
    "vocational" { "职教版" }
    "higher" { "高校版" }
    default { "普教版" }
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

# 生成前端配置
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
Write-Host "✅ 版本配置生成完成" -ForegroundColor Green
Write-Host ""
Write-Host "📁 生成的文件:" -ForegroundColor Yellow
Write-Host "  - $configDir\.env.$Edition" -ForegroundColor White
Write-Host "  - $frontendConfigDir\app-config.$Edition.json" -ForegroundColor White
Write-Host ""
Write-Host "🚀 配置已生成，可以进行部署了！" -ForegroundColor Yellow
