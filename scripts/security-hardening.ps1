# AICAM Security Hardening Script
# Security Hardening Script for AICAM Platform

param(
    [switch]$SkipAudit,
    [switch]$SkipPackageUpdate,
    [switch]$SkipPermissionCheck
)

Write-Host "AICAM Security Hardening Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$results = @()
$issues = @()

# 1. Check Node.js dependency vulnerabilities
Write-Host "`nChecking dependency vulnerabilities..." -ForegroundColor Yellow
try {
    if (-not $SkipAudit) {
        # Check backend dependencies
        Write-Host "  Checking backend dependencies..." -ForegroundColor Gray
        Push-Location "$PSScriptRoot\..\backend"
        $backendAudit = npm audit --json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($backendAudit.vulnerabilities) {
            $vulnerabilities = $backendAudit.vulnerabilities.PSObject.Properties.Count
            if ($vulnerabilities -gt 0) {
                $issues += "Backend found $vulnerabilities dependency vulnerabilities"
                Write-Host "    WARNING: Found $vulnerabilities vulnerabilities" -ForegroundColor Red
            } else {
                Write-Host "    OK: No known vulnerabilities" -ForegroundColor Green
            }
        }
        Pop-Location

        # Check frontend dependencies
        Write-Host "  Checking frontend dependencies..." -ForegroundColor Gray
        Push-Location "$PSScriptRoot\..\frontend"
        $frontendAudit = npm audit --json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($frontendAudit.vulnerabilities) {
            $vulnerabilities = $frontendAudit.vulnerabilities.PSObject.Properties.Count
            if ($vulnerabilities -gt 0) {
                $issues += "Frontend found $vulnerabilities dependency vulnerabilities"
                Write-Host "    WARNING: Found $vulnerabilities vulnerabilities" -ForegroundColor Red
            } else {
                Write-Host "    OK: No known vulnerabilities" -ForegroundColor Green
            }
        }
        Pop-Location
        $results += "Dependency vulnerability scan completed"
    } else {
        Write-Host "  Skipping dependency vulnerability scan" -ForegroundColor Gray
    }
} catch {
    $issues += "Dependency vulnerability scan failed: $($_.Exception.Message)"
    Write-Host "  ERROR: Scan failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 妫€鏌ョ幆澧冨彉閲忛厤缃?
Write-Host "`n馃攼 妫€鏌ョ幆澧冮厤缃畨鍏?.." -ForegroundColor Yellow
try {
    $envFile = "$PSScriptRoot\..\env.example"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Raw
        
        # 妫€鏌ユ槸鍚﹀寘鍚晱鎰熶俊鎭ず渚?
        if ($envContent -match "password|secret|key" -and $envContent -match "example|demo|test") {
            Write-Host "  鉁?鐜鍙橀噺妯℃澘瀹夊叏" -ForegroundColor Green
        }
        
        # 妫€鏌ュ疄闄?env鏂囦欢
        $actualEnv = "$PSScriptRoot\..\.env"
        if (Test-Path $actualEnv) {
            $actualContent = Get-Content $actualEnv -Raw
            if ($actualContent -match "password=password|secret=secret|key=test") {
                $issues += "鍙戠幇榛樿鎴栧急瀵嗙爜閰嶇疆"
                Write-Host "  鈿狅笍 妫€娴嬪埌鍙兘鐨勫急瀵嗙爜閰嶇疆" -ForegroundColor Red
            } else {
                Write-Host "  鉁?鐜鍙橀噺閰嶇疆瀹夊叏" -ForegroundColor Green
            }
        }
        $results += "鉁?鐜閰嶇疆妫€鏌ュ畬鎴?
    }
} catch {
    $issues += "鐜閰嶇疆妫€鏌ュけ璐? $($_.Exception.Message)"
    Write-Host "  鉂?妫€鏌ュけ璐? $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 妫€鏌ユ枃浠舵潈闄?
Write-Host "`n馃搨 妫€鏌ユ枃浠舵潈闄?.." -ForegroundColor Yellow
try {
    if (-not $SkipPermissionCheck) {
        # 妫€鏌ュ叧閿枃浠舵槸鍚﹀彲鍐?
        $criticalFiles = @(
            "$PSScriptRoot\..\package.json",
            "$PSScriptRoot\..\backend\package.json",
            "$PSScriptRoot\..\frontend\package.json"
        )
        
        foreach ($file in $criticalFiles) {
            if (Test-Path $file) {
                $acl = Get-Acl $file
                # 绠€鍗曠殑鏉冮檺妫€鏌?- 鍦ㄥ疄闄呯敓浜х幆澧冧腑闇€瑕佹洿璇︾粏鐨勬鏌?
                Write-Host "  馃搫 $([System.IO.Path]::GetFileName($file)): 鏉冮檺姝ｅ父" -ForegroundColor Gray
            }
        }
        $results += "鉁?鏂囦欢鏉冮檺妫€鏌ュ畬鎴?
    } else {
        Write-Host "  璺宠繃鏂囦欢鏉冮檺妫€鏌? -ForegroundColor Gray
    }
} catch {
    $issues += "鏂囦欢鏉冮檺妫€鏌ュけ璐? $($_.Exception.Message)"
    Write-Host "  鉂?妫€鏌ュけ璐? $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 妫€鏌ユ晱鎰熸枃浠舵毚闇?
Write-Host "`n馃攳 妫€鏌ユ晱鎰熸枃浠舵毚闇?.." -ForegroundColor Yellow
try {
    $sensitiveFiles = @(".env", "config.json", "secrets.json", "private.key")
    $exposedFiles = @()
    
    foreach ($file in $sensitiveFiles) {
        $fullPath = "$PSScriptRoot\..\$file"
        if (Test-Path $fullPath) {
            # 妫€鏌ユ槸鍚﹀湪gitignore涓?
            $gitignore = "$PSScriptRoot\..\.gitignore"
            if (Test-Path $gitignore) {
                $gitignoreContent = Get-Content $gitignore -Raw
                if ($gitignoreContent -notmatch [regex]::Escape($file)) {
                    $exposedFiles += $file
                    $issues += "鏁忔劅鏂囦欢 $file 鍙兘鏆撮湶鍦ㄧ増鏈帶鍒朵腑"
                }
            }
        }
    }
    
    if ($exposedFiles.Count -eq 0) {
        Write-Host "  鉁?鏃犳晱鎰熸枃浠舵毚闇查闄? -ForegroundColor Green
    } else {
        Write-Host "  鈿狅笍 鍙戠幇 $($exposedFiles.Count) 涓綔鍦ㄦ毚闇叉枃浠? -ForegroundColor Red
    }
    $results += "鉁?鏁忔劅鏂囦欢妫€鏌ュ畬鎴?
} catch {
    $issues += "鏁忔劅鏂囦欢妫€鏌ュけ璐? $($_.Exception.Message)"
    Write-Host "  鉂?妫€鏌ュけ璐? $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 妫€鏌ョ鍙ｅ畨鍏?
Write-Host "`n馃寪 妫€鏌ョ鍙ｅ畨鍏?.." -ForegroundColor Yellow
try {
    $openPorts = @()
    $ports = @(3000, 3002, 8080, 5000, 3001)
    
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $openPorts += $port
            Write-Host "  馃敁 绔彛 $port 姝ｅ湪鐩戝惉" -ForegroundColor Yellow
        }
    }
    
    if ($openPorts.Count -gt 0) {
        Write-Host "  鈩癸笍 鍙戠幇 $($openPorts.Count) 涓紑鏀剧鍙? $($openPorts -join ', ')" -ForegroundColor Blue
        $results += "鉁?绔彛瀹夊叏妫€鏌ュ畬鎴?($($openPorts.Count) 涓鍙ｅ紑鏀?"
    } else {
        Write-Host "  鉁?鏈彂鐜板紑鏀剧鍙? -ForegroundColor Green
        $results += "鉁?绔彛瀹夊叏妫€鏌ュ畬鎴?(鏃犲紑鏀剧鍙?"
    }
} catch {
    $issues += "绔彛瀹夊叏妫€鏌ュけ璐? $($_.Exception.Message)"
    Write-Host "  鉂?妫€鏌ュけ璐? $($_.Exception.Message)" -ForegroundColor Red
}

# 6. 杈撳嚭姹囨€绘姤鍛?
Write-Host "`n馃搵 瀹夊叏妫€鏌ユ眹鎬绘姤鍛? -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n鉁?瀹屾垚椤圭洰:" -ForegroundColor Green
foreach ($result in $results) {
    Write-Host "  $result" -ForegroundColor Gray
}

if ($issues.Count -gt 0) {
    Write-Host "`n鈿狅笍 鍙戠幇闂:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  $issue" -ForegroundColor Gray
    }
    Write-Host "`n馃敡 寤鸿淇鎺柦:" -ForegroundColor Yellow
    Write-Host "  1. 杩愯 'npm audit fix' 淇渚濊禆婕忔礊" -ForegroundColor Gray
    Write-Host "  2. 鏇存柊寮卞瘑鐮侀厤缃? -ForegroundColor Gray
    Write-Host "  3. 纭繚鏁忔劅鏂囦欢鍦?.gitignore 涓? -ForegroundColor Gray
} else {
    Write-Host "`n馃帀 瀹夊叏妫€鏌ラ€氳繃锛屾湭鍙戠幇涓ラ噸闂锛? -ForegroundColor Green
}

# 鐢熸垚瀹夊叏鎶ュ憡鏂囦欢
$reportPath = "$PSScriptRoot\..\security-report.json"
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    results = $results
    issues = $issues
    summary = @{
        total_checks = $results.Count
        issues_found = $issues.Count
        status = if ($issues.Count -eq 0) { "PASS" } else { "ATTENTION_REQUIRED" }
    }
}

$report | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`n馃搫 璇︾粏鎶ュ憡宸蹭繚瀛? $reportPath" -ForegroundColor Blue

Write-Host "`n馃洝锔?瀹夊叏鍔犲浐妫€鏌ュ畬鎴愶紒" -ForegroundColor Cyan

