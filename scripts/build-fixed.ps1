# AICAM骞冲彴鏋勫缓鑴氭湰 (淇鐗?
# 瑙ｅ喅缂栫爜闂銆佸寮洪敊璇鐞嗗拰鏋勫缓杩涘害鎶ュ憡

# 璁剧疆PowerShell缂栫爜涓篣TF-8
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
Write-Step "AICAM骞冲彴鏋勫缓宸ュ叿 v2.0" "Magenta"
Write-Host "鏋勫缓鍓嶇銆佸悗绔笌AI鏈嶅姟..." -ForegroundColor Cyan
Write-Host ""

# 閿欒澶勭悊璁剧疆
$ErrorActionPreference = "Stop"

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location
$rootDir = Split-Path -Parent $PSScriptRoot

# 璁℃椂鍣?
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

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

# 妫€鏌ョ幆澧?
function Test-Environment {
    Write-SubStep "妫€鏌ユ瀯寤虹幆澧?.."
    
    # 妫€鏌ode.js
    try {
        $nodeVersion = node -v
        Write-Success "Node.js鐗堟湰: $nodeVersion"
    }
    catch {
        Write-Error "鏈娴嬪埌Node.js锛岃鍏堝畨瑁匩ode.js"
        exit 1
    }
    
    # 妫€鏌pm
    try {
        $npmVersion = npm -v
        Write-Success "npm鐗堟湰: $npmVersion"
    }
    catch {
        Write-Error "鏈娴嬪埌npm锛岃鍏堝畨瑁卬pm"
        exit 1
    }
    
    # 妫€鏌ython (AI鏈嶅姟闇€瑕?
    if ($all -or $ai) {
        try {
            $pythonVersion = python --version
            Write-Success "Python鐗堟湰: $pythonVersion"
        }
        catch {
            try {
                $pythonVersion = python3 --version
                Write-Success "Python3鐗堟湰: $pythonVersion"
            }
            catch {
                Write-Warning "鏈娴嬪埌Python锛孉I鏈嶅姟鏋勫缓鍙兘浼氬け璐?
            }
        }
    }
    
    Write-Success "鐜妫€鏌ュ畬鎴?
}

# 娓呯悊鏋勫缓鏂囦欢
function Clear-ProjectBuild {
    Write-Step "娓呯悊椤圭洰鏋勫缓鏂囦欢" "Yellow"
    
    # 娓呯悊鍓嶇鏋勫缓
    if (Test-Path -Path "$rootDir/frontend/build") {
        Remove-Item -Path "$rootDir/frontend/build" -Recurse -Force -ErrorAction SilentlyContinue
        if ($?) {
            Write-Success "娓呯悊鍓嶇鏋勫缓鏂囦欢"
        } else {
            Write-Warning "娓呯悊鍓嶇鏋勫缓鏂囦欢澶辫触"
        }
    } else {
        Write-Host "鍓嶇鏋勫缓鏂囦欢涓嶅瓨鍦紝鏃犻渶娓呯悊" -ForegroundColor Gray
    }
    
    # 娓呯悊鍚庣鏋勫缓
    if (Test-Path -Path "$rootDir/backend/dist") {
        Remove-Item -Path "$rootDir/backend/dist" -Recurse -Force -ErrorAction SilentlyContinue
        if ($?) {
            Write-Success "娓呯悊鍚庣鏋勫缓鏂囦欢"
        } else {
            Write-Warning "娓呯悊鍚庣鏋勫缓鏂囦欢澶辫触"
        }
    } else {
        Write-Host "鍚庣鏋勫缓鏂囦欢涓嶅瓨鍦紝鏃犻渶娓呯悊" -ForegroundColor Gray
    }
    
    # 娓呯悊缂撳瓨
    if (Test-Path -Path "$rootDir/frontend/node_modules/.cache") {
        Remove-Item -Path "$rootDir/frontend/node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Success "娓呯悊鍓嶇缂撳瓨"
    }
    
    Write-Success "娓呯悊瀹屾垚"
}

