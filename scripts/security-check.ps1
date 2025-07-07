# AICAM Security Check Script
# Simple security assessment for AICAM platform

Write-Host "AICAM Security Assessment" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$results = @()
$issues = @()

# 1. Check for npm audit
Write-Host "`nChecking npm vulnerabilities..." -ForegroundColor Yellow
try {
    Push-Location "$PSScriptRoot\..\backend"
    $auditResult = npm audit --audit-level=moderate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Backend: No moderate+ vulnerabilities found" -ForegroundColor Green
        $results += "Backend security: OK"
    } else {
        Write-Host "  Backend: Vulnerabilities detected" -ForegroundColor Red
        $issues += "Backend has npm vulnerabilities"
    }
    Pop-Location
    
    Push-Location "$PSScriptRoot\..\frontend"
    $auditResult = npm audit --audit-level=moderate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Frontend: No moderate+ vulnerabilities found" -ForegroundColor Green
        $results += "Frontend security: OK"
    } else {
        Write-Host "  Frontend: Vulnerabilities detected" -ForegroundColor Red
        $issues += "Frontend has npm vulnerabilities"
    }
    Pop-Location
} catch {
    $issues += "NPM audit check failed"
    Write-Host "  Error running npm audit: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Check environment configuration
Write-Host "`nChecking environment configuration..." -ForegroundColor Yellow
$envFile = "$PSScriptRoot\..\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "password.*=.*password|secret.*=.*secret|key.*=.*test") {
        $issues += "Weak default passwords detected in .env"
        Write-Host "  Warning: Default/weak passwords found" -ForegroundColor Red
    } else {
        Write-Host "  Environment configuration appears secure" -ForegroundColor Green
        $results += "Environment config: OK"
    }
} else {
    Write-Host "  No .env file found (using defaults)" -ForegroundColor Yellow
}

# 3. Check for exposed sensitive files
Write-Host "`nChecking for exposed files..." -ForegroundColor Yellow
$sensitiveFiles = @(".env", "config.json", "secrets.json", "private.key")
$gitignorePath = "$PSScriptRoot\..\.gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    foreach ($file in $sensitiveFiles) {
        if ((Test-Path "$PSScriptRoot\..\$file") -and ($gitignoreContent -notmatch [regex]::Escape($file))) {
            $issues += "Sensitive file $file not in .gitignore"
            Write-Host "  Warning: $file not ignored by git" -ForegroundColor Red
        }
    }
    if ($issues.Count -eq 0 -or $issues[-1] -notmatch "not in .gitignore") {
        Write-Host "  No exposed sensitive files detected" -ForegroundColor Green
        $results += "File exposure: OK"
    }
} else {
    $issues += "No .gitignore file found"
    Write-Host "  Warning: No .gitignore file" -ForegroundColor Red
}

# 4. Check running services
Write-Host "`nChecking service security..." -ForegroundColor Yellow
$openPorts = @()
$standardPorts = @(3000, 3002)
foreach ($port in $standardPorts) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $openPorts += $port
    }
}

if ($openPorts.Count -gt 0) {
    Write-Host "  Services running on ports: $($openPorts -join ', ')" -ForegroundColor Blue
    $results += "Service ports: $($openPorts -join ', ') active"
} else {
    Write-Host "  No standard services currently running" -ForegroundColor Yellow
}

# Summary
Write-Host "`nSecurity Assessment Summary" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`nPassed Checks:" -ForegroundColor Green
foreach ($result in $results) {
    Write-Host "  + $result" -ForegroundColor Gray
}

if ($issues.Count -gt 0) {
    Write-Host "`nIssues Found:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Gray
    }
    Write-Host "`nRecommendations:" -ForegroundColor Yellow
    Write-Host "  1. Run 'npm audit fix' in frontend and backend directories" -ForegroundColor Gray
    Write-Host "  2. Update any default passwords in .env file" -ForegroundColor Gray
    Write-Host "  3. Ensure sensitive files are in .gitignore" -ForegroundColor Gray
    $status = "ATTENTION_REQUIRED"
} else {
    Write-Host "`nAll security checks passed!" -ForegroundColor Green
    $status = "PASS"
}

# Generate report
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    status = $status
    passed_checks = $results.Count
    issues_found = $issues.Count
    results = $results
    issues = $issues
}

$reportPath = "$PSScriptRoot\..\security-assessment.json"
$report | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Blue

Write-Host "`nSecurity assessment completed!" -ForegroundColor Cyan

