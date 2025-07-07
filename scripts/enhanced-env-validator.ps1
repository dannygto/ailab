# 澧炲己鐨勭幆澧冮厤缃獙璇佸拰鍚屾鑴氭湰 - 淇鐗堟湰
# 鐢ㄤ簬楠岃瘉.env閰嶇疆骞跺皢鍩虹閰嶇疆鍚屾鍒板墠绔€佸悗绔拰AI鏈嶅姟

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
        $templatePath = "$rootDir/env.example"
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
        "AI_MODEL_VERSION"
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
        "AI_SERVICE_KEY",
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
    
    # 楠岃瘉AI鏈嶅姟閰嶇疆
    $aiConfigValid = $true
    
    if ($EnvVars.ContainsKey("AI_SERVICE_URL") -and $EnvVars.ContainsKey("AI_SERVICE_PORT")) {
        if (-not $EnvVars["AI_SERVICE_URL"].Contains($EnvVars["AI_SERVICE_PORT"])) {
            Write-Warning "AI_SERVICE_URL 鍙兘涓嶅尮閰?AI_SERVICE_PORT 璁剧疆"
            $aiConfigValid = $false
        }
    }
    
    if ($EnvVars.ContainsKey("AI_MODEL_ENDPOINT")) {
        if (-not $EnvVars["AI_MODEL_ENDPOINT"].StartsWith("http")) {
            Write-Warning "AI_MODEL_ENDPOINT 搴旇鏄畬鏁寸殑URL鍦板潃"
            $aiConfigValid = $false
        }
    }
    
    if (-not $EnvVars.ContainsKey("AI_SERVICE_KEY") -or [string]::IsNullOrEmpty($EnvVars["AI_SERVICE_KEY"])) {
        Write-Warning "AI_SERVICE_KEY 鏈缃紝AI鏈嶅姟瀹夊叏鎬у彲鑳藉彈鍒板奖鍝?
    }
    
    if (-not $aiConfigValid) {
        Write-Warning "AI鏈嶅姟閰嶇疆鍙兘瀛樺湪闂锛岃妫€鏌?
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "鐜閰嶇疆楠岃瘉澶辫触锛屽瓨鍦?$($missingVars.Count) 涓己澶辩殑蹇呰鍙橀噺"
        return $false
    } else {
        Write-Success "鐜閰嶇疆楠岃瘉閫氳繃"
        return $true
    }
}

