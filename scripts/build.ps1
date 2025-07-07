# build
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# 鏋勫缓涓庨儴缃茶剼鏈?
Write-Host "=== AICAM骞冲彴鏋勫缓宸ュ叿 ===" -ForegroundColor Cyan
Write-Host "鏋勫缓鍓嶇銆佸悗绔笌AI鏈嶅姟..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location

# 鍙傛暟瀹氫箟
param (
    [switch]$frontend,
    [switch]$backend,
    [switch]$ai,
    [switch]$all,
    [switch]$install,
    [switch]$clean,
    [switch]$production
)

# 濡傛灉娌℃湁鎸囧畾浠讳綍鍙傛暟锛岄粯璁や负鏋勫缓鍏ㄩ儴
if (-not ($frontend -or $backend -or $ai -or $all -or $install -or $clean)) {
    $all = $true
}

# 娓呯悊鏋勫缓鏂囦欢
function Clear-ProjectBuild {
    Write-Host "馃Ч 娓呯悊椤圭洰鏋勫缓鏂囦欢..." -ForegroundColor Yellow
    
    # 娓呯悊鍓嶇鏋勫缓
    if (Test-Path -Path "frontend/build") {
        Remove-Item -Path "frontend/build" -Recurse -Force
        Write-Host "  鉁?娓呯悊鍓嶇鏋勫缓鏂囦欢" -ForegroundColor Green
    }
    
    # 娓呯悊鍚庣鏋勫缓
    if (Test-Path -Path "backend/dist") {
        Remove-Item -Path "backend/dist" -Recurse -Force
        Write-Host "  鉁?娓呯悊鍚庣鏋勫缓鏂囦欢" -ForegroundColor Green
    }
    
    Write-Host "  鉁?娓呯悊瀹屾垚" -ForegroundColor Green
}

# 瀹夎渚濊禆
function Install-Dependencies {
    Write-Host "馃摝 瀹夎椤圭洰渚濊禆..." -ForegroundColor Yellow
    
    # 瀹夎鏍圭洰褰曚緷璧?
    Write-Host "  瀹夎鏍圭洰褰曚緷璧?.." -ForegroundColor Cyan
    npm install
    
    # 瀹夎鍓嶇渚濊禆
    Write-Host "  瀹夎鍓嶇渚濊禆..." -ForegroundColor Blue
    Set-Location "frontend"
    npm install
    Set-Location $currentDir
    
    # 瀹夎鍚庣渚濊禆
    Write-Host "  瀹夎鍚庣渚濊禆..." -ForegroundColor Green
    Set-Location "backend"
    npm install
    Set-Location $currentDir
    
    # 妫€鏌I鏈嶅姟渚濊禆
    Write-Host "  妫€鏌I鏈嶅姟渚濊禆..." -ForegroundColor Magenta
    if (Test-Path -Path "ai/requirements.txt") {
        Write-Host "  鈩癸笍 AI鏈嶅姟渚濊禆闇€瑕佸崟鐙畨瑁咃紝璇蜂娇鐢? pip install -r ai/requirements.txt" -ForegroundColor Yellow
    }
    
    Write-Host "  鉁?渚濊禆瀹夎瀹屾垚" -ForegroundColor Green
}

# 鏋勫缓鍓嶇
function Start-FrontendBuild {
    Write-Host "馃帹 鏋勫缓鍓嶇..." -ForegroundColor Blue
    
    Set-Location "frontend"
    
    if ($production) {
        Write-Host "  浠ョ敓浜фā寮忔瀯寤哄墠绔?.." -ForegroundColor Blue
        npm run build
    } else {
        Write-Host "  浠ュ紑鍙戞ā寮忔瀯寤哄墠绔?.." -ForegroundColor Blue
        npm run build:dev
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  鉂?鍓嶇鏋勫缓澶辫触!" -ForegroundColor Red
        Set-Location $currentDir
        exit 1
    }
    
    Write-Host "  鉁?鍓嶇鏋勫缓鎴愬姛!" -ForegroundColor Green
    Set-Location $currentDir
}

# 鏋勫缓鍚庣
function Start-BackendBuild {
    Write-Host "鈿欙笍 鏋勫缓鍚庣..." -ForegroundColor Green
    
    Set-Location "backend"
    
    if ($production) {
        Write-Host "  浠ョ敓浜фā寮忔瀯寤哄悗绔?.." -ForegroundColor Green
        npm run build
    } else {
        Write-Host "  浠ュ紑鍙戞ā寮忔瀯寤哄悗绔?.." -ForegroundColor Green
        npm run build:dev
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  鉂?鍚庣鏋勫缓澶辫触!" -ForegroundColor Red
        Set-Location $currentDir
        exit 1
    }
    
    Write-Host "  鉁?鍚庣鏋勫缓鎴愬姛!" -ForegroundColor Green
    Set-Location $currentDir
}

