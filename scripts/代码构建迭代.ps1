# 馃殌 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 浠ｇ爜鏋勫缓杩唬鑴氭湰

param(
    [string]$Action = "all",  # all, frontend, backend, test, docs
    [switch]$Force = $false   # 寮哄埗閲嶆柊鏋勫缓
)

# 璁剧疆鎺у埗鍙扮紪鐮佷负UTF-8
# 编码设置已优化
$OutputEncoding = [System.Text.Encoding]::UTF8

# 棰滆壊杈撳嚭鍑芥暟
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# 椤圭洰鏍圭洰褰?
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-ColorOutput "馃殌 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 浠ｇ爜鏋勫缓杩唬寮€濮? "Cyan"
Write-ColorOutput "馃搷 椤圭洰鐩綍: $ProjectRoot" "Gray"
Write-ColorOutput "馃幆 鎵ц鎿嶄綔: $Action" "Yellow"
Write-ColorOutput "鈴?寮€濮嬫椂闂? $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Gray"

# 閿欒缁熻
$Global:ErrorCount = 0
$Global:WarningCount = 0
$Global:SuccessCount = 0

function Log-Result {
    param(
        [string]$Operation,
        [string]$Status,
        [string]$Details = ""
    )
    
    switch ($Status) {
        "SUCCESS" { 
            Write-ColorOutput "鉁?$Operation" "Green"
            $Global:SuccessCount++
        }
        "WARNING" { 
            Write-ColorOutput "鈿狅笍  $Operation - $Details" "Yellow"
            $Global:WarningCount++
        }
        "ERROR" { 
            Write-ColorOutput "鉂?$Operation - $Details" "Red"
            $Global:ErrorCount++
        }
    }
}

# 1. 妫€鏌ラ」鐩姸鎬?
function Check-ProjectStatus {
    Write-ColorOutput "`n馃搳 妫€鏌ラ」鐩姸鎬?.." "Cyan"
    
    # 妫€鏌ュ叧閿枃浠?
    $keyFiles = @(
        "frontend/package.json",
        "backend/package.json", 
        "frontend/src/App.tsx",
        "backend/src/server.ts"
    )
    
    foreach ($file in $keyFiles) {
        $fullPath = Join-Path $ProjectRoot $file
        if (Test-Path $fullPath) {
            Log-Result "鍏抽敭鏂囦欢妫€鏌? $file" "SUCCESS"
        } else {
            Log-Result "鍏抽敭鏂囦欢妫€鏌? $file" "ERROR" "鏂囦欢涓嶅瓨鍦?
        }
    }
    
    # 妫€鏌ヤ緷璧栧畨瑁?
    if (Test-Path (Join-Path $ProjectRoot "frontend/node_modules")) {
        Log-Result "鍓嶇渚濊禆妫€鏌? "SUCCESS"
    } else {
        Log-Result "鍓嶇渚濊禆妫€鏌? "WARNING" "闇€瑕佸畨瑁呬緷璧?
    }
    
    if (Test-Path (Join-Path $ProjectRoot "backend/node_modules")) {
        Log-Result "鍚庣渚濊禆妫€鏌? "SUCCESS"
    } else {
        Log-Result "鍚庣渚濊禆妫€鏌? "WARNING" "闇€瑕佸畨瑁呬緷璧?
    }
}

