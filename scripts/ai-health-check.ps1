# AI鏈嶅姟鍋ュ悍妫€鏌ヨ剼鏈?
# 鐢ㄤ簬妫€鏌I鏈嶅姟鐨勫彲鐢ㄦ€у拰杩愯鐘舵€?

# 璁剧疆PowerShell缂栫爜涓篣TF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

# 閿欒澶勭悊璁剧疆
$ErrorActionPreference = "Stop"

# 淇濆瓨褰撳墠鐩綍
$currentDir = Get-Location
$rootDir = Split-Path -Parent $PSScriptRoot

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
Write-Step "AICAM骞冲彴 AI鏈嶅姟鍋ュ悍妫€鏌? "Magenta"
Write-Host "鏃ユ湡: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 鍙傛暟瀹氫箟
param (
    [switch]$detailed,
    [switch]$fix,
    [string]$aiServiceUrl
)

# 鑾峰彇AI鏈嶅姟URL
if ([string]::IsNullOrEmpty($aiServiceUrl)) {
    # 灏濊瘯浠庣幆澧冩枃浠惰鍙?
    $envFile = "$rootDir/.env"
    if (Test-Path -Path $envFile) {
        $envContent = Get-Content -Path $envFile -Encoding UTF8
        
        foreach ($line in $envContent) {
            # 鎵惧埌AI_SERVICE_URL
            if ($line -match "^\s*AI_SERVICE_URL=(.*)$") {
                $aiServiceUrl = $matches[1].Trim()
                
                # 鍘婚櫎寮曞彿
                if ($aiServiceUrl.StartsWith('"') -and $aiServiceUrl.EndsWith('"')) {
                    $aiServiceUrl = $aiServiceUrl.Substring(1, $aiServiceUrl.Length - 2)
                }
                elseif ($aiServiceUrl.StartsWith("'") -and $aiServiceUrl.EndsWith("'")) {
                    $aiServiceUrl = $aiServiceUrl.Substring(1, $aiServiceUrl.Length - 2)
                }
                
                break
            }
        }
    }
    
    # 濡傛灉杩樻病鏈夋壘鍒帮紝浣跨敤榛樿鍊?
    if ([string]::IsNullOrEmpty($aiServiceUrl)) {
        $aiServiceUrl = "http://localhost:3002/api/ai"
    }
}

# 鍘婚櫎URL鏈熬鐨勬枩鏉?
if ($aiServiceUrl.EndsWith("/")) {
    $aiServiceUrl = $aiServiceUrl.Substring(0, $aiServiceUrl.Length - 1)
}

Write-SubStep "浣跨敤AI鏈嶅姟URL: $aiServiceUrl"

# 妫€鏌I鏈嶅姟鍋ュ悍鐘舵€?
function Test-AIServiceHealth {
    try {
        Write-SubStep "姝ｅ湪妫€鏌I鏈嶅姟鍋ュ悍鐘舵€?.."
        
        # 鍙戦€佽姹?
        $healthEndpoint = "$aiServiceUrl/health"
        $response = Invoke-RestMethod -Uri $healthEndpoint -Method Get -ContentType "application/json" -TimeoutSec 10
        
        if ($response.success -and $response.data.status -eq "ok") {
            Write-Success "AI鏈嶅姟杩愯姝ｅ父"
            
            # 鏄剧ず璇︾粏淇℃伅
            if ($detailed) {
                Write-Host "鏈嶅姟鐘舵€佽鎯?" -ForegroundColor Cyan
                $services = $response.data.services
                
                foreach ($service in $services.PSObject.Properties) {
                    $status = if ($service.Value) { "鉁?姝ｅ父" } else { "鉁?寮傚父" }
                    $color = if ($service.Value) { "Green" } else { "Red" }
                    Write-Host "  - $($service.Name): " -NoNewline
                    Write-Host $status -ForegroundColor $color
                }
                
                if ($response.data.PSObject.Properties.Name -contains "availableModels") {
                    Write-Host "鍙敤妯″瀷:" -ForegroundColor Cyan
                    foreach ($model in $response.data.availableModels) {
                        Write-Host "  - $model" -ForegroundColor Gray
                    }
                }
                
                if ($response.data.PSObject.Properties.Name -contains "latency") {
                    Write-Host "鏈嶅姟寤惰繜: $($response.data.latency) ms" -ForegroundColor Cyan
                }
            }
            
            return $true
        } else {
            Write-Error "AI鏈嶅姟鐘舵€佸紓甯? $($response.message)"
            
            if ($detailed -and $response.PSObject.Properties.Name -contains "data" -and $null -ne $response.data) {
                Write-Host "鏈嶅姟鐘舵€佽鎯?" -ForegroundColor Yellow
                $services = $response.data.services
                
                if ($null -ne $services) {
                    foreach ($service in $services.PSObject.Properties) {
                        $status = if ($service.Value) { "鉁?姝ｅ父" } else { "鉁?寮傚父" }
                        $color = if ($service.Value) { "Green" } else { "Red" }
                        Write-Host "  - $($service.Name): " -NoNewline
                        Write-Host $status -ForegroundColor $color
                    }
                }
            }
            
            return $false
        }
    } catch {
        Write-Error "妫€鏌I鏈嶅姟鍋ュ悍鐘舵€佸け璐? $_"
        return $false
    }
}

