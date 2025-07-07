# 鐜閰嶇疆楠岃瘉鍜屽悓姝ヨ剼鏈?
# 鐢ㄤ簬楠岃瘉.env閰嶇疆骞跺皢鍩虹閰嶇疆鍚屾鍒板墠绔拰鍚庣

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
Write-Step "AICAM骞冲彴鐜閰嶇疆楠岃瘉鍜屽悓姝ュ伐鍏? "Magenta"

# 閿欒澶勭悊璁剧疆
$ErrorActionPreference = "Stop"

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location
$rootDir = Split-Path -Parent $PSScriptRoot

# 鍙傛暟瀹氫箟
param (
    [string]$envFile = "$rootDir/.env",
    [switch]$validate,
    [switch]$sync,
    [switch]$force
)

# 濡傛灉娌℃湁鎸囧畾浠讳綍鍙傛暟锛岄粯璁や负楠岃瘉鍜屽悓姝?
if (-not ($validate -or $sync)) {
    $validate = $true
    $sync = $true
}

# 妫€鏌ョ幆澧冩枃浠舵槸鍚﹀瓨鍦?
function Test-EnvFile {
    param (
        [string]$FilePath
    )
    
    if (-not (Test-Path -Path $FilePath)) {
        Write-Warning "鐜閰嶇疆鏂囦欢涓嶅瓨鍦? $FilePath"
        
        # 妫€鏌ユ槸鍚︽湁妯℃澘鏂囦欢
        $templatePath = "$rootDir/.env.template"
        if (Test-Path -Path $templatePath) {
            Write-SubStep "鍙戠幇妯℃澘鏂囦欢锛屾槸鍚﹀鍒朵负鐜閰嶇疆鏂囦欢锛?(Y/N)"
            $response = Read-Host
            if ($response -eq "Y" -or $response -eq "y") {
                Copy-Item -Path $templatePath -Destination $FilePath
                Write-Success "宸插鍒舵ā鏉挎枃浠朵负鐜閰嶇疆鏂囦欢: $FilePath"
                return $true
            }
        }
        
        return $false
    }
    
    return $true
}

# 璇诲彇鐜閰嶇疆鏂囦欢
function Get-EnvVariables {
    param (
        [string]$FilePath
    )
    
    $envVars = @{}
    
    if (Test-Path -Path $FilePath) {
        $content = Get-Content -Path $FilePath -Encoding UTF8
        
        foreach ($line in $content) {
            # 璺宠繃娉ㄩ噴鍜岀┖琛?
            if ($line.Trim() -eq "" -or $line.Trim().StartsWith("#")) {
                continue
            }
            
            # 瑙ｆ瀽鐜鍙橀噺
            if ($line -match "^\s*([^=]+)=(.*)$") {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                
                # 鍘婚櫎寮曞彿
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                
                $envVars[$key] = $value
            }
        }
    }
    
    return $envVars
}

