#!/usr/bin/env powershell
# Fix invalid import paths - replace DevicesIcon directory references with correct paths

Write-Host "Fixing invalid import paths..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.FullName -notmatch "node_modules" }

$pathReplacements = @{
    # Fix wrong DevicesIcon directory paths
    "'./pages/DevicesIcon/DeviceManagement'" = "'./pages/devices/DeviceManagement'"
    "'./pages/DevicesIcon/DeviceMonitoring'" = "'./pages/devices/DeviceMonitoring'"
    "'./pages/DevicesIcon/DeviceMonitoringV2'" = "'./pages/devices/DeviceMonitoringV2'"
    "'../../components/DevicesIcon/DeviceList'" = "'../../components/devices/DeviceList'"
    "'../../components/DevicesIcon/DeviceMonitor'" = "'../../components/devices/DeviceMonitor'"
    "'../../components/DevicesIcon/DeviceReservations'" = "'../../components/devices/DeviceReservations'"
    "'../../components/DevicesIcon/DeviceRemoteControl'" = "'../../components/devices/DeviceRemoteControl'"
    "'../../components/domain/DevicesIcon/DeviceMetricsChart'" = "'../../components/domain/devices/DeviceMetricsChart'"
    "'../../components/domain/DevicesIcon/DeviceStatusCard'" = "'../../components/domain/devices/DeviceStatusCard'"
    "'../../components/domain/DevicesIcon/DeviceMonitorListV2'" = "'../../components/domain/devices/DeviceMonitorListV2'"
    "'../components/domain/DevicesIcon/DeviceMetricsChart'" = "'../components/domain/devices/DeviceMetricsChart'"
    "'../components/domain/DevicesIcon/DeviceStatusCard'" = "'../components/domain/devices/DeviceStatusCard'"
    # Fix missing util imports
    "'../../../utils/useInterval'" = "'../../hooks/useInterval'"
    "'./settings/AIModelSettingsIcon'" = "'./settings/AIModelSettings'"
    "'./settings/SecuritySettingsIcon'" = "'./settings/SecuritySettings'"
    "'./settings/NotificationSettingsIcon'" = "'./settings/NotificationSettings'"
    "'./settings/TestSecuritySettingsIcon'" = "'./settings/TestSecuritySettings'"
    # Fix service imports
    "systemSettingsIconService" = "systemSettingsService"
    "useSettingsIconStore" = "useSettingsStore"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $pathReplacements.Keys) {
        $new = $pathReplacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Invalid import paths fixed!" -ForegroundColor Green
