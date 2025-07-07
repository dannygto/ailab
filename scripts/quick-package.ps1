# 蹇€熸墦鍖呰剼鏈?
# 鎵ц鍏ㄩ儴娴嬭瘯锛屾瀯寤哄苟鎵撳寘鏈€缁堢殑浜や粯浜х墿

$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化

Write-Host "===== AICAM骞冲彴 v1.0 蹇€熸墦鍖?=====" -ForegroundColor Cyan
Write-Host "鎵ц娴嬭瘯銆佹瀯寤哄苟鎵撳寘鏈€缁堜氦浠樹骇鐗?.." -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
$scriptsPath = Join-Path $rootPath "scripts"

# 1. 杩愯娴嬭瘯
Write-Host "1. 杩愯鎵€鏈夋祴璇?.." -ForegroundColor Yellow
Write-Host "   1.1 杩愯鍓嶇娴嬭瘯" -ForegroundColor Gray
try {
    Push-Location (Join-Path $rootPath "frontend")
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   鍓嶇娴嬭瘯澶辫触锛屾槸鍚︾户缁? (Y/N)" -ForegroundColor Red
        $continue = Read-Host
        if ($continue -ne "Y" -and $continue -ne "y") {
            Write-Host "缁堟鎵撳寘娴佺▼" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   鍓嶇娴嬭瘯閫氳繃 鉁? -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "   鍓嶇娴嬭瘯澶辫触: $_" -ForegroundColor Red
    Pop-Location
}

Write-Host "   1.2 杩愯鍚庣娴嬭瘯" -ForegroundColor Gray
try {
    Push-Location (Join-Path $rootPath "backend")
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   鍚庣娴嬭瘯澶辫触锛屾槸鍚︾户缁? (Y/N)" -ForegroundColor Red
        $continue = Read-Host
        if ($continue -ne "Y" -and $continue -ne "y") {
            Write-Host "缁堟鎵撳寘娴佺▼" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   鍚庣娴嬭瘯閫氳繃 鉁? -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "   鍚庣娴嬭瘯澶辫触: $_" -ForegroundColor Red
    Pop-Location
}

# 2. 鏋勫缓鍓嶅悗绔?
Write-Host "2. 鏋勫缓鍓嶅悗绔?.." -ForegroundColor Yellow
Write-Host "   2.1 杩愯鍓嶇鏋勫缓" -ForegroundColor Gray
try {
    Push-Location (Join-Path $rootPath "frontend")
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   鍓嶇鏋勫缓澶辫触锛岀粓姝㈡墦鍖呮祦绋? -ForegroundColor Red
        exit 1
    } else {
        Write-Host "   鍓嶇鏋勫缓鎴愬姛 鉁? -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "   鍓嶇鏋勫缓澶辫触: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "   2.2 杩愯鍚庣鏋勫缓" -ForegroundColor Gray
try {
    Push-Location (Join-Path $rootPath "backend")
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   鍚庣鏋勫缓澶辫触锛岀粓姝㈡墦鍖呮祦绋? -ForegroundColor Red
        exit 1
    } else {
        Write-Host "   鍚庣鏋勫缓鎴愬姛 鉁? -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "   鍚庣鏋勫缓澶辫触: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# 3. 鍒涘缓鏈€缁堜氦浠樺寘
Write-Host "3. 鍒涘缓鏈€缁堜氦浠樺寘..." -ForegroundColor Yellow
try {
    & (Join-Path $scriptsPath "build-release.ps1")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   浜や粯鍖呭垱寤哄け璐? -ForegroundColor Red
        exit 1
    } else {
        Write-Host "   浜や粯鍖呭垱寤烘垚鍔?鉁? -ForegroundColor Green
    }
} catch {
    Write-Host "   浜や粯鍖呭垱寤哄け璐? $_" -ForegroundColor Red
    exit 1
}

# 4. 鏇存柊鏂囨。
Write-Host "4. 鏁寸悊鏂囨。缁撴瀯..." -ForegroundColor Yellow
try {
    & (Join-Path $scriptsPath "organize-docs-final.ps1")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   鏂囨。鏁寸悊澶辫触锛岃鎵嬪姩妫€鏌? -ForegroundColor Yellow
    } else {
        Write-Host "   鏂囨。鏁寸悊鎴愬姛 鉁? -ForegroundColor Green
    }
} catch {
    Write-Host "   鏂囨。鏁寸悊澶辫触: $_" -ForegroundColor Yellow
}

# 5. 瀹屾垚
Write-Host ""
Write-Host "===== AICAM骞冲彴 v1.0 鎵撳寘瀹屾垚! =====" -ForegroundColor Green
Write-Host "浜や粯鍖呭凡鍑嗗灏辩华锛屼綅浜? D:\AICAMV2\release" -ForegroundColor Cyan
Write-Host "ZIP褰掓。鏂囦欢: D:\AICAMV2\AICAM_v1.0_Release.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "鎮ㄥ彲浠ラ€氳繃浠ヤ笅鏂瑰紡寮€濮嬩娇鐢?" -ForegroundColor Yellow
Write-Host "1. 瑙ｅ帇ZIP鏂囦欢鍒扮洰鏍囩幆澧? -ForegroundColor White
Write-Host "2. 杩愯 deployment/scripts/start-platform.ps1 -prod 鍚姩鐢熶骇鐜" -ForegroundColor White
Write-Host ""
Write-Host "AICAM骞冲彴 v1.0 姝ｅ紡鐗堝凡鎴愬姛浜や粯!" -ForegroundColor Green

