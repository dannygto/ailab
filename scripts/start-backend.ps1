// 鍚庣鍚姩鑴氭湰
// 鐢ㄤ簬妫€娴嬪苟鍚姩鍚庣寮€鍙戞湇鍔″櫒

// 璁剧疆PowerShell缂栫爜涓篣TF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

# 缇庡寲杈撳嚭鐨勮緟鍔╁嚱鏁?
function Write-Step {
    param (
        [string]$Message,
        [string]$Color = "Cyan"
    )
    Write-Host ""
    Write-Host "==== $Message ====" -ForegroundColor $Color
}

function Write-SubStep {
    param (
        [string]$Message,
        [string]$Color = "Yellow"
    )
    Write-Host ">> $Message" -ForegroundColor $Color
}

function Write-Success {
    param (
        [string]$Message
    )
    Write-Host "鉁?$Message" -ForegroundColor Green
}

function Write-Warning {
    param (
        [string]$Message
    )
    Write-Host "鈿?$Message" -ForegroundColor Yellow
}

function Write-Error {
    param (
        [string]$Message
    )
    Write-Host "鉁?$Message" -ForegroundColor Red
}

# 鏄剧ず鏍囬
Write-Step "AICAM骞冲彴鍚庣鍚姩宸ュ叿" "Green"
Write-Host "鍚姩鍚庣寮€鍙戞湇鍔″櫒..." -ForegroundColor Cyan

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location
$backendDir = Split-Path -Parent $PSScriptRoot

# 鍙傛暟瀹氫箟
param (
    [switch]$production,
    [switch]$debug,
    [int]$port = 3002
)

# 妫€鏌ュ悗绔洰褰曟槸鍚﹀瓨鍦?
if (-not (Test-Path -Path $backendDir)) {
    Write-Error "鍚庣鐩綍涓嶅瓨鍦? $backendDir"
    exit 1
}

# 妫€鏌ode妯″潡鏄惁宸插畨瑁?
if (-not (Test-Path -Path "$backendDir/node_modules")) {
    Write-SubStep "鍚庣渚濊禆鏈畨瑁咃紝姝ｅ湪瀹夎..."
    Set-Location $backendDir
    npm install --no-fund
    if (-not $?) {
        Write-Error "瀹夎鍚庣渚濊禆澶辫触"
        Set-Location $currentDir
        exit 1
    }
    Write-Success "鍚庣渚濊禆瀹夎瀹屾垚"
} else {
    Write-Success "鍚庣渚濊禆宸插畨瑁?
}

# 妫€鏌ョ幆澧冮厤缃?
if (-not (Test-Path -Path "$backendDir/.env")) {
    Write-SubStep "鍚庣鐜閰嶇疆涓嶅瓨鍦紝姝ｅ湪浠庢ā鏉垮垱寤?.."
    if (Test-Path -Path "$backendDir/../.env.template") {
        Copy-Item -Path "$backendDir/../.env.template" -Destination "$backendDir/.env"
        Write-Success "浠庢ā鏉垮垱寤虹幆澧冮厤缃?
    } else {
        # 鍒涘缓鍩烘湰鐜閰嶇疆
        $envContent = @"
# AICAM骞冲彴鍚庣鐜閰嶇疆
# 鑷姩鐢熸垚鐨勫熀鏈厤缃?

NODE_ENV=development
PORT=$port
API_PORT=$port
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=dev_session_secret
JWT_SECRET=dev_jwt_secret
JWT_EXPIRES_IN=1d

# 鏁版嵁搴撻厤缃?
MONGODB_URI=mongodb://localhost:27017/aicam
MONGODB_DB_NAME=aicam
MONGODB_RETRY_ATTEMPTS=5
MONGODB_RETRY_DELAY=2000

# Redis閰嶇疆
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
"@
        Set-Content -Path "$backendDir/.env" -Value $envContent
        Write-Success "鍒涘缓鍩烘湰鐜閰嶇疆"
    }
} else {
    Write-Success "鍚庣鐜閰嶇疆宸插瓨鍦?
}

# 璁剧疆鐜鍙橀噺
$env:PORT = $port

# 濡傛灉鏄敓浜фā寮忥紝璁剧疆NODE_ENV
if ($production) {
    $env:NODE_ENV = "production"
    Write-SubStep "浠ョ敓浜фā寮忓惎鍔ㄥ悗绔湇鍔″櫒..."
} else {
    $env:NODE_ENV = "development"
    Write-SubStep "浠ュ紑鍙戞ā寮忓惎鍔ㄥ悗绔湇鍔″櫒..."
}

# 鍚姩鍚庣鏈嶅姟鍣?
Set-Location $backendDir
if ($debug) {
    Write-SubStep "鍚姩鍚庣鏈嶅姟鍣?甯﹁皟璇?..."
    npm run debug
} else {
    Write-SubStep "鍚姩鍚庣鏈嶅姟鍣?.."
    npm run dev
}

# 杩斿洖鍘熺洰褰?
Set-Location $currentDir