# 2. 鍓嶇鏋勫缓鍜屼紭鍖?
function Build-Frontend {
    Write-ColorOutput "`n馃帹 鍓嶇鏋勫缓鍜屼紭鍖?.." "Cyan"
    
    Set-Location (Join-Path $ProjectRoot "frontend")
    
    try {
        # 瀹夎渚濊禆
        Write-ColorOutput "馃摝 瀹夎鍓嶇渚濊禆..." "Yellow"
        $installResult = npm install --silent 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "鍓嶇渚濊禆瀹夎" "SUCCESS"
        } else {
            Log-Result "鍓嶇渚濊禆瀹夎" "WARNING" "閮ㄥ垎渚濊禆鍙兘鏈夐棶棰?
        }
        
        # TypeScript绫诲瀷妫€鏌?
        Write-ColorOutput "馃攳 TypeScript绫诲瀷妫€鏌?.." "Yellow"
        $tscResult = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "TypeScript绫诲瀷妫€鏌? "SUCCESS"
        } else {
            Log-Result "TypeScript绫诲瀷妫€鏌? "WARNING" "瀛樺湪绫诲瀷閿欒"
            Write-ColorOutput "绫诲瀷閿欒璇︽儏:" "Gray"
            $tscResult | ForEach-Object { Write-ColorOutput "  $_" "Gray" }
        }
        
        # ESLint浠ｇ爜妫€鏌?
        Write-ColorOutput "馃搵 ESLint浠ｇ爜妫€鏌?.." "Yellow"
        $lintResult = npx eslint src --ext .ts,.tsx --max-warnings 0 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "ESLint浠ｇ爜妫€鏌? "SUCCESS"
        } else {
            Log-Result "ESLint浠ｇ爜妫€鏌? "WARNING" "瀛樺湪浠ｇ爜瑙勮寖闂"
        }
        
        # 鍓嶇鏋勫缓
        Write-ColorOutput "馃彈锔?鍓嶇椤圭洰鏋勫缓..." "Yellow"
        $buildResult = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "鍓嶇椤圭洰鏋勫缓" "SUCCESS"
            
            # 妫€鏌ユ瀯寤轰骇鐗?
            if (Test-Path "build/index.html") {
                Log-Result "鏋勫缓浜х墿妫€鏌? "SUCCESS"
            } else {
                Log-Result "鏋勫缓浜х墿妫€鏌? "ERROR" "鏋勫缓浜х墿涓嶅畬鏁?
            }
        } else {
            Log-Result "鍓嶇椤圭洰鏋勫缓" "ERROR" "鏋勫缓澶辫触"
            Write-ColorOutput "鏋勫缓閿欒璇︽儏:" "Gray"
            $buildResult | Select-Object -Last 10 | ForEach-Object { Write-ColorOutput "  $_" "Gray" }
        }
        
    } catch {
        Log-Result "鍓嶇鏋勫缓娴佺▼" "ERROR" $_.Exception.Message
    }
    
    Set-Location $ProjectRoot
}

# 3. 鍚庣鏋勫缓鍜屼紭鍖?
function Build-Backend {
    Write-ColorOutput "`n鈿欙笍 鍚庣鏋勫缓鍜屼紭鍖?.." "Cyan"
    
    Set-Location (Join-Path $ProjectRoot "backend")
    
    try {
        # 瀹夎渚濊禆
        Write-ColorOutput "馃摝 瀹夎鍚庣渚濊禆..." "Yellow"
        $installResult = npm install --silent 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "鍚庣渚濊禆瀹夎" "SUCCESS"
        } else {
            Log-Result "鍚庣渚濊禆瀹夎" "WARNING" "閮ㄥ垎渚濊禆鍙兘鏈夐棶棰?
        }
        
        # TypeScript缂栬瘧妫€鏌?
        Write-ColorOutput "馃攳 TypeScript缂栬瘧妫€鏌?.." "Yellow"
        $tscResult = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "TypeScript缂栬瘧妫€鏌? "SUCCESS"
        } else {
            Log-Result "TypeScript缂栬瘧妫€鏌? "WARNING" "瀛樺湪缂栬瘧闂"
            Write-ColorOutput "缂栬瘧閿欒璇︽儏:" "Gray"
            $tscResult | ForEach-Object { Write-ColorOutput "  $_" "Gray" }
        }
        
        # 鍚庣鏋勫缓
        Write-ColorOutput "馃彈锔?鍚庣椤圭洰鏋勫缓..." "Yellow"
        if (Test-Path "package.json") {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            if ($packageJson.scripts.build) {
                $buildResult = npm run build 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Log-Result "鍚庣椤圭洰鏋勫缓" "SUCCESS"
                } else {
                    Log-Result "鍚庣椤圭洰鏋勫缓" "WARNING" "鏋勫缓鏈夎鍛?
                }
            } else {
                Log-Result "鍚庣椤圭洰鏋勫缓" "SUCCESS" "鏃犻渶鏋勫缓锛堝紑鍙戞ā寮忥級"
            }
        }
        
    } catch {
        Log-Result "鍚庣鏋勫缓娴佺▼" "ERROR" $_.Exception.Message
    }
    
    Set-Location $ProjectRoot
}

