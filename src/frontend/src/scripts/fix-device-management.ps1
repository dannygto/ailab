# Fix all remaining corrupted imports and issues

$files = @(
    "d:\AICAMV2\frontend\src\pages\devices\DeviceManagement.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        Write-Host "Fixing $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace all corrupted imports and patterns
        $content = $content -replace '../../components/DevicesIconIcon/DeviceMonitor', '../../components/devices/DeviceMonitor'
        $content = $content -replace '../../components/DevicesIconIcon/DeviceReservations', '../../components/devices/DeviceReservations'  
        $content = $content -replace '../../components/DevicesIconIcon/DeviceRemoteControl', '../../components/devices/DeviceRemoteControl'
        $content = $content -replace 'DataUsageIcon as DataUsageIconIcon', 'DataUsageIcon'
        $content = $content -replace 'EventIcon as EventIconIcon', 'EventIcon'
        $content = $content -replace 'React.SyntheticEventIcon', 'React.SyntheticEvent'
        $content = $content -replace 'EventIcon: React.SyntheticEventIcon', 'event: React.SyntheticEvent'
        $content = $content -replace 'api.getDevicesIcon', 'api.getDevices'
        $content = $content -replace 'api.getDeviceReservations', 'api.getDeviceReservations'
        $content = $content -replace 'DataUsageIconIcon', 'DataUsageIcon'
        $content = $content -replace 'EventIconIcon', 'EventIcon'
        
        # Write the fixed content back
        Set-Content $filePath -Value $content -Encoding UTF8
        
        Write-Host "Fixed $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "All device management files fixed!"
