# Fix NotificationSettings.tsx corrupted variable names

$filePath = "d:\AICAMV2\frontend\src\pages\settings\NotificationSettings.tsx"

if (Test-Path $filePath) {
    Write-Host "Fixing NotificationSettings.tsx..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Replace all corrupted variable names
    $content = $content -replace 'NotificationsIconettingsIcon', 'notificationSettings'
    $content = $content -replace 'setNotificationsIconettingsIcon', 'setNotificationSettings'
    $content = $content -replace 'CheckIconed', 'checked'
    $content = $content -replace 'EmailIconEnabled', 'emailEnabled'
    $content = $content -replace 'SmsIconEnabled', 'smsEnabled'
    $content = $content -replace 'systemNotificationsIcon', 'systemNotifications'
    $content = $content -replace 'experimentNotificationsIcon', 'experimentNotifications'
    $content = $content -replace 'errorNotificationsIcon', 'errorNotifications'
    $content = $content -replace 'reportNotificationsIcon', 'reportNotifications'
    $content = $content -replace 'maintenanceNotificationsIcon', 'maintenanceNotifications'
    $content = $content -replace 'EventIcon', 'event'
    $content = $content -replace 'React.SyntheticEventIcon', 'React.SyntheticEvent'
    
    # Write the fixed content back
    Set-Content $filePath -Value $content -Encoding UTF8
    
    Write-Host "Fixed NotificationSettings.tsx"
} else {
    Write-Host "File not found: $filePath"
}