# 楠岃瘉鐜閰嶇疆
function Test-EnvConfig {
    param (
        [hashtable]$EnvVars,
        [string]$FilePath
    )
    
    Write-Step "楠岃瘉鐜閰嶇疆" "Yellow"
    
    $missingVars = @()
    $requiredVars = @(
        # 閫氱敤閰嶇疆
        "NODE_ENV",
        "PORT",
        # 鍓嶇閰嶇疆
        "REACT_APP_API_URL",
        "REACT_APP_WS_URL",
        # 鍚庣閰嶇疆
        "API_PORT",
        "CORS_ORIGIN",
        "SESSION_SECRET",
        "JWT_SECRET",
        # 鏁版嵁搴撻厤缃?
        "MONGODB_URI",
        "MONGODB_DB_NAME",
        # Redis閰嶇疆
        "REDIS_HOST",
        "REDIS_PORT",
        # AI鏈嶅姟閰嶇疆
        "AI_SERVICE_URL",
        "AI_SERVICE_PORT",
        "AI_MODEL_ENDPOINT",
        "AI_MODEL_VERSION",
        "AI_SERVICE_KEY"
    )
    
    foreach ($var in $requiredVars) {
        if (-not $EnvVars.ContainsKey($var) -or [string]::IsNullOrEmpty($EnvVars[$var])) {
            $missingVars += $var
            Write-Warning "缂哄皯蹇呰鐨勭幆澧冨彉閲? $var"
        }
    }
    
    # 妫€鏌ユ晱鎰熼厤缃?
    $sensitiveVars = @(
        "SESSION_SECRET",
        "JWT_SECRET",
        "MONGODB_PASSWORD",
        "REDIS_PASSWORD",
        "OPENAI_API_KEY",
        "MAIL_PASSWORD"
    )
    
    foreach ($var in $sensitiveVars) {
        if ($EnvVars.ContainsKey($var) -and (-not [string]::IsNullOrEmpty($EnvVars[$var]))) {
            if ($EnvVars[$var] -match "^(secret|password|default|example|test|key|change|replace)$") {
                Write-Warning "鏁忔劅閰嶇疆 $var 鍙兘浣跨敤浜嗛粯璁ゅ€硷紝寤鸿鏇存敼"
            }
        }
    }
    
    # 楠岃瘉绔彛閰嶇疆
    if ($EnvVars.ContainsKey("PORT") -and $EnvVars.ContainsKey("API_PORT")) {
        if ($EnvVars["PORT"] -ne $EnvVars["API_PORT"]) {
            Write-Warning "PORT 鍜?API_PORT 涓嶄竴鑷达紝鍙兘瀵艰嚧閰嶇疆闂"
        }
    }
    
    # 楠岃瘉URL閰嶇疆
    if ($EnvVars.ContainsKey("REACT_APP_API_URL") -and $EnvVars.ContainsKey("API_PORT")) {
        if (-not $EnvVars["REACT_APP_API_URL"].Contains($EnvVars["API_PORT"])) {
            Write-Warning "REACT_APP_API_URL 鍙兘涓嶅尮閰?API_PORT 璁剧疆"
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "鐜閰嶇疆楠岃瘉澶辫触锛屽瓨鍦?$($missingVars.Count) 涓己澶辩殑蹇呰鍙橀噺"
        return $false
    } else {
        Write-Success "鐜閰嶇疆楠岃瘉閫氳繃"
        return $true
    }
}

# 鍚屾鐜閰嶇疆鍒板墠绔拰鍚庣
function Sync-EnvConfig {
    param (
        [hashtable]$EnvVars,
        [string]$FilePath
    )
    
    Write-Step "鍚屾鐜閰嶇疆" "Yellow"
    
    # 鍚屾鍒板墠绔?
    $frontendEnvPath = "$rootDir/frontend/.env"
    $frontendVars = @()
    
    # 绛涢€夊墠绔浉鍏崇殑鐜鍙橀噺
    foreach ($key in $EnvVars.Keys) {
        if ($key.StartsWith("REACT_APP_")) {
            $frontendVars += "$key=$($EnvVars[$key])"
        }
    }
    
    # 娣诲姞NODE_ENV鍙橀噺
    if ($EnvVars.ContainsKey("NODE_ENV")) {
        $frontendVars += "NODE_ENV=$($EnvVars['NODE_ENV'])"
    }
    
    # 鍐欏叆鍓嶇鐜鏂囦欢
    if ($frontendVars.Count -gt 0) {
        try {
            Set-Content -Path $frontendEnvPath -Value $frontendVars -Encoding UTF8
            Write-Success "鍓嶇鐜閰嶇疆宸插悓姝? $frontendEnvPath"
        } catch {
            Write-Error "鍚屾鍓嶇鐜閰嶇疆澶辫触: $_"
        }
    } else {
        Write-Warning "娌℃湁鎵惧埌鍓嶇鐩稿叧鐨勭幆澧冨彉閲?
    }
    
    # 鍚屾鍒板悗绔?
    $backendEnvPath = "$rootDir/backend/.env"
    
    # 绛涢€夊嚭鎺掗櫎鍓嶇鐗瑰畾鍙橀噺鍚庣殑鎵€鏈夊彉閲?
    $backendVars = @()
    foreach ($key in $EnvVars.Keys) {
        if (-not $key.StartsWith("REACT_APP_")) {
            $backendVars += "$key=$($EnvVars[$key])"
        }
    }
    
    # 鍐欏叆鍚庣鐜鏂囦欢
    if ($backendVars.Count -gt 0) {
        try {
            Set-Content -Path $backendEnvPath -Value $backendVars -Encoding UTF8
            Write-Success "鍚庣鐜閰嶇疆宸插悓姝? $backendEnvPath"
        } catch {
            Write-Error "鍚屾鍚庣鐜閰嶇疆澶辫触: $_"
        }
    } else {
        Write-Warning "娌℃湁鎵惧埌鍚庣鐩稿叧鐨勭幆澧冨彉閲?
    }
    
    # 鍚屾鍒癆I鏈嶅姟
    $aiEnvPath = "$rootDir/ai/.env"
    
    # 绛涢€堿I鏈嶅姟鐩稿叧鐨勭幆澧冨彉閲?
    $aiVars = @()
    $aiPrefixes = @("AI_", "OPENAI_", "MODEL_", "PYTHON_")
    
    foreach ($key in $EnvVars.Keys) {
        foreach ($prefix in $aiPrefixes) {
            if ($key.StartsWith($prefix)) {
                $aiVars += "$key=$($EnvVars[$key])"
                break
            }
        }
    }
    
    # 鍐欏叆AI鏈嶅姟鐜鏂囦欢
    if ($aiVars.Count -gt 0) {
        try {
            Set-Content -Path $aiEnvPath -Value $aiVars -Encoding UTF8
            Write-Success "AI鏈嶅姟鐜閰嶇疆宸插悓姝? $aiEnvPath"
        } catch {
            Write-Error "鍚屾AI鏈嶅姟鐜閰嶇疆澶辫触: $_"
        }
    } else {
        Write-Warning "娌℃湁鎵惧埌AI鏈嶅姟鐩稿叧鐨勭幆澧冨彉閲?
    }
}

# 涓荤▼搴?
try {
    # 妫€鏌ョ幆澧冩枃浠?
    $envExists = Test-EnvFile -FilePath $envFile
    if (-not $envExists) {
        Write-Error "鐜閰嶇疆鏂囦欢涓嶅瓨鍦ㄤ笖鏃犳硶鍒涘缓"
        exit 1
    }
    
    # 璇诲彇鐜鍙橀噺
    $envVars = Get-EnvVariables -FilePath $envFile
    
    # 楠岃瘉鐜閰嶇疆
    if ($validate) {
        $valid = Test-EnvConfig -EnvVars $envVars -FilePath $envFile
        if (-not $valid -and -not $force) {
            Write-Warning "鐜閰嶇疆楠岃瘉鏈€氳繃锛屽悓姝ュ彲鑳藉鑷撮棶棰?
            Write-SubStep "鏄惁缁х画鍚屾? (Y/N)"
            $response = Read-Host
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Host "鎿嶄綔宸插彇娑? -ForegroundColor Gray
                exit 0
            }
        }
    }
    
    # 鍚屾鐜閰嶇疆
    if ($sync) {
        Sync-EnvConfig -EnvVars $envVars -FilePath $envFile
    }
    
    # 杩斿洖鍘熺洰褰?
    Set-Location $currentDir
    
    Write-Step "鐜閰嶇疆澶勭悊瀹屾垚锛? "Cyan"
    
} catch {
    # 鍙戠敓閿欒鏃惰繑鍥炲師鐩綍
    Set-Location $currentDir
    Write-Error "澶勭悊鐜閰嶇疆鏃跺彂鐢熼敊璇? $_"
    exit 1
}

