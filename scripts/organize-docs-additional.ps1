# Additional document organization script for remaining docs files
$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化

Write-Host "=== AICAM Platform Additional Document Organization Tool ===" -ForegroundColor Cyan
Write-Host "Moving remaining docs to documentation structure..." -ForegroundColor Cyan
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

# Define more complete docs mapping
$docMappings = @{
    # Existing mappings
    "./docs/api-documentation.md" = "./documentation/04-api-reference/api-documentation.md"
    "./docs/development-guide.md" = "./documentation/02-development/development-guide.md"
    "./docs/deployment-guide.md" = "./documentation/03-deployment/deployment-guide.md"
    "./docs/development-plan.md" = "./documentation/05-project-management/development-plan.md"
    "./docs/platform-mission.md" = "./documentation/01-project-overview/platform-mission.md"
    "./docs/project-structure.md" = "./documentation/01-project-overview/project-structure.md"
    
    # Progress updates - create a dedicate progress folder
    "./docs/development-progress-update-2025-06-24.md" = "./documentation/05-project-management/progress/update-2025-06-24.md"
    "./docs/development-progress-update-2025-06-24-2.md" = "./documentation/05-project-management/progress/update-2025-06-24-2.md"
    "./docs/development-progress-update-2025-06-25.md" = "./documentation/05-project-management/progress/update-2025-06-25.md"
    "./docs/development-progress-update-2025-06-26.md" = "./documentation/05-project-management/progress/update-2025-06-26.md"
    "./docs/development-progress-update-2025-06-27.md" = "./documentation/05-project-management/progress/update-2025-06-27.md"
    "./docs/development-progress-update-2025-06-28.md" = "./documentation/05-project-management/progress/update-2025-06-28.md"
    "./docs/development-progress-update-2025-06-29.md" = "./documentation/05-project-management/progress/update-2025-06-29.md"
    "./docs/development-progress-update-2025-06-30.md" = "./documentation/05-project-management/progress/update-2025-06-30.md"
    
    # Device monitor documentation
    "./docs/device-monitor-enhancement-summary.md" = "./documentation/02-development/device-monitor-enhancement-summary.md"
    "./docs/device-monitor-tasks.md" = "./documentation/02-development/device-monitor-tasks.md"
    "./docs/device-monitor-test-report-2025-06-25.md" = "./documentation/02-development/device-monitor-test-report.md"
    
    # Chinese docs
    "./docs/k12-experiment-resources-plan.md" = "./documentation/01-project-overview/k12-experiment-resources-plan.md"
    "./docs/SSLAB-涓撳埄鐢宠鏉愭枡.md" = "./documentation/06-legal/patent-application-sslab.md"
    "./docs/骞冲彴鍔熻兘璇存槑鏂囨。.md" = "./documentation/01-project-overview/platform-features.md"
    "./docs/寮€鍙戣鑼冧笌鎿嶄綔鎸囧崡.md" = "./documentation/02-development/development-standards.md"
    "./docs/鏂囨。绱㈠紩.md" = "./documentation/00-index/old-document-index.md"
    "./docs/閮ㄧ讲杩愮淮鎸囧崡.md" = "./documentation/03-deployment/operations-guide.md"
    "./docs/椤圭洰杩涘害鎶ュ憡.md" = "./documentation/05-project-management/project-progress-report.md"
}

# Make sure progress folder exists
if (-not (Test-Path -Path "./documentation/05-project-management/progress")) {
    New-Item -Path "./documentation/05-project-management/progress" -ItemType Directory -Force | Out-Null
    Write-Host "  Created directory: ./documentation/05-project-management/progress" -ForegroundColor Green
}

foreach ($srcFile in $docMappings.Keys) {
    $destFile = $docMappings[$srcFile]
    
    if (Test-Path -Path $srcFile) {
        # Ensure target directory exists
        $destDir = Split-Path -Path $destFile -Parent
        if (-not (Test-Path -Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            Write-Host "  Created directory: $destDir" -ForegroundColor Green
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
    else {
        Write-Host "  Warning: Source file not found: $srcFile" -ForegroundColor Yellow
    }
}

# Update progress index
$progressIndexContent = @"
# Development Progress Updates

This directory contains daily progress update reports for the AICAM platform development.

## Latest Updates

- [Update 2025-06-28](./update-2025-06-28.md)
- [Update 2025-06-27](./update-2025-06-27.md)
- [Update 2025-06-26](./update-2025-06-26.md)
- [Update 2025-06-25](./update-2025-06-25.md)
- [Update 2025-06-24-2](./update-2025-06-24-2.md)
- [Update 2025-06-24](./update-2025-06-24.md)

## All Updates

$(
    $updates = Get-ChildItem -Path "./documentation/05-project-management/progress" -Filter "update-*.md" | 
    Sort-Object -Property Name -Descending
    
    foreach ($update in $updates) {
        $dateString = $update.Name -replace "update-", "" -replace ".md", ""
        "- [Update $dateString](./$($update.Name))"
    }
)

---

Last Updated: $(Get-Date -Format "yyyy-MM-dd")
"@

Set-Content -Path "./documentation/05-project-management/progress/index.md" -Value $progressIndexContent -Encoding UTF8
Write-Host "  Created progress index: ./documentation/05-project-management/progress/index.md" -ForegroundColor Green

Write-Host ""
Write-Host "Additional document organization completed!" -ForegroundColor Green
Write-Host "All docs have been organized into the documentation directory structure" -ForegroundColor Green