# 瀹夎渚濊禆
function Install-Dependencies {
    Write-Step "瀹夎椤圭洰渚濊禆" "Yellow"
    
    # 瀹夎鏍圭洰褰曚緷璧?
    Write-SubStep "瀹夎鏍圭洰褰曚緷璧?.."
    Set-Location $rootDir
    npm install --no-fund
    if ($?) {
        Write-Success "鏍圭洰褰曚緷璧栧畨瑁呭畬鎴?
    } else {
        Write-Error "鏍圭洰褰曚緷璧栧畨瑁呭け璐?
        exit 1
    }
    
    # 瀹夎鍓嶇渚濊禆
    if ($all -or $frontend) {
        Write-SubStep "瀹夎鍓嶇渚濊禆..."
        Set-Location "$rootDir/frontend"
        npm install --no-fund
        if ($?) {
            Write-Success "鍓嶇渚濊禆瀹夎瀹屾垚"
        } else {
            Write-Error "鍓嶇渚濊禆瀹夎澶辫触"
            exit 1
        }
    }
    
    # 瀹夎鍚庣渚濊禆
    if ($all -or $backend) {
        Write-SubStep "瀹夎鍚庣渚濊禆..."
        Set-Location "$rootDir/backend"
        npm install --no-fund
        if ($?) {
            Write-Success "鍚庣渚濊禆瀹夎瀹屾垚"
        } else {
            Write-Error "鍚庣渚濊禆瀹夎澶辫触"
            exit 1
        }
    }
    
    # 瀹夎AI鏈嶅姟渚濊禆
    if ($all -or $ai) {
        Write-SubStep "瀹夎AI鏈嶅姟渚濊禆..."
        if (Test-Path -Path "$rootDir/ai/requirements.txt") {
            try {
                Set-Location "$rootDir/ai"
                python -m pip install -r requirements.txt
                if ($?) {
                    Write-Success "AI鏈嶅姟渚濊禆瀹夎瀹屾垚"
                } else {
                    try {
                        python3 -m pip install -r requirements.txt
                        if ($?) {
                            Write-Success "AI鏈嶅姟渚濊禆瀹夎瀹屾垚"
                        } else {
                            Write-Warning "AI鏈嶅姟渚濊禆瀹夎澶辫触"
                        }
                    } catch {
                        Write-Warning "AI鏈嶅姟渚濊禆瀹夎澶辫触"
                    }
                }
            } catch {
                Write-Warning "AI鏈嶅姟渚濊禆瀹夎澶辫触: $_"
            }
        } else {
            Write-Warning "AI鏈嶅姟requirements.txt涓嶅瓨鍦?
        }
    }
    
    Write-Success "鎵€鏈変緷璧栧畨瑁呭畬鎴?
}

# 鏋勫缓鍓嶇
function Build-Frontend {
    Write-Step "鏋勫缓鍓嶇搴旂敤" "Blue"
    
    Set-Location "$rootDir/frontend"
    
    # 璁剧疆鐢熶骇鐜鏍囧織
    if ($production) {
        $env:NODE_ENV = "production"
        Write-SubStep "姝ｅ湪浠ョ敓浜фā寮忔瀯寤哄墠绔?.."
    } else {
        $env:NODE_ENV = "development"
        Write-SubStep "姝ｅ湪浠ュ紑鍙戞ā寮忔瀯寤哄墠绔?.."
    }
    
    # 鏋勫缓鍓嶇
    try {
        npm run build
        if ($?) {
            Write-Success "鍓嶇鏋勫缓鎴愬姛"
        } else {
            Write-Error "鍓嶇鏋勫缓澶辫触"
            exit 1
        }
    } catch {
        Write-Error "鍓嶇鏋勫缓杩囩▼涓嚭閿? $_"
        exit 1
    }
}

