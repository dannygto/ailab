# AICAM Performance Validation Script
# Performance testing and optimization verification

param(
    [int]$TestDuration = 30,
    [int]$ConcurrentRequests = 10,
    [string]$BaseUrl = "http://localhost:3002"
)

Write-Host "AICAM Performance Validation" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

$results = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    test_duration = $TestDuration
    concurrent_requests = $ConcurrentRequests
    base_url = $BaseUrl
    tests = @()
    summary = @{}
}

# 1. Service Availability Check
Write-Host "`nChecking service availability..." -ForegroundColor Yellow
$services = @(
    @{ name = "Frontend"; url = "http://localhost:3000"; port = 3000 }
    @{ name = "Backend"; url = "http://localhost:3002"; port = 3002 }
)

foreach ($service in $services) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $service.url -Method GET -TimeoutSec 10 -ErrorAction Stop
        $stopwatch.Stop()
        
        $testResult = @{
            service = $service.name
            status = "PASS"
            response_time_ms = $stopwatch.ElapsedMilliseconds
            status_code = $response.StatusCode
            timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        }
        
        Write-Host "  $($service.name): OK ($($stopwatch.ElapsedMilliseconds)ms)" -ForegroundColor Green
    } catch {
        $testResult = @{
            service = $service.name
            status = "FAIL"
            error = $_.Exception.Message
            timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        }
        
        Write-Host "  $($service.name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $results.tests += $testResult
}