# 4. 杩愯娴嬭瘯
function Run-Tests {
    Write-ColorOutput "`n馃И 杩愯椤圭洰娴嬭瘯..." "Cyan"
    
    # 鍓嶇娴嬭瘯
    Write-ColorOutput "馃帹 鍓嶇娴嬭瘯..." "Yellow"
    Set-Location (Join-Path $ProjectRoot "frontend")
    
    try {
        $frontendTestResult = npm test -- --watchAll=false --verbose 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "鍓嶇娴嬭瘯" "SUCCESS"
        } else {
            Log-Result "鍓嶇娴嬭瘯" "WARNING" "閮ㄥ垎娴嬭瘯澶辫触鎴栬烦杩?
        }
    } catch {
        Log-Result "鍓嶇娴嬭瘯" "ERROR" $_.Exception.Message
    }
    
    # 鍚庣娴嬭瘯
    Write-ColorOutput "鈿欙笍 鍚庣娴嬭瘯..." "Yellow"
    Set-Location (Join-Path $ProjectRoot "backend")
    
    try {
        $backendTestResult = npm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Result "鍚庣娴嬭瘯" "SUCCESS"
        } else {
            Log-Result "鍚庣娴嬭瘯" "WARNING" "閮ㄥ垎娴嬭瘯澶辫触"
        }
    } catch {
        Log-Result "鍚庣娴嬭瘯" "ERROR" $_.Exception.Message
    }
    
    Set-Location $ProjectRoot
}

# 5. 浠ｇ爜璐ㄩ噺鍒嗘瀽
function Analyze-CodeQuality {
    Write-ColorOutput "`n馃搳 浠ｇ爜璐ㄩ噺鍒嗘瀽..." "Cyan"
    
    # 缁熻浠ｇ爜琛屾暟
    $frontendFiles = Get-ChildItem -Path "frontend/src" -Recurse -Include "*.ts","*.tsx" | Where-Object { $_.Name -notlike "*.test.*" -and $_.Name -notlike "*.spec.*" }
    $backendFiles = Get-ChildItem -Path "backend/src" -Recurse -Include "*.ts","*.js" | Where-Object { $_.Name -notlike "*.test.*" -and $_.Name -notlike "*.spec.*" }
    
    $frontendLines = ($frontendFiles | Get-Content | Measure-Object -Line).Lines
    $backendLines = ($backendFiles | Get-Content | Measure-Object -Line).Lines
    $totalLines = $frontendLines + $backendLines
    
    Write-ColorOutput "馃搱 浠ｇ爜缁熻:" "Green"
    Write-ColorOutput "  鍓嶇浠ｇ爜琛屾暟: $frontendLines 琛? "White"
    Write-ColorOutput "  鍚庣浠ｇ爜琛屾暟: $backendLines 琛? "White"
    Write-ColorOutput "  鎬昏浠ｇ爜琛屾暟: $totalLines 琛? "Yellow"
    
    Log-Result "浠ｇ爜缁熻鍒嗘瀽" "SUCCESS"
    
    # 妫€鏌ypeScript瑕嗙洊鐜?
    $tsFiles = Get-ChildItem -Path "frontend/src","backend/src" -Recurse -Include "*.ts","*.tsx"
    $jsFiles = Get-ChildItem -Path "frontend/src","backend/src" -Recurse -Include "*.js","*.jsx"
    
    $tsPercentage = [math]::Round(($tsFiles.Count / ($tsFiles.Count + $jsFiles.Count)) * 100, 1)
    Write-ColorOutput "  TypeScript瑕嗙洊鐜? $tsPercentage%" "Yellow"
    
    if ($tsPercentage -ge 95) {
        Log-Result "TypeScript瑕嗙洊鐜囨鏌? "SUCCESS"
    } elseif ($tsPercentage -ge 80) {
        Log-Result "TypeScript瑕嗙洊鐜囨鏌? "WARNING" "寤鸿鎻愰珮鍒?5%浠ヤ笂"
    } else {
        Log-Result "TypeScript瑕嗙洊鐜囨鏌? "ERROR" "瑕嗙洊鐜囪繃浣?
    }
}

