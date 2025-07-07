# organize-project
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# 椤圭洰浠ｇ爜鏁寸悊鑴氭湰
Write-Host "=== AICAM骞冲彴浠ｇ爜鏁寸悊宸ュ叿 ===" -ForegroundColor Cyan
Write-Host "娓呯悊鍜岀粍缁囬」鐩粨鏋?.." -ForegroundColor Cyan
Write-Host ""

# 纭繚scripts鐩綍瀛樺湪
if (-not (Test-Path -Path "./scripts")) {
    New-Item -Path "./scripts" -ItemType Directory | Out-Null
    Write-Host "鍒涘缓scripts鐩綍" -ForegroundColor Green
}

# 娓呯悊鏃х殑涓存椂鏂囦欢
Write-Host "娓呯悊涓存椂鏂囦欢..." -ForegroundColor Yellow
$tempFiles = @(
    "*.log",
    "*.tmp",
    "frontend/*.log",
    "backend/*.log"
)

foreach ($pattern in $tempFiles) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Host "  鍒犻櫎: $($_.FullName)" -ForegroundColor Gray
    }
}

# 鏁寸悊鏂囨。
Write-Host "鏁寸悊鏂囨。缁撴瀯..." -ForegroundColor Yellow

# 纭繚documentation鐩綍缁撴瀯瀹屾暣
$docDirs = @(
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
        New-Item -Path $dir -ItemType Directory | Out-Null
        Write-Host "  鍒涘缓鐩綍: $dir" -ForegroundColor Green
    }
}

# 妫€鏌ュ苟绉诲姩鏍圭洰褰曚笅鐨凪D鏂囦欢鍒伴€傚綋鐨勬枃妗ｇ洰褰?
Write-Host "澶勭悊鏍圭洰褰曚笅鐨勬枃妗ｆ枃浠?.." -ForegroundColor Yellow

# 瀹氫箟鏂囦欢鏄犲皠瑙勫垯 (婧愭枃浠?-> 鐩爣璺緞)
$fileMappings = @{
    "./README.md" = "./README.md"  # 淇濈暀鍦ㄦ牴鐩綍
    "./README_NEW.md" = "./documentation/01-project-overview/README.md"
    "./README_STANDARD.md" = "./documentation/01-project-overview/standard-readme.md"
    "./STARTUP-GUIDE.md" = "./documentation/03-deployment/startup-guide.md"
    "./STARTUP-GUIDE_NEW.md" = "./documentation/03-deployment/startup-guide-new.md"
    "./PWA搴旂敤鏇存柊璇存槑.md" = "./documentation/02-development/pwa-update-guide.md"
    "./椤圭洰瀹屾垚搴︽€荤粨.md" = "./documentation/05-project-management/completion-summary.md"
    "./鏈€缁堜氦浠樻鏌ユ竻鍗?md" = "./documentation/05-project-management/final-delivery-checklist.md"
    "./浜や粯鎶ュ憡-2025骞?鏈?7鏃?md" = "./documentation/05-project-management/delivery-report-2025-06-27.md"
    "./浠ｇ爜鏋勫缓杩唬瀹屾垚鎶ュ憡.md" = "./documentation/05-project-management/build-iteration-completion-report.md"
    "./浠ｇ爜妯″潡瀹屾垚搴﹁鎯?md" = "./documentation/05-project-management/module-completion-details.md"
    "./蹇€熷惎鍔ㄦ寚鍗?md" = "./documentation/03-deployment/quick-start-guide.md"
    "./DOCUMENT_CLEANUP_PLAN.md" = "./documentation/05-project-management/document-cleanup-plan.md"
}

foreach ($srcFile in $fileMappings.Keys) {
    $destFile = $fileMappings[$srcFile]
    
    # 璺宠繃淇濈暀鍦ㄦ牴鐩綍鐨勬枃浠?
    if ($srcFile -eq $destFile) { continue }
    
    if (Test-Path -Path $srcFile) {
        # 纭繚鐩爣鐩綍瀛樺湪
        $destDir = Split-Path -Path $destFile -Parent
        if (-not (Test-Path -Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # 濡傛灉鐩爣鏂囦欢宸插瓨鍦紝杩涜澶囦唤
        if (Test-Path -Path $destFile) {
            $backupFile = "$destFile.bak"
            Copy-Item -Path $destFile -Destination $backupFile -Force
            Write-Host "  澶囦唤: $destFile -> $backupFile" -ForegroundColor Gray
        }
        
        # 绉诲姩鏂囦欢
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "  澶嶅埗: $srcFile -> $destFile" -ForegroundColor Green
    }
}

# 鍒涘缓缁熶竴鐨勬枃妗ｇ储寮?
Write-Host "鍒涘缓鏂囨。绱㈠紩..." -ForegroundColor Yellow
$indexContent = @"
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

Set-Content -Path "./documentation/00-index/document-index.md" -Value $indexContent -Encoding UTF8
Write-Host "  鍒涘缓鏂囨。绱㈠紩: ./documentation/00-index/document-index.md" -ForegroundColor Green

# 鏁寸悊from docs鍒癲ocumentation
Write-Host "鏁村悎docs鐩綍鍐呭鍒癲ocumentation..." -ForegroundColor Yellow

# 纭繚鐩爣鐩綍瀛樺湪
if (-not (Test-Path -Path "./documentation/00-index")) {
    New-Item -Path "./documentation/00-index" -ItemType Directory | Out-Null
}

# 澶嶅埗docs鐩綍涓嬬殑鏂囨。绱㈠紩鍒版柊浣嶇疆
if (Test-Path -Path "./docs/鏂囨。绱㈠紩.md") {
    Copy-Item -Path "./docs/鏂囨。绱㈠紩.md" -Destination "./documentation/00-index/old-document-index.md" -Force
    Write-Host "  澶嶅埗: ./docs/鏂囨。绱㈠紩.md -> ./documentation/00-index/old-document-index.md" -ForegroundColor Green
}

# 绉诲姩鍏朵粬鏂囨。
$docMappings = @{
    "./docs/骞冲彴鍔熻兘璇存槑鏂囨。.md" = "./documentation/01-project-overview/platform-features.md"
    "./docs/寮€鍙戣鑼冧笌鎿嶄綔鎸囧崡.md" = "./documentation/02-development/development-standards.md"
    "./docs/閮ㄧ讲杩愮淮鎸囧崡.md" = "./documentation/03-deployment/operations-guide.md"
    "./docs/椤圭洰杩涘害鎶ュ憡.md" = "./documentation/05-project-management/project-progress.md"
    "./docs/SSLAB-涓撳埄鐢宠鏉愭枡.md" = "./documentation/06-legal/patent-application.md"
}

foreach ($srcFile in $docMappings.Keys) {
    $destFile = $docMappings[$srcFile]
    
    if (Test-Path -Path $srcFile) {
        # 纭繚鐩爣鐩綍瀛樺湪
        $destDir = Split-Path -Path $destFile -Parent
        if (-not (Test-Path -Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # 濡傛灉鐩爣鏂囦欢宸插瓨鍦紝杩涜澶囦唤
        if (Test-Path -Path $destFile) {
            $backupFile = "$destFile.bak"
            Copy-Item -Path $destFile -Destination $backupFile -Force
            Write-Host "  澶囦唤: $destFile -> $backupFile" -ForegroundColor Gray
        }
        
        # 澶嶅埗鏂囦欢
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "  澶嶅埗: $srcFile -> $destFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Code organization completed!" -ForegroundColor Green
Write-Host "You can check the organized document structure in the documentation directory" -ForegroundColor Green