# 妫€鏌I妯″瀷閰嶇疆
function Test-AIModelConfig {
    try {
        Write-SubStep "姝ｅ湪妫€鏌I妯″瀷閰嶇疆..."
        
        # 鍙戦€佽姹?
        $configEndpoint = "$aiServiceUrl/config"
        $response = Invoke-RestMethod -Uri $configEndpoint -Method Get -ContentType "application/json" -TimeoutSec 10
        
        if ($response.success -and $null -ne $response.data) {
            Write-Success "AI妯″瀷閰嶇疆姝ｅ父"
            
            # 鏄剧ず璇︾粏淇℃伅
            if ($detailed) {
                Write-Host "妯″瀷閰嶇疆璇︽儏:" -ForegroundColor Cyan
                
                if ($response.data.PSObject.Properties.Name -contains "models") {
                    foreach ($model in $response.data.models.PSObject.Properties) {
                        Write-Host "  - $($model.Name): $($model.Value)" -ForegroundColor Gray
                    }
                }
                
                if ($response.data.PSObject.Properties.Name -contains "endpoint") {
                    Write-Host "AI妯″瀷绔偣: $($response.data.endpoint)" -ForegroundColor Cyan
                }
                
                if ($response.data.PSObject.Properties.Name -contains "timeout") {
                    Write-Host "璇锋眰瓒呮椂璁剧疆: $($response.data.timeout) ms" -ForegroundColor Cyan
                }
            }
            
            return $true
        } else {
            Write-Error "AI妯″瀷閰嶇疆寮傚父: $($response.message)"
            return $false
        }
    } catch {
        Write-Error "妫€鏌I妯″瀷閰嶇疆澶辫触: $_"
        return $false
    }
}