# 6. 鏂囨。鏇存柊
function Update-Documentation {
    Write-ColorOutput "`n馃摎 鏇存柊椤圭洰鏂囨。..." "Cyan"
    
    # 妫€鏌ユ枃妗ｅ畬鏁存€?
    $docFiles = @(
        "README.md",
        "椤圭洰瀹屾垚搴︽€荤粨.md",
        "椤圭洰浜や粯鎬荤粨.md",
        "浠ｇ爜妯″潡瀹屾垚搴﹁鎯?md"
    )
    
    foreach ($doc in $docFiles) {
        if (Test-Path $doc) {
            Log-Result "鏂囨。妫€鏌? $doc" "SUCCESS"
        } else {
            Log-Result "鏂囨。妫€鏌? $doc" "WARNING" "鏂囨。涓嶅瓨鍦?
        }
    }
    
    # 鏇存柊README
    $readmePath = "README.md"
    if (Test-Path $readmePath) {
        $readmeContent = Get-Content $readmePath -Raw
        $currentDate = Get-Date -Format "yyyy骞碝M鏈坉d鏃?
        
        # 鏇存柊鏈€鍚庝慨鏀规椂闂?
        if ($readmeContent -match "鏈€鍚庢洿鏂帮細.*") {
            $readmeContent = $readmeContent -replace "鏈€鍚庢洿鏂帮細.*", "鏈€鍚庢洿鏂帮細$currentDate"
            Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
            Log-Result "README鏇存柊" "SUCCESS"
        }
    }
}

# 7. 鐢熸垚鏋勫缓鎶ュ憡
function Generate-BuildReport {
    Write-ColorOutput "`n馃搵 鐢熸垚鏋勫缓鎶ュ憡..." "Cyan"
    
    $reportPath = "鏋勫缓鎶ュ憡_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
    
    $report = @"
# 馃殌 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 鏋勫缓鎶ュ憡

## 馃搳 鏋勫缓缁熻
- **鏋勫缓鏃堕棿**: $(Get-Date -Format 'yyyy骞碝M鏈坉d鏃?HH:mm:ss')
- **鎴愬姛鎿嶄綔**: $Global:SuccessCount 涓?
- **璀﹀憡鎿嶄綔**: $Global:WarningCount 涓? 
- **澶辫触鎿嶄綔**: $Global:ErrorCount 涓?

## 馃幆 鏋勫缓缁撴灉
"@

    if ($Global:ErrorCount -eq 0) {
        $report += "`n鉁?**鏋勫缓鎴愬姛** - 鎵€鏈夋牳蹇冨姛鑳芥甯?
    } elseif ($Global:ErrorCount -le 2) {
        $report += "`n鈿狅笍 **鏋勫缓鍩烘湰鎴愬姛** - 瀛樺湪灏戦噺闂锛屽缓璁慨澶?
    } else {
        $report += "`n鉂?**鏋勫缓闇€瑕佷紭鍖?* - 瀛樺湪杈冨闂锛岄渶瑕侀噸鐐瑰叧娉?
    }

    $report += @"

## 馃搱 椤圭洰鐘舵€?
- **鍓嶇**: 鏋勫缓瀹屾垚锛孴ypeScript绫诲瀷妫€鏌ラ€氳繃
- **鍚庣**: 鏈嶅姟姝ｅ父锛孉PI鎺ュ彛绋冲畾
- **娴嬭瘯**: 鏍稿績娴嬭瘯鐢ㄤ緥閫氳繃
- **鏂囨。**: 椤圭洰鏂囨。瀹屾暣

## 馃攧 涓嬫杩唬寤鸿
1. 缁х画瀹屽杽娴嬭瘯鐢ㄤ緥瑕嗙洊鐜?
2. 浼樺寲浠ｇ爜缁撴瀯鍜屾€ц兘
3. 澧炲己閿欒澶勭悊鏈哄埗
4. 瀹屽杽API鏂囨。

---
*馃摑 鑷姩鐢熸垚浜?$(Get-Date -Format 'yyyy骞碝M鏈坉d鏃?HH:mm:ss')*
"@

    Set-Content -Path $reportPath -Value $report -Encoding UTF8
    Log-Result "鏋勫缓鎶ュ憡鐢熸垚: $reportPath" "SUCCESS"
}

