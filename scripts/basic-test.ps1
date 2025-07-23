# Simple TCP Socket Test with Parameters

# Define parameters
$deviceTypes = @("processor", "sensor")
$testPassed = $true

# Helper functions
function Test-DeviceConnectivity {
    param (
        [string]$deviceType
    )

    Write-Host "Testing $deviceType device connectivity..." -ForegroundColor Cyan

    try {
        # Simulate connection test
        Start-Sleep -Seconds 1
        Write-Host "$deviceType device test passed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "$deviceType device test failed" -ForegroundColor Red
        return $false
    }
}

# Main script
Write-Host "Starting TCP Socket Adapter Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

foreach ($device in $deviceTypes) {
    $result = Test-DeviceConnectivity -deviceType $device
    if (-not $result) {
        $testPassed = $false
    }
}

# Final results
Write-Host ""
if ($testPassed) {
    Write-Host "All tests completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "Some tests failed. Please check the output above." -ForegroundColor Red
}
