# Project organization script (English only to avoid encoding issues)
$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化

Write-Host "=== AICAM Platform Code Organization Tool ===" -ForegroundColor Cyan
Write-Host "Cleaning and organizing project structure..." -ForegroundColor Cyan
Write-Host ""

# Ensure documentation directory structure is complete
$docDirs = @(
    "./documentation/00-index",
    "./documentation/01-project-overview",
    "./documentation/02-development",
    "./documentation/03-deployment", 
    "./documentation/04-api-reference",
    "./documentation/05-project-management",
    "./documentation/06-legal",
    "./documentation/07-user-guides"
)

foreach ($dir in $docDirs) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "  Created directory: $dir" -ForegroundColor Green
    }
}

# Process and move root MD files to appropriate documentation directories
Write-Host "Processing root directory document files..." -ForegroundColor Yellow

# Define file mapping rules (source file -> target path)
$fileMappings = @{
    "./README.md" = "./README.md"  # Keep in root
    "./README_NEW.md" = "./documentation/01-project-overview/README.md"
    "./README_STANDARD.md" = "./documentation/01-project-overview/standard-readme.md"
    "./STARTUP-GUIDE.md" = "./documentation/03-deployment/startup-guide.md"
    "./STARTUP-GUIDE_NEW.md" = "./documentation/03-deployment/startup-guide-new.md"
    "./DOCUMENT_CLEANUP_PLAN.md" = "./documentation/05-project-management/document-cleanup-plan.md"
    "./COMPLETION_STATUS.md" = "./documentation/05-project-management/completion-status.md"
    "./ITERATION_COMPLETE.md" = "./documentation/05-project-management/iteration-complete.md"
    "./STARTUP.md" = "./documentation/03-deployment/startup.md"
}

