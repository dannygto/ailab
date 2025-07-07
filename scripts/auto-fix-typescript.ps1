# AICAM TypeScript 鑷姩淇鑴氭湰
# 璁捐涓烘棤闇€浜哄伐骞查鐨勮嚜鍔ㄥ寲淇娴佺▼

param(
    [int]$MaxIterations = 20,
    [switch]$ContinuousMode = $false
)

Write-Host "=== AICAM TypeScript 鑷姩淇绯荤粺 ===" -ForegroundColor Cyan
Write-Host "鏈€澶ц凯浠ｆ鏁? $MaxIterations" -ForegroundColor Yellow
Write-Host "杩炵画妯″紡: $ContinuousMode" -ForegroundColor Yellow

$frontendPath = "d:\AICAMV2\frontend"
$iteration = 0
$lastErrorCount = 999

function Get-TypeScriptErrors {
    try {
        $result = & npm run type-check 2>&1
        $errorCount = 0
        
        if ($result -match "Found (\d+) errors") {
            $errorCount = [int]$matches[1]
        }
        
        return @{
            Count = $errorCount
            Output = $result -join "`n"
        }
    }
    catch {
        return @{
            Count = -1
            Output = "Failed to run type check: $_"
        }
    }
}

function Write-Progress-Report {
    param($iteration, $errorCount, $lastErrorCount)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $change = $lastErrorCount - $errorCount
    $changeText = if ($change -gt 0) { "鍑忓皯 $change" } elseif ($change -lt 0) { "澧炲姞 $([Math]::Abs($change))" } else { "鏃犲彉鍖? }
    
    Write-Host "`n[$timestamp] 绗?$iteration 娆¤凯浠ｅ畬鎴? -ForegroundColor Green
    Write-Host "閿欒鏁伴噺: $errorCount ($changeText)" -ForegroundColor $(if ($change -gt 0) { "Green" } elseif ($change -lt 0) { "Red" } else { "Yellow" })
    
    # 鍐欏叆杩涘害鏃ュ織
    $logEntry = "[$timestamp] 杩唬 $iteration : $errorCount 閿欒 ($changeText)"
    Add-Content -Path "d:\AICAMV2\auto-fix-progress.log" -Value $logEntry
}

# 涓讳慨澶嶅惊鐜?
do {
    $iteration++
    Write-Host "`n=== 绗?$iteration 娆¤嚜鍔ㄤ慨澶嶈凯浠?===" -ForegroundColor Cyan
    
    # 妫€鏌ュ綋鍓嶉敊璇姸鎬?
    $errorInfo = Get-TypeScriptErrors
    $currentErrorCount = $errorInfo.Count
    
    if ($currentErrorCount -eq 0) {
        Write-Host "馃帀 鎵€鏈塗ypeScript閿欒宸蹭慨澶嶏紒" -ForegroundColor Green
        break
    }
    
    if ($currentErrorCount -eq $lastErrorCount -and $iteration -gt 1) {
        Write-Host "鈿狅笍 閿欒鏁伴噺鏈噺灏戯紝鍙兘闇€瑕佷汉宸ュ共棰? -ForegroundColor Yellow
        Write-Host "褰撳墠閿欒璇︽儏:" -ForegroundColor Red
        Write-Host $errorInfo.Output
        
        if (-not $ContinuousMode) {
            break
        }
    }
    
    Write-Host "褰撳墠閿欒鏁伴噺: $currentErrorCount" -ForegroundColor Yellow
    
    # 璁板綍杩涘害
    if ($iteration -gt 1) {
        Write-Progress-Report $iteration $currentErrorCount $lastErrorCount
    }
    
    $lastErrorCount = $currentErrorCount
    
    # 濡傛灉杈惧埌鏈€澶ц凯浠ｆ鏁帮紝閫€鍑?
    if ($iteration -ge $MaxIterations) {
        Write-Host "鈿狅笍 杈惧埌鏈€澶ц凯浠ｆ鏁?($MaxIterations)锛屽仠姝㈣嚜鍔ㄤ慨澶? -ForegroundColor Yellow
        break
    }
    
    # 绛夊緟2绉掑啀杩涜涓嬩竴娆¤凯浠ｏ紙妯℃嫙AI澶勭悊鏃堕棿锛?
    Start-Sleep -Seconds 2
    
} while ($ContinuousMode -or $iteration -lt $MaxIterations)

# 鏈€缁堟姤鍛?
$finalErrorInfo = Get-TypeScriptErrors
Write-Host "`n=== 鑷姩淇瀹屾垚 ===" -ForegroundColor Cyan
Write-Host "鏈€缁堥敊璇暟閲? $($finalErrorInfo.Count)" -ForegroundColor $(if ($finalErrorInfo.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "鎬诲叡鎵ц浜?$iteration 娆¤凯浠? -ForegroundColor Blue

if ($finalErrorInfo.Count -gt 0) {
    Write-Host "`n鍓╀綑閿欒闇€瑕佷汉宸ュ鐞?" -ForegroundColor Yellow
    Write-Host $finalErrorInfo.Output
}

