// 鍓嶇鍚姩鑴氭湰
// 鐢ㄤ簬妫€娴嬪苟鍚姩鍓嶇寮€鍙戞湇鍔″櫒

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
Write-Step "AICAM骞冲彴鍓嶇鍚姩宸ュ叿" "Blue"
Write-Host "鍚姩鍓嶇寮€鍙戞湇鍔″櫒..." -ForegroundColor Cyan

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location
$frontendDir = Split-Path -Parent $PSScriptRoot

# 鍙傛暟瀹氫箟
param (
    [switch]$production,
    [switch]$analyze,
    [switch]$https,
    [int]$port = 3000
)

# 妫€鏌ュ墠绔洰褰曟槸鍚﹀瓨鍦?
if (-not (Test-Path -Path $frontendDir)) {
    Write-Error "鍓嶇鐩綍涓嶅瓨鍦? $frontendDir"
    exit 1
}

# 妫€鏌ode妯″潡鏄惁宸插畨瑁?
if (-not (Test-Path -Path "$frontendDir/node_modules")) {
    Write-SubStep "鍓嶇渚濊禆鏈畨瑁咃紝姝ｅ湪瀹夎..."
    Set-Location $frontendDir
    npm install --no-fund
    if (-not $?) {
        Write-Error "瀹夎鍓嶇渚濊禆澶辫触"
        Set-Location $currentDir
        exit 1
    }
    Write-Success "鍓嶇渚濊禆瀹夎瀹屾垚"
} else {
    Write-Success "鍓嶇渚濊禆宸插畨瑁?
}

# 璁剧疆鐜鍙橀噺
$env:PORT = $port
if ($https) {
    $env:HTTPS = "true"
}

# 濡傛灉鏄敓浜фā寮忥紝璁剧疆NODE_ENV
if ($production) {
    $env:NODE_ENV = "production"
    Write-SubStep "浠ョ敓浜фā寮忓惎鍔ㄥ墠绔湇鍔″櫒..."
} else {
    $env:NODE_ENV = "development"
    Write-SubStep "浠ュ紑鍙戞ā寮忓惎鍔ㄥ墠绔湇鍔″櫒..."
}

# 鍚姩鍓嶇鏈嶅姟鍣?
Set-Location $frontendDir
if ($analyze) {
    Write-SubStep "鍚姩鍓嶇鏈嶅姟鍣?甯﹀垎鏋愭ā寮?..."
    npm run analyze
} else {
    Write-SubStep "鍚姩鍓嶇鏈嶅姟鍣?.."
    npm start
}

# 杩斿洖鍘熺洰褰?
Set-Location $currentDir