# 妫€鏌I鏈嶅姟
function Test-AIService {
    Write-Host "馃 妫€鏌I鏈嶅姟..." -ForegroundColor Magenta
    
    if (-not (Test-Path -Path "ai/main.py")) {
        Write-Host "  鈿狅笍 AI鏈嶅姟涓绘枃浠?main.py)涓嶅瓨鍦?" -ForegroundColor Yellow
        return
    }
    
    if (-not (Test-Path -Path "ai/requirements.txt")) {
        Write-Host "  鈿狅笍 AI鏈嶅姟渚濊禆鏂囦欢(requirements.txt)涓嶅瓨鍦?" -ForegroundColor Yellow
        return
    }
    
    # 妫€鏌ython鐜
    try {
        $pythonVersion = python --version
        Write-Host "  鉁?妫€娴嬪埌Python: $pythonVersion" -ForegroundColor Green
        
        Write-Host "  鈩癸笍 AI鏈嶅姟鍑嗗灏辩华锛屽彲浠ヤ娇鐢ㄤ互涓嬪懡浠よ繍琛?" -ForegroundColor Cyan
        Write-Host "      cd ai && python main.py" -ForegroundColor Gray
    } catch {
        Write-Host "  鈿狅笍 鏈娴嬪埌Python鐜锛孉I鏈嶅姟鍙兘鏃犳硶杩愯!" -ForegroundColor Yellow
    }
}

# 鎵ц娓呯悊
if ($clean -or $all) {
    Clear-ProjectBuild
}

# 瀹夎渚濊禆
if ($install -or $all) {
    Install-Dependencies
}

# 鏋勫缓鍓嶇
if ($frontend -or $all) {
    Start-FrontendBuild
}

# 鏋勫缓鍚庣
if ($backend -or $all) {
    Start-BackendBuild
}

# 妫€鏌I鏈嶅姟
if ($ai -or $all) {
    Test-AIService
}

# 鏋勫缓瀹屾垚鍚庣殑鎬荤粨
if ($all) {
    Write-Host ""
    Write-Host "=== 鏋勫缓鎽樿 ===" -ForegroundColor Cyan
    
    # 妫€鏌ュ墠绔瀯寤?
    if (Test-Path -Path "frontend/build/index.html") {
        Write-Host "鉁?鍓嶇鏋勫缓: 鎴愬姛" -ForegroundColor Green
        
        # 鑾峰彇鏋勫缓澶у皬
        $frontendSize = (Get-ChildItem -Path "frontend/build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   鏋勫缓澶у皬: $([math]::Round($frontendSize, 2)) MB" -ForegroundColor Gray
    } else {
        Write-Host "鉂?鍓嶇鏋勫缓: 澶辫触鎴栨湭瀹屾垚" -ForegroundColor Red
    }
    
    # 妫€鏌ュ悗绔瀯寤?
    if (Test-Path -Path "backend/dist/server.js") {
        Write-Host "鉁?鍚庣鏋勫缓: 鎴愬姛" -ForegroundColor Green
        
        # 鑾峰彇鏋勫缓澶у皬
        $backendSize = (Get-ChildItem -Path "backend/dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   鏋勫缓澶у皬: $([math]::Round($backendSize, 2)) MB" -ForegroundColor Gray
    } else {
        Write-Host "鉂?鍚庣鏋勫缓: 澶辫触鎴栨湭瀹屾垚" -ForegroundColor Red
    }
    
    # 妫€鏌I鏈嶅姟
    if (Test-Path -Path "ai/main.py") {
        Write-Host "鉁?AI鏈嶅姟: 灏辩华" -ForegroundColor Green
    } else {
        Write-Host "鉂?AI鏈嶅姟: 鏈氨缁? -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=== 涓嬩竴姝ユ搷浣?===" -ForegroundColor Cyan
    Write-Host "鈥?鍚姩骞冲彴: powershell -ExecutionPolicy Bypass -File 'scripts/start-platform.ps1'" -ForegroundColor Yellow
    Write-Host "鈥?娴嬭瘯AI鏈嶅姟: node test-ai-complete.js" -ForegroundColor Yellow
    Write-Host "鈥?杩愯鍋ュ悍妫€鏌? powershell -ExecutionPolicy Bypass -File 'scripts/health-check.ps1'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "鏋勫缓杩囩▼瀹屾垚!" -ForegroundColor Green