# 娴嬭瘯鍩烘湰鍔熻兘
function Test-AIBasicFunctionality {
    try {
        Write-SubStep "姝ｅ湪娴嬭瘯AI鍩烘湰鍔熻兘..."
        
        # 鍙戦€佹枃鏈垎绫昏姹?
        $classificationEndpoint = "$aiServiceUrl/text-classification"
        $body = @{
            text = "杩欐槸涓€涓祴璇曟枃鏈紝鐢ㄤ簬妫€鏌I鏈嶅姟鐨勫熀鏈姛鑳芥槸鍚︽甯搞€?
            multiLabel = $false
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $classificationEndpoint -Method Post -Body $body -ContentType "application/json" -TimeoutSec 20
        
        if ($response.success -and $null -ne $response.data) {
            Write-Success "AI鏂囨湰鍒嗙被鍔熻兘姝ｅ父"
            
            # 鏄剧ず璇︾粏淇℃伅
            if ($detailed) {
                Write-Host "鍒嗙被缁撴灉:" -ForegroundColor Cyan
                Write-Host "  涓诲垎绫? $($response.data.dominantCategory)" -ForegroundColor Gray
                Write-Host "  缃俊搴? $($response.data.confidence)" -ForegroundColor Gray
                
                if ($response.data.PSObject.Properties.Name -contains "categories") {
                    Write-Host "  鎵€鏈夊垎绫?" -ForegroundColor Cyan
                    foreach ($category in $response.data.categories) {
                        Write-Host "    - $($category.category): $($category.score)" -ForegroundColor Gray
                    }
                }
            }
            
            return $true
        } else {
            Write-Error "AI鏂囨湰鍒嗙被鍔熻兘寮傚父: $($response.message)"
            return $false
        }
    } catch {
        Write-Error "娴嬭瘯AI鍩烘湰鍔熻兘澶辫触: $_"
        return $false
    }
}

# 灏濊瘯淇AI鏈嶅姟闂
function Repair-AIService {
    Write-Step "姝ｅ湪灏濊瘯淇AI鏈嶅姟闂..." "Yellow"
    
    try {
        # 妫€鏌I鏈嶅姟杩涚▼
        Write-SubStep "妫€鏌I鏈嶅姟杩涚▼..."
        $aiProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*ai-service*" }
        
        if ($null -eq $aiProcesses -or $aiProcesses.Count -eq 0) {
            Write-Warning "鏈娴嬪埌AI鏈嶅姟杩涚▼锛屽皾璇曞惎鍔ㄦ湇鍔?.."
            
            # 灏濊瘯鍚姩AI鏈嶅姟
            $aiServicePath = "$rootDir/backend/ai-service"
            if (Test-Path -Path $aiServicePath) {
                Set-Location $aiServicePath
                Start-Process -FilePath "node" -ArgumentList "dist/server.js" -NoNewWindow
                Write-Success "宸插皾璇曞惎鍔ˋI鏈嶅姟"
                Start-Sleep -Seconds 5
            } else {
                Write-Error "鎵句笉鍒癆I鏈嶅姟璺緞: $aiServicePath"
            }
        } else {
            Write-SubStep "AI鏈嶅姟杩涚▼姝ｅ湪杩愯锛屽皾璇曢噸鍚?.."
            foreach ($process in $aiProcesses) {
                Stop-Process -Id $process.Id -Force
            }
            Start-Sleep -Seconds 2
            
            # 閲嶅惎AI鏈嶅姟
            $aiServicePath = "$rootDir/backend/ai-service"
            if (Test-Path -Path $aiServicePath) {
                Set-Location $aiServicePath
                Start-Process -FilePath "node" -ArgumentList "dist/server.js" -NoNewWindow
                Write-Success "宸插皾璇曢噸鍚疉I鏈嶅姟"
                Start-Sleep -Seconds 5
            } else {
                Write-Error "鎵句笉鍒癆I鏈嶅姟璺緞: $aiServicePath"
            }
        }
        
        # 閲嶆柊妫€鏌ュ仴搴风姸鎬?
        $healthy = Test-AIServiceHealth
        if ($healthy) {
            Write-Success "AI鏈嶅姟宸叉垚鍔熶慨澶嶏紒"
        } else {
            Write-Warning "AI鏈嶅姟淇灏濊瘯鍚庝粛鏈夐棶棰橈紝璇锋墜鍔ㄦ鏌?
        }
    } catch {
        Write-Error "淇AI鏈嶅姟鏃跺嚭閿? $_"
    } finally {
        # 杩斿洖鍘熺洰褰?
        Set-Location $currentDir
    }
}

# 涓荤▼搴?
try {
    # 妫€鏌I鏈嶅姟鍋ュ悍鐘舵€?
    $healthStatus = Test-AIServiceHealth
    
    # 濡傛灉鍋ュ悍妫€鏌ラ€氳繃锛岀户缁鏌ユā鍨嬮厤缃?
    if ($healthStatus) {
        $configStatus = Test-AIModelConfig
        
        # 濡傛灉閰嶇疆妫€鏌ラ€氳繃锛屾祴璇曞熀鏈姛鑳?
        if ($configStatus) {
            $functionalityStatus = Test-AIBasicFunctionality
            
            if ($functionalityStatus) {
                Write-Step "AI鏈嶅姟鍋ュ悍妫€鏌ョ粨鏋? 涓€鍒囨甯革紒" "Green"
            } else {
                Write-Step "AI鏈嶅姟鍋ュ悍妫€鏌ョ粨鏋? 鍩烘湰鍔熻兘寮傚父" "Red"
                
                # 灏濊瘯淇
                if ($fix) {
                    Repair-AIService
                } else {
                    Write-SubStep "浣跨敤 -fix 鍙傛暟灏濊瘯鑷姩淇闂"
                }
            }
        } else {
            Write-Step "AI鏈嶅姟鍋ュ悍妫€鏌ョ粨鏋? 妯″瀷閰嶇疆寮傚父" "Red"
            
            # 灏濊瘯淇
            if ($fix) {
                Repair-AIService
            } else {
                Write-SubStep "浣跨敤 -fix 鍙傛暟灏濊瘯鑷姩淇闂"
            }
        }
    } else {
        Write-Step "AI鏈嶅姟鍋ュ悍妫€鏌ョ粨鏋? 鏈嶅姟寮傚父" "Red"
        
        # 灏濊瘯淇
        if ($fix) {
            Repair-AIService
        } else {
            Write-SubStep "浣跨敤 -fix 鍙傛暟灏濊瘯鑷姩淇闂"
        }
    }
} catch {
    Write-Error "AI鏈嶅姟鍋ュ悍妫€鏌ヨ繃绋嬩腑鍙戠敓閿欒: $_"
} finally {
    # 杩斿洖鍘熺洰褰?
    Set-Location $currentDir
}

