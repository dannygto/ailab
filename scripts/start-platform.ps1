# AICAM Platform Startup Script
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

Write-Host "=== AICAM骞冲彴鍚姩宸ュ叿 ===" -ForegroundColor Cyan
Write-Host "鍚姩鍓嶇銆佸悗绔笌AI鏈嶅姟..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# 鍙傛暟瀹氫箟
param (
    [switch]$frontend,
    [switch]$backend,
    [switch]$ai,
    [switch]$all,
    [switch]$dev,
    [switch]$production
)

# 濡傛灉娌℃湁鎸囧畾浠讳綍鍙傛暟锛岄粯璁や负鍚姩鍏ㄩ儴
if (-not ($frontend -or $backend -or $ai -or $all)) {
    $all = $true
}

# 濡傛灉娌℃湁鎸囧畾妯″紡锛岄粯璁や负寮€鍙戞ā寮?
if (-not ($dev -or $production)) {
    $dev = $true
}

# 鍚姩妯″紡
$mode = if ($dev) { "寮€鍙? } else { "鐢熶骇" }

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location

# 璁剧疆宸ヤ綔鐩綍涓洪」鐩牴鐩綍
Set-Location $PSScriptRoot/..

Write-Host "褰撳墠妯″紡: $mode" -ForegroundColor Green
Write-Host "宸ヤ綔鐩綍: $(Get-Location)" -ForegroundColor Gray

# 绔彛娓呯悊鍑芥暟
function Clear-Port {
    param ([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "娓呯悊绔彛 $Port..." -ForegroundColor Yellow
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "绔彛娓呯悊鏃跺嚭鐜拌鍛? $_" -ForegroundColor Yellow
    }
}

# 鍚姩鍚庣鏈嶅姟
function Start-Backend {
    Write-Host "鍚姩鍚庣鏈嶅姟..." -ForegroundColor Green
    
    # 娓呯悊绔彛
    Clear-Port -Port 3002
    
    try {
        if ($production) {
            # 鐢熶骇妯″紡
            if (-not (Test-Path "backend/dist/server.js")) {
                Write-Host "鐢熶骇鏋勫缓涓嶅瓨鍦紝璇峰厛杩愯鏋勫缓鑴氭湰" -ForegroundColor Red
                return $false
            }
            Set-Location backend
            $process = Start-Process npm -ArgumentList "start" -PassThru -WindowStyle Minimized
        } else {
            # 寮€鍙戞ā寮?
            $tempScript = "$env:TEMP\start-backend-dev.ps1"
            @"
Set-Location '$($PSScriptRoot)/../backend'
Write-Host '鍚庣寮€鍙戞湇鍔″櫒鍚姩涓?..' -ForegroundColor Green
npm run dev
"@ | Out-File -FilePath $tempScript -Encoding UTF8
            
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempScript
        }
        
        Write-Host "鍚庣鏈嶅姟鍚姩瀹屾垚 (绔彛: 3002)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "鍚庣鏈嶅姟鍚姩澶辫触: $_" -ForegroundColor Red
        return $false
    }
}

# 鍚姩鍓嶇鏈嶅姟
function Start-Frontend {
    Write-Host "鍚姩鍓嶇鏈嶅姟..." -ForegroundColor Green
    
    # 娓呯悊绔彛
    Clear-Port -Port 3000
    
    try {
        if ($production) {
            # 鐢熶骇妯″紡
            if (-not (Test-Path "frontend/build")) {
                Write-Host "鐢熶骇鏋勫缓涓嶅瓨鍦紝璇峰厛杩愯鏋勫缓鑴氭湰" -ForegroundColor Red
                return $false
            }
            # 浣跨敤闈欐€佹枃浠舵湇鍔″櫒
            Set-Location frontend
            $process = Start-Process npx -ArgumentList "serve", "-s", "build", "-p", "3000" -PassThru -WindowStyle Minimized
        } else {
            # 寮€鍙戞ā寮?
            $tempScript = "$env:TEMP\start-frontend-dev.ps1"
            @"
Set-Location '$($PSScriptRoot)/../frontend'
Write-Host '鍓嶇寮€鍙戞湇鍔″櫒鍚姩涓?..' -ForegroundColor Green
npm start
"@ | Out-File -FilePath $tempScript -Encoding UTF8
            
            Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempScript
        }
        
        Write-Host "鍓嶇鏈嶅姟鍚姩瀹屾垚 (绔彛: 3000)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "鍓嶇鏈嶅姟鍚姩澶辫触: $_" -ForegroundColor Red
        return $false
    }
}

# 涓诲惎鍔ㄩ€昏緫
try {
    $success = $true
    
    if ($backend -or $all) {
        $success = Start-Backend -and $success
        Start-Sleep -Seconds 3
    }
    
    if ($frontend -or $all) {
        $success = Start-Frontend -and $success
        Start-Sleep -Seconds 3
    }
    
    if ($success) {
        Write-Host "" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "AICAM骞冲彴鍚姩瀹屾垚!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        if ($frontend -or $all) {
            Write-Host "鍓嶇: http://localhost:3000" -ForegroundColor Cyan
        }
        if ($backend -or $all) {
            Write-Host "鍚庣API: http://localhost:3002" -ForegroundColor Cyan
        }
        Write-Host "浣跨敤浠诲姟 '5-鍋滄鎵€鏈夋湇鍔? 鏉ュ仠姝㈠钩鍙? -ForegroundColor Yellow
    } else {
        Write-Host "骞冲彴鍚姩杩囩▼涓亣鍒伴敊璇? -ForegroundColor Red
    }
    
} catch {
    Write-Host "鍚姩杩囩▼涓彂鐢熸剰澶栭敊璇? $_" -ForegroundColor Red
} finally {
    # 鎭㈠鍘熷鐩綍
    Set-Location $currentDir
}

