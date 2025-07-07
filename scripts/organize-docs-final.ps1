# Final document organization script for Chinese filenames
$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化

Write-Host "=== AICAM Platform Final Document Organization Tool ===" -ForegroundColor Cyan
Write-Host "Processing Chinese filenames..." -ForegroundColor Cyan
Write-Host ""

# List all files in docs directory
$docsFiles = Get-ChildItem -Path "./docs" -Filter "*.md"
Write-Host "Found $($docsFiles.Count) files in docs directory" -ForegroundColor Yellow

# Process specific Chinese filename files manually
if (Test-Path -Path "./docs/SSLAB-涓撳埄鐢宠鏉愭枡.md") {
    Copy-Item -Path "./docs/SSLAB-涓撳埄鐢宠鏉愭枡.md" -Destination "./documentation/06-legal/patent-application-sslab.md" -Force
    Write-Host "  Copied: SSLAB patent application materials" -ForegroundColor Green
}

if (Test-Path -Path "./docs/骞冲彴鍔熻兘璇存槑鏂囨。.md") {
    Copy-Item -Path "./docs/骞冲彴鍔熻兘璇存槑鏂囨。.md" -Destination "./documentation/01-project-overview/platform-features.md" -Force
    Write-Host "  Copied: Platform features documentation" -ForegroundColor Green
}

if (Test-Path -Path "./docs/寮€鍙戣鑼冧笌鎿嶄綔鎸囧崡.md") {
    Copy-Item -Path "./docs/寮€鍙戣鑼冧笌鎿嶄綔鎸囧崡.md" -Destination "./documentation/02-development/development-standards.md" -Force
    Write-Host "  Copied: Development standards guide" -ForegroundColor Green
}

if (Test-Path -Path "./docs/鏂囨。绱㈠紩.md") {
    Copy-Item -Path "./docs/鏂囨。绱㈠紩.md" -Destination "./documentation/00-index/old-document-index.md" -Force
    Write-Host "  Copied: Old document index" -ForegroundColor Green
}

if (Test-Path -Path "./docs/閮ㄧ讲杩愮淮鎸囧崡.md") {
    Copy-Item -Path "./docs/閮ㄧ讲杩愮淮鎸囧崡.md" -Destination "./documentation/03-deployment/operations-guide.md" -Force
    Write-Host "  Copied: Deployment operations guide" -ForegroundColor Green
}

if (Test-Path -Path "./docs/椤圭洰杩涘害鎶ュ憡.md") {
    Copy-Item -Path "./docs/椤圭洰杩涘害鎶ュ憡.md" -Destination "./documentation/05-project-management/project-progress-report.md" -Force
    Write-Host "  Copied: Project progress report" -ForegroundColor Green
}

# Create a master document index with all available documents
Write-Host "Creating master document index..." -ForegroundColor Yellow

# Get all markdown files in documentation directory
$allDocs = Get-ChildItem -Path "./documentation" -Filter "*.md" -Recurse | 
    Where-Object { $_.DirectoryName -notlike "*/.git*" }

# Group files by directory
$docsGroups = $allDocs | Group-Object -Property { $_.DirectoryName }

$masterIndexContent = @"
# AICAM Platform Master Document Index

This document provides a complete index of all documentation files available in the AICAM platform.

Last Updated: $(Get-Date -Format "yyyy-MM-dd")

"@

foreach ($group in $docsGroups | Sort-Object -Property Name) {
    $relativePath = $group.Name -replace [regex]::Escape((Resolve-Path -Path ".").Path), "."
    $relativePath = $relativePath -replace "\\", "/"
    $sectionName = $relativePath -replace "./documentation/", ""
    
    # Skip the index directory itself to avoid circular references
    if ($sectionName -eq "00-index") { continue }
    
    $sectionHeader = switch -Regex ($sectionName) {
        "^01-project-overview" { "## 1. Project Overview" }
        "^02-development" { "## 2. Development" }
        "^03-deployment" { "## 3. Deployment" }
        "^04-api-reference" { "## 4. API Reference" }
        "^05-project-management" { "## 5. Project Management" }
        "^05-project-management/progress" { "## 5.1. Progress Updates" }
        "^06-legal" { "## 6. Legal Documents" }
        "^07-user-guides" { "## 7. User Guides" }
        default { "## $sectionName" }
    }
    
    $masterIndexContent += "$sectionHeader`n`n"
    
    foreach ($file in $group.Group | Sort-Object -Property Name) {
        $relativePath = $file.FullName -replace [regex]::Escape((Resolve-Path -Path ".").Path), "."
        $relativePath = $relativePath -replace "\\", "/"
        $fileName = $file.Name -replace ".md", ""
        $displayName = $fileName -replace "-", " " -replace "_", " "
        $displayName = (Get-Culture).TextInfo.ToTitleCase($displayName)
        
        # Skip backup files
        if ($fileName -like "*.bak") { continue }
        
        $masterIndexContent += "- [$displayName]($relativePath)`n"
    }
    
    $masterIndexContent += "`n"
}

Set-Content -Path "./documentation/00-index/master-document-index.md" -Value $masterIndexContent -Encoding UTF8
Write-Host "  Created master document index: ./documentation/00-index/master-document-index.md" -ForegroundColor Green

Write-Host ""
Write-Host "Final document organization completed!" -ForegroundColor Green
Write-Host "All docs have been organized into the documentation directory structure" -ForegroundColor Green