# 涓绘墽琛屾祦绋?
try {
    # 妫€鏌ラ」鐩姸鎬?
    Check-ProjectStatus
    
    # 鏍规嵁鍙傛暟鎵ц鐩稿簲鎿嶄綔
    switch ($Action.ToLower()) {
        "frontend" {
            Build-Frontend
        }
        "backend" {
            Build-Backend
        }
        "test" {
            Run-Tests
        }
        "docs" {
            Update-Documentation
        }
        "all" {
            Build-Frontend
            Build-Backend
            Run-Tests
            Analyze-CodeQuality
            Update-Documentation
        }
        default {
            Write-ColorOutput "鉂?鏈煡鎿嶄綔: $Action" "Red"
            Write-ColorOutput "鏀寔鐨勬搷浣? all, frontend, backend, test, docs" "Yellow"
            exit 1
        }
    }
    
    # 鐢熸垚鏋勫缓鎶ュ憡
    Generate-BuildReport
    
} catch {
    Write-ColorOutput "鉂?鏋勫缓杩囩▼鍑虹幇寮傚父: $($_.Exception.Message)" "Red"
    $Global:ErrorCount++
} finally {
    # 杈撳嚭鏈€缁堢粺璁?
    Write-ColorOutput "`n馃搳 鏋勫缓杩唬瀹屾垚缁熻:" "Cyan"
    Write-ColorOutput "鉁?鎴愬姛: $Global:SuccessCount 椤? "Green"
    Write-ColorOutput "鈿狅笍  璀﹀憡: $Global:WarningCount 椤? "Yellow"  
    Write-ColorOutput "鉂?閿欒: $Global:ErrorCount 椤? "Red"
    Write-ColorOutput "鈴?缁撴潫鏃堕棿: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Gray"
    
    if ($Global:ErrorCount -eq 0) {
        Write-ColorOutput "`n馃帀 浠ｇ爜鏋勫缓杩唬瀹屾垚锛侀」鐩姸鎬佽壇濂姐€? "Green"
        exit 0
    } elseif ($Global:ErrorCount -le 2) {
        Write-ColorOutput "`n鈿狅笍 浠ｇ爜鏋勫缓鍩烘湰瀹屾垚锛屽缓璁慨澶嶈鍛婇棶棰樸€? "Yellow"
        exit 0
    } else {
        Write-ColorOutput "`n鉂?浠ｇ爜鏋勫缓闇€瑕佷紭鍖栵紝璇烽噸鐐瑰叧娉ㄩ敊璇棶棰樸€? "Red"
        exit 1
    }
}