# 鏋勫缓鍚庣
function Build-Backend {
    Write-Step "鏋勫缓鍚庣搴旂敤" "Green"
    
    Set-Location "$rootDir/backend"
    
    # 璁剧疆鐢熶骇鐜鏍囧織
    if ($production) {
        $env:NODE_ENV = "production"
        Write-SubStep "姝ｅ湪浠ョ敓浜фā寮忔瀯寤哄悗绔?.."
    } else {
        $env:NODE_ENV = "development"
        Write-SubStep "姝ｅ湪浠ュ紑鍙戞ā寮忔瀯寤哄悗绔?.."
    }
    
    # 鏋勫缓鍚庣
    try {
        npm run build
        if ($?) {
            Write-Success "鍚庣鏋勫缓鎴愬姛"
        } else {
            Write-Error "鍚庣鏋勫缓澶辫触"
            exit 1
        }
    } catch {
        Write-Error "鍚庣鏋勫缓杩囩▼涓嚭閿? $_"
        exit 1
    }
}

# 鍑嗗AI鏈嶅姟
function Prepare-AIService {
    Write-Step "鍑嗗AI鏈嶅姟" "Magenta"
    
    # 妫€鏌ython鏄惁鍙敤
    try {
        python --version | Out-Null
        $pythonCmd = "python"
    } catch {
        try {
            python3 --version | Out-Null
            $pythonCmd = "python3"
        } catch {
            Write-Warning "鏈娴嬪埌Python锛岃烦杩嘇I鏈嶅姟鍑嗗"
            return
        }
    }
    
    Set-Location "$rootDir/ai"
    
    # 妫€鏌equirements.txt
    if (-not (Test-Path -Path "requirements.txt")) {
        Write-Warning "AI鏈嶅姟requirements.txt涓嶅瓨鍦紝璺宠繃瀹夎渚濊禆"
    } else {
        Write-SubStep "瀹夎AI鏈嶅姟渚濊禆..."
        try {
            & $pythonCmd -m pip install -r requirements.txt --no-cache-dir
            if ($?) {
                Write-Success "AI鏈嶅姟渚濊禆瀹夎鎴愬姛"
            } else {
                Write-Warning "AI鏈嶅姟渚濊禆瀹夎澶辫触"
            }
        } catch {
            Write-Warning "AI鏈嶅姟渚濊禆瀹夎杩囩▼涓嚭閿? $_"
        }
    }
    
    # 妫€鏌ユā鍨嬬洰褰?
    if (-not (Test-Path -Path "models")) {
        Write-SubStep "鍒涘缓AI妯″瀷鐩綍..."
        New-Item -Path "models" -ItemType Directory -Force | Out-Null
        Write-Success "AI妯″瀷鐩綍鍒涘缓鎴愬姛"
    }
    
    Write-Success "AI鏈嶅姟鍑嗗瀹屾垚"
}

# 鎵ц鏋勫缓杩囩▼
try {
    # 妫€鏌ョ幆澧?
    Test-Environment
    
    # 娓呯悊
    if ($clean) {
        Clear-ProjectBuild
    }
    
    # 瀹夎渚濊禆
    if ($install) {
        Install-Dependencies
    }
    
    # 鏋勫缓椤圭洰
    if ($all -or $frontend) {
        Build-Frontend
    }
    
    if ($all -or $backend) {
        Build-Backend
    }
    
    if ($all -or $ai) {
        Prepare-AIService
    }
    
    # 杩斿洖鍘熺洰褰?
    Set-Location $currentDir
    
    # 瀹屾垚璁℃椂
    $stopwatch.Stop()
    $buildTime = $stopwatch.Elapsed
    
    Write-Step "鏋勫缓瀹屾垚锛? "Cyan"
    Write-Host "鎬绘瀯寤烘椂闂? $($buildTime.Minutes)鍒?($buildTime.Seconds)绉? -ForegroundColor Cyan
    
} catch {
    # 鍙戠敓閿欒鏃惰繑鍥炲師鐩綍
    Set-Location $currentDir
    Write-Error "鏋勫缓杩囩▼涓彂鐢熼敊璇? $_"
    exit 1
}

