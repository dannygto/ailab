# 闆嗘垚娴嬭瘯鑴氭湰
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM骞冲彴闆嗘垚娴嬭瘯                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 妫€鏌ユ湇鍔¤繍琛岀姸鎬?
function Test-ServiceStatus {
    param (
        [string]$Service,
        [string]$Url,
        [int]$Port
    )
    
    Write-Host "姝ｅ湪妫€鏌?Service鏈嶅姟..." -ForegroundColor Yellow
    
    # 妫€鏌ョ鍙ｆ槸鍚﹀紑鏀?
    $portCheck = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($portCheck) {
        Write-Host "鉁?$Service绔彛 ($Port) 宸插紑鏀? -ForegroundColor Green
        
        # 灏濊瘯璇锋眰API
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            Write-Host "鉁?$Service API 璇锋眰鎴愬姛" -ForegroundColor Green
            Write-Host "   鐘舵€佺爜: $($response.StatusCode)" -ForegroundColor Gray
            Write-Host "   鍝嶅簲鍐呭: $($response.Content)" -ForegroundColor Gray
            return $true
        }
        catch {
            Write-Host "鉂?$Service API 璇锋眰澶辫触: $_" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "鉂?$Service绔彛 ($Port) 鏈紑鏀? -ForegroundColor Red
        return $false
    }
}

# 娴嬭瘯鍓嶇鍜屽悗绔€氫俊
function Test-FrontendBackendIntegration {
    Write-Host "`n銆愬墠绔拰鍚庣閫氫俊娴嬭瘯銆? -ForegroundColor Yellow
    
    # 灏濊瘯璇锋眰鍓嶇璋冪敤鍚庣鐨勭ず渚婣PI
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/test-backend-connection" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "鉁?鍓嶇閫氳繃浠ｇ悊鎴愬姛璋冪敤鍚庣API" -ForegroundColor Green
        Write-Host "   鐘舵€佺爜: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   鍝嶅簲鍐呭: $($response.Content)" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Host "鉂?鍓嶇鏃犳硶閫氳繃浠ｇ悊璋冪敤鍚庣API: $_" -ForegroundColor Red
        
        # 灏濊瘯鐩存帴璇锋眰鍚庣
        try {
            $backendResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-Host "   浣嗗悗绔湇鍔＄洿鎺ヨ闂甯?(鐘舵€佺爜: $($backendResponse.StatusCode))" -ForegroundColor Yellow
        }
        catch {
            Write-Host "   鍚庣鏈嶅姟鐩存帴璁块棶涔熷け璐? $_" -ForegroundColor Red
        }
        
        return $false
    }
}

# 娴嬭瘯鍚庣鍜孉I鏈嶅姟閫氫俊
function Test-BackendAIIntegration {
    Write-Host "`n銆愬悗绔拰AI鏈嶅姟閫氫俊娴嬭瘯銆? -ForegroundColor Yellow
    
    # 灏濊瘯閫氳繃鍚庣璋冪敤AI鏈嶅姟
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/api/ai/test-connection" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "鉁?鍚庣鎴愬姛璋冪敤AI鏈嶅姟" -ForegroundColor Green
        Write-Host "   鐘舵€佺爜: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   鍝嶅簲鍐呭: $($response.Content)" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Host "鉂?鍚庣鏃犳硶璋冪敤AI鏈嶅姟: $_" -ForegroundColor Red
        
        # 灏濊瘯鐩存帴璇锋眰AI鏈嶅姟
        try {
            $aiResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-Host "   浣咥I鏈嶅姟鐩存帴璁块棶姝ｅ父 (鐘舵€佺爜: $($aiResponse.StatusCode))" -ForegroundColor Yellow
        }
        catch {
            Write-Host "   AI鏈嶅姟鐩存帴璁块棶涔熷け璐? $_" -ForegroundColor Red
        }
        
        return $false
    }
}

