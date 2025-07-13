# AILAB平台版本配置脚本 (PowerShell版本)
param(
    [string]$Edition = "general",
    [string]$SchoolId = "demo-school-001",
    [string]$SchoolName = "示范学校",
    [string]$TargetEnv = "production"
)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  AILAB平台版本配置" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "版本类型: $Edition" -ForegroundColor Cyan
Write-Host "学校ID: $SchoolId" -ForegroundColor Cyan
Write-Host "学校名称: $SchoolName" -ForegroundColor Cyan
Write-Host "目标环境: $TargetEnv" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Green

# 创建配置目录
$configDir = "config\deployment"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# 生成版本配置文件
$editionConfig = @{
    edition = $Edition
    schoolId = $SchoolId
    schoolName = $SchoolName
    environment = $TargetEnv
    buildTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    version = "1.0.0-$Edition"
} | ConvertTo-Json -Depth 3

$editionConfig | Out-File -FilePath "$configDir\edition.config.json" -Encoding UTF8

# 生成环境变量文件
$envContent = @"
# AILAB平台环境配置 - $Edition版本
NODE_ENV=$TargetEnv
PORT=3001
FRONTEND_PORT=3000

# 版本信息
AILAB_EDITION=$Edition
AILAB_SCHOOL_ID=$SchoolId
AILAB_SCHOOL_NAME=$SchoolName
AILAB_VERSION=1.0.0-$Edition

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/ailab_${SchoolId}_${Edition}

# AI服务配置
AI_SERVICE_ENABLED=true
AI_SERVICE_PORT=8080

# 文件存储
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB

# 安全配置
JWT_SECRET=your-jwt-secret-${SchoolId}
ENCRYPTION_KEY=your-encryption-key-${SchoolId}

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs
"@

$envContent | Out-File -FilePath "$configDir\.env.$Edition" -Encoding UTF8

# 生成前端配置
$frontendConfigDir = "src\frontend\public\config"
if (!(Test-Path $frontendConfigDir)) {
    New-Item -ItemType Directory -Path $frontendConfigDir -Force | Out-Null
}

$features = switch ($Edition) {
    "general" {
        @{
            experimentManagement = $true
            studentManagement = $true
            teacherManagement = $true
            aiAssistant = $true
            deviceManagement = $true
            dataAnalytics = $true
            campusManagement = $true
            courseTemplate = $true
            skillsTraining = $false
            skillAssessment = $false
            enterpriseCooperation = $false
            researchManagement = $false
            academicAnalytics = $false
            paperManagement = $false
            labBooking = $false
            graduateManagement = $false
        }
    }
    "vocational" {
        @{
            experimentManagement = $true
            studentManagement = $true
            teacherManagement = $true
            aiAssistant = $true
            deviceManagement = $true
            dataAnalytics = $true
            campusManagement = $true
            courseTemplate = $true
            skillsTraining = $true
            skillAssessment = $true
            enterpriseCooperation = $true
            researchManagement = $false
            academicAnalytics = $false
            paperManagement = $false
            labBooking = $false
            graduateManagement = $false
        }
    }
    "higher" {
        @{
            experimentManagement = $true
            studentManagement = $true
            teacherManagement = $true
            aiAssistant = $true
            deviceManagement = $true
            dataAnalytics = $true
            campusManagement = $true
            courseTemplate = $true
            skillsTraining = $true
            skillAssessment = $true
            enterpriseCooperation = $false
            researchManagement = $true
            academicAnalytics = $true
            paperManagement = $true
            labBooking = $true
            graduateManagement = $true
        }
    }
}

$limits = switch ($Edition) {
    "general" { @{ maxStudents = 5000; maxTeachers = 500; maxCampuses = 10 } }
    "vocational" { @{ maxStudents = 8000; maxTeachers = 800; maxCampuses = 15 } }
    "higher" { @{ maxStudents = 20000; maxTeachers = 2000; maxCampuses = 20 } }
}

$primaryColor = switch ($Edition) {
    "general" { "#1976d2" }
    "vocational" { "#ff9800" }
    "higher" { "#9c27b0" }
}

$frontendConfig = @{
    edition = $Edition
    editionName = switch ($Edition) {
        "general" { "普教版" }
        "vocational" { "职教版" }
        "higher" { "高校版" }
    }
    schoolId = $SchoolId
    schoolName = $SchoolName
    version = "1.0.0-$Edition"
    apiBaseUrl = "/api"
    features = $features
    ui = @{
        theme = @{
            primaryColor = $primaryColor
            logo = "/assets/logo-$Edition.png"
        }
        navigation = @{
            showAdvancedFeatures = ($Edition -ne "general")
        }
    }
    limits = $limits
} | ConvertTo-Json -Depth 4

$frontendConfig | Out-File -FilePath "$frontendConfigDir\app-config.$Edition.json" -Encoding UTF8

Write-Host ""
Write-Host "✅ 版本配置生成完成" -ForegroundColor Green
Write-Host ""
Write-Host "📁 生成的文件:" -ForegroundColor Yellow
Write-Host "  - $configDir\edition.config.json" -ForegroundColor White
Write-Host "  - $configDir\.env.$Edition" -ForegroundColor White
Write-Host "  - $frontendConfigDir\app-config.$Edition.json" -ForegroundColor White
Write-Host ""
Write-Host "🚀 接下来可以运行部署脚本:" -ForegroundColor Yellow
Write-Host "  .\scripts\deployment\minimal-fix.sh $Edition $SchoolId `"$SchoolName`"" -ForegroundColor White