# 楠岃瘉AI鏈嶅姟鐜
function Test-AIServiceConfig {
    param (
        [hashtable]$EnvVars
    )
    
    Write-Step "楠岃瘉AI鏈嶅姟鐜閰嶇疆" "Yellow"
    
    $aiConfigValid = $true
    $aiRequiredVars = @(
        "AI_SERVICE_URL",
        "AI_SERVICE_PORT",
        "AI_MODEL_ENDPOINT",
        "AI_MODEL_VERSION"
    )
    
    $missingAIVars = @()
    foreach ($var in $aiRequiredVars) {
        if (-not $EnvVars.ContainsKey($var) -or [string]::IsNullOrEmpty($EnvVars[$var])) {
            $missingAIVars += $var
            Write-Warning "缂哄皯AI鏈嶅姟蹇呰鐜鍙橀噺: $var"
            $aiConfigValid = $false
        }
    }
    
    # 妫€鏌I妯″瀷閰嶇疆
    if ($EnvVars.ContainsKey("AI_MODEL_TYPE")) {
        $validModelTypes = @("openai", "local", "azure", "custom")
        if (-not $validModelTypes.Contains($EnvVars["AI_MODEL_TYPE"].ToLower())) {
            Write-Warning "AI_MODEL_TYPE 鍊兼棤鏁堬紝搴斾负: $($validModelTypes -join ', ')"
            $aiConfigValid = $false
        }
    } else {
        Write-Warning "鏈寚瀹?AI_MODEL_TYPE锛屽皢浣跨敤榛樿鍊?
    }
    
    # 鏍规嵁妯″瀷绫诲瀷妫€鏌ョ浉鍏抽厤缃?
    if ($EnvVars.ContainsKey("AI_MODEL_TYPE")) {
        switch ($EnvVars["AI_MODEL_TYPE"].ToLower()) {
            "openai" {
                if (-not $EnvVars.ContainsKey("OPENAI_API_KEY") -or [string]::IsNullOrEmpty($EnvVars["OPENAI_API_KEY"])) {
                    Write-Warning "浣跨敤OpenAI妯″瀷浣嗘湭璁剧疆OPENAI_API_KEY"
                    $aiConfigValid = $false
                }
            }
            "azure" {
                if (-not $EnvVars.ContainsKey("AZURE_OPENAI_API_KEY") -or [string]::IsNullOrEmpty($EnvVars["AZURE_OPENAI_API_KEY"])) {
                    Write-Warning "浣跨敤Azure妯″瀷浣嗘湭璁剧疆AZURE_OPENAI_API_KEY"
                    $aiConfigValid = $false
                }
                if (-not $EnvVars.ContainsKey("AZURE_OPENAI_ENDPOINT") -or [string]::IsNullOrEmpty($EnvVars["AZURE_OPENAI_ENDPOINT"])) {
                    Write-Warning "浣跨敤Azure妯″瀷浣嗘湭璁剧疆AZURE_OPENAI_ENDPOINT"
                    $aiConfigValid = $false
                }
            }
            "local" {
                if (-not $EnvVars.ContainsKey("LOCAL_MODEL_PATH") -or [string]::IsNullOrEmpty($EnvVars["LOCAL_MODEL_PATH"])) {
                    Write-Warning "浣跨敤鏈湴妯″瀷浣嗘湭璁剧疆LOCAL_MODEL_PATH"
                    $aiConfigValid = $false
                }
            }
        }
    }
    
    # 妫€鏌ython鐜閰嶇疆
    if (-not $EnvVars.ContainsKey("PYTHON_PATH") -or [string]::IsNullOrEmpty($EnvVars["PYTHON_PATH"])) {
        Write-Warning "鏈缃甈YTHON_PATH锛孉I鏈嶅姟鍙兘鏃犳硶姝ｅ父杩愯"
    } else {
        if (-not (Test-Path -Path $EnvVars["PYTHON_PATH"])) {
            Write-Warning "PYTHON_PATH鎸囧畾鐨勮矾寰勪笉瀛樺湪: $($EnvVars["PYTHON_PATH"])"
            $aiConfigValid = $false
        }
    }
    
    if ($aiConfigValid) {
        Write-Success "AI鏈嶅姟鐜閰嶇疆楠岃瘉閫氳繃"
    } else {
        Write-Error "AI鏈嶅姟鐜閰嶇疆楠岃瘉澶辫触锛岃妫€鏌ョ浉鍏抽厤缃?
    }
    
    return $aiConfigValid
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
    $backendVars = @()
    
    # 鎺掗櫎鍓嶇鐗瑰畾鐨勭幆澧冨彉閲?
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
    $backendAiEnvPath = "$rootDir/backend/ai-service/.env"
    
    # 绛涢€堿I鏈嶅姟鐩稿叧鐨勭幆澧冨彉閲?
    $aiVars = @()
    $aiPrefixes = @("AI_", "OPENAI_", "AZURE_", "MODEL_", "PYTHON_")
    
    foreach ($key in $EnvVars.Keys) {
        $isAiVar = $false
        foreach ($prefix in $aiPrefixes) {
            if ($key.StartsWith($prefix)) {
                $isAiVar = $true
                break
            }
        }
        
        if ($isAiVar) {
            $aiVars += "$key=$($EnvVars[$key])"
        }
    }
    
    # 鍐欏叆AI鏈嶅姟鐜鏂囦欢
    if ($aiVars.Count -gt 0) {
        try {
            # 鍐欏叆涓籄I鐩綍
            if (Test-Path -Path "$rootDir/ai") {
                Set-Content -Path $aiEnvPath -Value $aiVars -Encoding UTF8
                Write-Success "AI鏈嶅姟鐜閰嶇疆宸插悓姝? $aiEnvPath"
            }
            
            # 鍐欏叆鍚庣AI鏈嶅姟鐩綍
            if (Test-Path -Path "$rootDir/backend/ai-service") {
                Set-Content -Path $backendAiEnvPath -Value $aiVars -Encoding UTF8
                Write-Success "鍚庣AI鏈嶅姟鐜閰嶇疆宸插悓姝? $backendAiEnvPath"
            }
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
        
        # 楠岃瘉AI鏈嶅姟閰嶇疆
        $aiValid = Test-AIServiceConfig -EnvVars $envVars
        
        if ((-not $valid -or -not $aiValid) -and -not $force) {
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