# 2. Basic Load Test (if services are available)
$availableServices = $results.tests | Where-Object { $_.status -eq "PASS" }
if ($availableServices.Count -gt 0) {
    Write-Host "`nRunning basic load test..." -ForegroundColor Yellow
    Write-Host "  Duration: $TestDuration seconds" -ForegroundColor Gray
    Write-Host "  Concurrent requests: $ConcurrentRequests" -ForegroundColor Gray
    
    foreach ($service in $availableServices) {
        Write-Host "`n  Testing $($service.service)..." -ForegroundColor Blue
        
        $successCount = 0
        $errorCount = 0
        $responseTimes = @()
        $startTime = Get-Date
        
        # Simple load test using PowerShell jobs
        $jobs = @()
        for ($i = 0; $i -lt $ConcurrentRequests; $i++) {
            $job = Start-Job -ScriptBlock {
                param($url, $duration)
                $endTime = (Get-Date).AddSeconds($duration)
                $results = @()
                
                while ((Get-Date) -lt $endTime) {
                    try {
                        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5
                        $stopwatch.Stop()
                        
                        $results += @{
                            success = $true
                            response_time = $stopwatch.ElapsedMilliseconds
                            status_code = $response.StatusCode
                        }
                    } catch {
                        $results += @{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                    Start-Sleep -Milliseconds 100
                }
                return $results
            } -ArgumentList @($BaseUrl, $TestDuration)
            
            $jobs += $job
        }
        
        # Wait for jobs to complete
        Write-Host "    Running test..." -ForegroundColor Gray
        $jobResults = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        # Analyze results
        $allRequests = $jobResults
        $successfulRequests = $allRequests | Where-Object { $_.success -eq $true }
        $failedRequests = $allRequests | Where-Object { $_.success -eq $false }
        
        if ($successfulRequests) {
            $avgResponseTime = ($successfulRequests | Measure-Object -Property response_time -Average).Average
            $minResponseTime = ($successfulRequests | Measure-Object -Property response_time -Minimum).Minimum
            $maxResponseTime = ($successfulRequests | Measure-Object -Property response_time -Maximum).Maximum
            $totalRequests = $allRequests.Count
            $successRate = [math]::Round(($successfulRequests.Count / $totalRequests) * 100, 2)
        } else {
            $avgResponseTime = 0
            $minResponseTime = 0
            $maxResponseTime = 0
            $totalRequests = $allRequests.Count
            $successRate = 0
        }
        
        $loadTestResult = @{
            service = $service.service
            total_requests = $totalRequests
            successful_requests = $successfulRequests.Count
            failed_requests = $failedRequests.Count
            success_rate_percent = $successRate
            avg_response_time_ms = [math]::Round($avgResponseTime, 2)
            min_response_time_ms = $minResponseTime
            max_response_time_ms = $maxResponseTime
            requests_per_second = [math]::Round($totalRequests / $TestDuration, 2)
        }
        
        $results.tests += $loadTestResult
        
        Write-Host "    Total requests: $totalRequests" -ForegroundColor Gray
        Write-Host "    Success rate: $successRate%" -ForegroundColor Gray
        Write-Host "    Avg response time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Gray
        Write-Host "    Requests/sec: $([math]::Round($totalRequests / $TestDuration, 2))" -ForegroundColor Gray
    }
} else {
    Write-Host "`nSkipping load test - no services available" -ForegroundColor Red
}

# 3. Resource Usage Check
Write-Host "`nChecking system resources..." -ForegroundColor Yellow
try {
    # CPU usage
    $cpu = Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 1
    $cpuUsage = [math]::Round(100 - $cpu.CounterSamples[0].CookedValue, 2)
    
    # Memory usage
    $memory = Get-CimInstance -ClassName Win32_OperatingSystem
    $memoryUsage = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
    
    # Disk usage
    $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3"
    $diskUsage = @()
    foreach ($d in $disk) {
        $usage = [math]::Round((($d.Size - $d.FreeSpace) / $d.Size) * 100, 2)
        $diskUsage += @{
            drive = $d.DeviceID
            usage_percent = $usage
        }
    }
    
    $resourceResult = @{
        cpu_usage_percent = $cpuUsage
        memory_usage_percent = $memoryUsage
        disk_usage = $diskUsage
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    }
    
    $results.tests += $resourceResult
    
    Write-Host "  CPU Usage: $cpuUsage%" -ForegroundColor Gray
    Write-Host "  Memory Usage: $memoryUsage%" -ForegroundColor Gray
    foreach ($d in $diskUsage) {
        Write-Host "  Disk $($d.drive) Usage: $($d.usage_percent)%" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "  Error checking system resources: $($_.Exception.Message)" -ForegroundColor Red
}

# Generate Summary
Write-Host "`nPerformance Test Summary" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$serviceTests = $results.tests | Where-Object { $_.service -and $_.response_time_ms }
$loadTests = $results.tests | Where-Object { $_.total_requests }

if ($serviceTests) {
    $avgServiceResponseTime = ($serviceTests | Measure-Object -Property response_time_ms -Average).Average
    Write-Host "`nService Response Times:" -ForegroundColor Green
    foreach ($test in $serviceTests) {
        Write-Host "  $($test.service): $($test.response_time_ms)ms" -ForegroundColor Gray
    }
}

if ($loadTests) {
    Write-Host "`nLoad Test Results:" -ForegroundColor Green
    foreach ($test in $loadTests) {
        Write-Host "  $($test.service): $($test.success_rate_percent)% success rate, $($test.avg_response_time_ms)ms avg" -ForegroundColor Gray
    }
}

# Performance assessment
$performanceIssues = @()
if ($serviceTests) {
    $slowServices = $serviceTests | Where-Object { $_.response_time_ms -gt 2000 }
    if ($slowServices) {
        $performanceIssues += "Slow service response times detected"
    }
}

if ($loadTests) {
    $lowSuccessRate = $loadTests | Where-Object { $_.success_rate_percent -lt 95 }
    if ($lowSuccessRate) {
        $performanceIssues += "Low success rate in load tests"
    }
}

if ($performanceIssues.Count -eq 0) {
    Write-Host "`nPerformance Status: GOOD" -ForegroundColor Green
    $results.summary.status = "GOOD"
} else {
    Write-Host "`nPerformance Issues:" -ForegroundColor Red
    foreach ($issue in $performanceIssues) {
        Write-Host "  - $issue" -ForegroundColor Gray
    }
    $results.summary.status = "NEEDS_ATTENTION"
}

$results.summary.issues = $performanceIssues

# Save detailed report
$reportPath = "$PSScriptRoot\..\performance-report.json"
$results | ConvertTo-Json -Depth 4 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Blue

Write-Host "`nPerformance validation completed!" -ForegroundColor Cyan

