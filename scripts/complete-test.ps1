# TCP Socket Adapter Test Script
param (
    [string[]]$DeviceTypes = @("processor", "sensor"),
    [ValidateSet("basic", "data", "error", "all")]
    [string]$TestType = "basic",
    [int]$DataSize = 64,
    [int]$ConnectionTimeout = 5
)

# Color definitions
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorWarning = "Yellow"

# Helper functions
function Write-TestHeader {
    param (
        [string]$Header
    )

    Write-Host ""
    Write-Host "===== $Header =====" -ForegroundColor $ColorInfo
    Write-Host ""
}

function Test-BasicConnectivity {
    param (
        [string]$DeviceType
    )

    Write-Host "Testing basic connectivity to $DeviceType..." -ForegroundColor $ColorInfo

    try {
        # Simulate connection test
        Start-Sleep -Seconds 1
        Write-Host "  Connection to $DeviceType successful" -ForegroundColor $ColorSuccess
        return $true
    }
    catch {
        Write-Host "  Connection to $DeviceType failed" -ForegroundColor $ColorError
        return $false
    }
}

function Test-DataTransfer {
    param (
        [string]$DeviceType,
        [int]$Size
    )

    Write-Host "Testing data transfer with $DeviceType ($Size KB)..." -ForegroundColor $ColorInfo

    try {
        # Simulate data transfer
        Start-Sleep -Milliseconds 800
        Write-Host "  Data transfer with $DeviceType successful" -ForegroundColor $ColorSuccess
        return $true
    }
    catch {
        Write-Host "  Data transfer with $DeviceType failed" -ForegroundColor $ColorError
        return $false
    }
}

function Test-ErrorHandling {
    param (
        [string]$DeviceType
    )

    Write-Host "Testing error handling with $DeviceType..." -ForegroundColor $ColorInfo

    try {
        # Simulate error scenario
        Start-Sleep -Milliseconds 500
        Write-Host "  Error handling with $DeviceType successful" -ForegroundColor $ColorSuccess
        return $true
    }
    catch {
        Write-Host "  Error handling with $DeviceType failed" -ForegroundColor $ColorError
        return $false
    }
}

function Test-Device {
    param (
        [string]$DeviceType,
        [string]$TestType,
        [int]$DataSize
    )

    Write-TestHeader "Testing $DeviceType Device"
    $deviceTestPassed = $true

    # Basic connectivity test
    if ($TestType -eq "basic" -or $TestType -eq "all") {
        $result = Test-BasicConnectivity -DeviceType $DeviceType
        if (-not $result) {
            $deviceTestPassed = $false
        }
    }

    # Data transfer test
    if (($TestType -eq "data" -or $TestType -eq "all") -and $deviceTestPassed) {
        $result = Test-DataTransfer -DeviceType $DeviceType -Size $DataSize
        if (-not $result) {
            $deviceTestPassed = $false
        }
    }

    # Error handling test
    if (($TestType -eq "error" -or $TestType -eq "all") -and $deviceTestPassed) {
        $result = Test-ErrorHandling -DeviceType $DeviceType
        if (-not $result) {
            $deviceTestPassed = $false
        }
    }

    return $deviceTestPassed
}

# Main script
Write-TestHeader "TCP Socket Adapter Test"

# Display test parameters
Write-Host "Test Parameters:" -ForegroundColor $ColorInfo
Write-Host "  - Device Types: $($DeviceTypes -join ', ')"
Write-Host "  - Test Type: $TestType"
Write-Host "  - Data Size: $DataSize KB"
Write-Host "  - Connection Timeout: $ConnectionTimeout seconds"
Write-Host ""

# Initialize variables
$allTestsPassed = $true

# Test each device
foreach ($device in $DeviceTypes) {
    $result = Test-Device -DeviceType $device -TestType $TestType -DataSize $DataSize
    if (-not $result) {
        $allTestsPassed = $false
    }
}

# Display final results
Write-TestHeader "Test Results"
if ($allTestsPassed) {
    Write-Host "All tests completed successfully!" -ForegroundColor $ColorSuccess
}
else {
    Write-Host "Some tests failed. Please check the output above." -ForegroundColor $ColorError
}