# 娴嬭瘯瀹屾暣鐨勭鍒扮娴佺▼
function Test-EndToEndFlow {
    Write-Host "`n銆愮鍒扮闆嗘垚娴佺▼娴嬭瘯銆? -ForegroundColor Yellow
    
    # 灏濊瘯鍒涘缓涓€涓疄楠屽苟鑾峰彇AI鍒嗘瀽缁撴灉
    try {
        # 姝ラ1锛氬垱寤哄疄楠?
        $experimentData = @{
            name = "闆嗘垚娴嬭瘯瀹為獙"
            description = "杩欐槸涓€涓嚜鍔ㄥ垱寤虹殑闆嗘垚娴嬭瘯瀹為獙"
            type = "basic"
            settings = @{
                duration = 60
                sampleRate = 5
            }
        } | ConvertTo-Json
        
        $createResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/experiments" -Method Post -Body $experimentData -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $experiment = $createResponse.Content | ConvertFrom-Json
        
        Write-Host "鉁?姝ラ1锛氭垚鍔熷垱寤哄疄楠? -ForegroundColor Green
        Write-Host "   瀹為獙ID: $($experiment.id)" -ForegroundColor Gray
        
        # 姝ラ2锛氬惎鍔ㄥ疄楠?
        $startResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/experiments/$($experiment.id)/start" -Method Post -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "鉁?姝ラ2锛氭垚鍔熷惎鍔ㄥ疄楠? -ForegroundColor Green
        
        # 姝ラ3锛氱瓑寰呭苟鑾峰彇瀹為獙鐘舵€?
        Start-Sleep -Seconds 3
        $statusResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/experiments/$($experiment.id)/status" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $status = $statusResponse.Content | ConvertFrom-Json
        
        Write-Host "鉁?姝ラ3锛氭垚鍔熻幏鍙栧疄楠岀姸鎬? -ForegroundColor Green
        Write-Host "   瀹為獙鐘舵€? $($status.status)" -ForegroundColor Gray
        
        # 姝ラ4锛氳幏鍙朅I鍒嗘瀽缁撴灉
        $aiResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/experiments/$($experiment.id)/ai-analysis" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $aiResult = $aiResponse.Content | ConvertFrom-Json
        
        Write-Host "鉁?姝ラ4锛氭垚鍔熻幏鍙朅I鍒嗘瀽缁撴灉" -ForegroundColor Green
        Write-Host "   AI鍒嗘瀽缁撴灉: $($aiResult.summary)" -ForegroundColor Gray
        
        return $true
    }
    catch {
        Write-Host "鉂?绔埌绔祦绋嬫祴璇曞け璐? $_" -ForegroundColor Red
        return $false
    }
}

# 寮€濮嬫祴璇?
Write-Host "寮€濮嬮泦鎴愭祴璇?.." -ForegroundColor Cyan

# 妫€鏌ュ悇涓湇鍔＄姸鎬?
$frontendStatus = Test-ServiceStatus -Service "鍓嶇" -Url "http://localhost:3000" -Port 3000
$backendStatus = Test-ServiceStatus -Service "鍚庣" -Url "http://localhost:3002/health" -Port 3002
$aiStatus = Test-ServiceStatus -Service "AI鏈嶅姟" -Url "http://localhost:5000/health" -Port 5000

# 濡傛灉鎵€鏈夋湇鍔￠兘杩愯姝ｅ父锛岀户缁繘琛岄泦鎴愭祴璇?
if ($frontendStatus -and $backendStatus -and $aiStatus) {
    Write-Host "`n鎵€鏈夋湇鍔¤繍琛屾甯革紝寮€濮嬭繘琛岄泦鎴愭祴璇?.." -ForegroundColor Cyan
    
    $frontendBackendIntegration = Test-FrontendBackendIntegration
    $backendAIIntegration = Test-BackendAIIntegration
    
    if ($frontendBackendIntegration -and $backendAIIntegration) {
        Write-Host "`n鍩虹闆嗘垚娴嬭瘯閫氳繃锛屽紑濮嬬鍒扮娴佺▼娴嬭瘯..." -ForegroundColor Cyan
        $endToEndResult = Test-EndToEndFlow
        
        if ($endToEndResult) {
            Write-Host "`n馃帀 鎭枩锛佸畬鏁寸殑绔埌绔泦鎴愭祴璇曢€氳繃锛? -ForegroundColor Green
        }
        else {
            Write-Host "`n鉂?绔埌绔泦鎴愭祴璇曞け璐ワ紝浣嗗熀纭€闆嗘垚娴嬭瘯閫氳繃" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "`n鉂?鍩虹闆嗘垚娴嬭瘯澶辫触锛岃烦杩囩鍒扮娴佺▼娴嬭瘯" -ForegroundColor Red
    }
}
else {
    Write-Host "`n鉂?閮ㄥ垎鏈嶅姟鏈繍琛岋紝鏃犳硶杩涜瀹屾暣鐨勯泦鎴愭祴璇? -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "        闆嗘垚娴嬭瘯瀹屾垚                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