foreach ($srcFile in $fileMappings.Keys) {
    $destFile = $fileMappings[$srcFile]
    
    # Skip files to be kept in root directory
    if ($srcFile -eq $destFile) { continue }
    
    if (Test-Path -Path $srcFile) {
        # Ensure target directory exists
        $destDir = Split-Path -Path $destFile -Parent
        if (-not (Test-Path -Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Backup target file if it exists
        if (Test-Path -Path $destFile) {
            $backupFile = "$destFile.bak"
            Copy-Item -Path $destFile -Destination $backupFile -Force
            Write-Host "  Backup: $destFile -> $backupFile" -ForegroundColor Gray
        }
        
        # Copy file
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "  Copied: $srcFile -> $destFile" -ForegroundColor Green
    }
}

# Create unified document index
Write-Host "Creating document index..." -ForegroundColor Yellow

$indexContent = @"
# AICAM Platform Documentation Index

This document provides an index of all AICAM platform documentation for quick reference.

## 1. Project Overview

- [Project Summary](../01-project-overview/project-summary.md)
- [Project Mission](../01-project-overview/project-mission.md)
- [Completion Report](../01-project-overview/completion-report.md)

## 2. Development Documents

- [Development Guide](../02-development/development-guide.md)
- [Coding Standards](../02-development/coding-standards.md)
- [PWA Update Guide](../02-development/pwa-update-guide.md)

## 3. Deployment Documents

- [Quick Start Guide](../03-deployment/quick-start-guide.md)
- [Deployment Guide](../03-deployment/deployment-guide.md)
- [Startup Guide](../03-deployment/startup-guide.md)

## 4. API Reference

- [API Overview](../04-api-reference/api-overview.md)
- [Frontend API](../04-api-reference/frontend-api.md)
- [Backend API](../04-api-reference/backend-api.md)
- [AI Service API](../04-api-reference/ai-service-api.md)

## 5. Project Management

- [Delivery Checklist](../05-project-management/delivery-checklist.md)
- [Progress Report](../05-project-management/progress-report.md)
- [Module Completion Details](../05-project-management/module-completion-details.md)
- [Final Delivery Checklist](../05-project-management/final-delivery-checklist.md)

## 6. Legal Documents

- [License](../06-legal/license.md)
- [Patent Application](../06-legal/patent-application.md)

## 7. User Guides

- [User Manual](../07-user-guides/user-manual.md)
- [Admin Guide](../07-user-guides/admin-guide.md)

## 8. Important Root Documents

- [README](../../README.md)
- [Quick Start](../../quick-start.ps1)

---

Last Updated: $(Get-Date -Format "yyyy-MM-dd")
"@

Set-Content -Path "./documentation/00-index/document-index.md" -Value $indexContent -Encoding UTF8
Write-Host "  Created document index: ./documentation/00-index/document-index.md" -ForegroundColor Green

# Integrate content from docs to documentation
Write-Host "Integrating docs directory content to documentation..." -ForegroundColor Yellow

# Define docs mapping
$docMappings = @{
    "./docs/api-documentation.md" = "./documentation/04-api-reference/api-documentation.md"
    "./docs/development-guide.md" = "./documentation/02-development/development-guide.md"
    "./docs/deployment-guide.md" = "./documentation/03-deployment/deployment-guide.md"
    "./docs/development-plan.md" = "./documentation/05-project-management/development-plan.md"
    "./docs/platform-mission.md" = "./documentation/01-project-overview/platform-mission.md"
    "./docs/project-structure.md" = "./documentation/01-project-overview/project-structure.md"
}

foreach ($srcFile in $docMappings.Keys) {
    $destFile = $docMappings[$srcFile]
    
    if (Test-Path -Path $srcFile) {
        # Ensure target directory exists
        $destDir = Split-Path -Path $destFile -Parent
        if (-not (Test-Path -Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Backup target file if it exists
        if (Test-Path -Path $destFile) {
            $backupFile = "$destFile.bak"
            Copy-Item -Path $destFile -Destination $backupFile -Force
            Write-Host "  Backup: $destFile -> $backupFile" -ForegroundColor Gray
        }
        
        # Copy file
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "  Copied: $srcFile -> $destFile" -ForegroundColor Green
    }
}

# Create Chinese version of the index
$chineseIndexContent = @"
# AICAM骞冲彴鏂囨。绱㈠紩

鏈枃妗ｆ彁渚汚ICAM骞冲彴鎵€鏈夋枃妗ｇ殑绱㈠紩锛屾柟渚垮揩閫熸煡鎵剧浉鍏充俊鎭€?

## 1. 椤圭洰姒傝堪

- [椤圭洰姒傝](../01-project-overview/project-summary.md)
- [椤圭洰浣垮懡](../01-project-overview/project-mission.md)
- [瀹屾垚搴︽姤鍛奭(../01-project-overview/completion-report.md)

## 2. 寮€鍙戞枃妗?

- [寮€鍙戞寚鍗梋(../02-development/development-guide.md)
- [浠ｇ爜瑙勮寖](../02-development/coding-standards.md)
- [PWA鏇存柊鎸囧崡](../02-development/pwa-update-guide.md)

## 3. 閮ㄧ讲鏂囨。

- [蹇€熷惎鍔ㄦ寚鍗梋(../03-deployment/quick-start-guide.md)
- [閮ㄧ讲鎸囧崡](../03-deployment/deployment-guide.md)
- [鍚姩鎸囧崡](../03-deployment/startup-guide.md)

## 4. API鍙傝€?

- [API姒傝堪](../04-api-reference/api-overview.md)
- [鍓嶇API](../04-api-reference/frontend-api.md)
- [鍚庣API](../04-api-reference/backend-api.md)
- [AI鏈嶅姟API](../04-api-reference/ai-service-api.md)

## 5. 椤圭洰绠＄悊

- [浜や粯娓呭崟](../05-project-management/delivery-checklist.md)
- [杩涘害鎶ュ憡](../05-project-management/progress-report.md)
- [妯″潡瀹屾垚搴﹁鎯匽(../05-project-management/module-completion-details.md)
- [鏈€缁堜氦浠樻鏌ユ竻鍗昡(../05-project-management/final-delivery-checklist.md)

## 6. 娉曞緥鏂囨。

- [璁稿彲璇乚(../06-legal/license.md)
- [涓撳埄鐢宠鏉愭枡](../06-legal/patent-application.md)

## 7. 鐢ㄦ埛鎸囧崡

- [鐢ㄦ埛鎵嬪唽](../07-user-guides/user-manual.md)
- [绠＄悊鍛樻寚鍗梋(../07-user-guides/admin-guide.md)

## 8. 鏍圭洰褰曢噸瑕佹枃妗?

- [README](../../README.md)
- [蹇€熷惎鍔╙(../../quick-start.ps1)

---

鏈€鍚庢洿鏂? $(Get-Date -Format "yyyy-MM-dd")
"@

Set-Content -Path "./documentation/00-index/document-index-zh.md" -Value $chineseIndexContent -Encoding UTF8
Write-Host "  Created Chinese document index: ./documentation/00-index/document-index-zh.md" -ForegroundColor Green

Write-Host ""
Write-Host "Code organization completed!" -ForegroundColor Green
Write-Host "You can check the organized document structure in the documentation directory" -ForegroundColor Green

