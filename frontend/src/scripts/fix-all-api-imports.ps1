# Fix all corrupted ApiIcon imports

$files = @(
    "d:\AICAMV2\frontend\src\__tests__\Settings.test.tsx",
    "d:\AICAMV2\frontend\src\pages\templates\TemplateLibrary.tsx",
    "d:\AICAMV2\frontend\src\pages\templates\TemplateDetail.tsx",
    "d:\AICAMV2\frontend\src\pages\templates\TemplateCreate.tsx",
    "d:\AICAMV2\frontend\src\pages\settings\AIModelSettings.tsx",
    "d:\AICAMV2\frontend\src\pages\resources\ResourceManagement.tsx",
    "d:\AICAMV2\frontend\src\pages\devices\DeviceManagement.tsx",
    "d:\AICAMV2\frontend\src\pages\Login.tsx",
    "d:\AICAMV2\frontend\src\pages\guidance\GuidanceSystem.tsx",
    "d:\AICAMV2\frontend\src\pages\experiments\ExperimentCreateFixed.tsx",
    "d:\AICAMV2\frontend\src\pages\experiments\ExperimentList.tsx",
    "d:\AICAMV2\frontend\src\pages\experiments\ExperimentCreateNew.tsx",
    "d:\AICAMV2\frontend\src\pages\experiments\ExperimentCreateFinal.tsx",
    "d:\AICAMV2\frontend\src\pages\experiments\ExperimentCreate.tsx",
    "d:\AICAMV2\frontend\src\pages\Dashboard.tsx",
    "d:\AICAMV2\frontend\src\components\devices\DeviceReservations.tsx",
    "d:\AICAMV2\frontend\src\components\guidance\GuidanceGenerator.tsx",
    "d:\AICAMV2\frontend\src\components\api\ApiTestTool.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        Write-Host "Fixing $filePath..."
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Replace all corrupted API service imports
        $content = $content -replace "import ApiIconService from '../../services/ApiIcon';", "import api from '../../services/api';"
        $content = $content -replace "import ApiIconService from '../services/ApiIcon';", "import api from '../services/api';"
        $content = $content -replace "jest.mock\('../services/ApiIcon',", "jest.mock('../services/api',"
        $content = $content -replace 'ApiIconService', 'api'
        
        # Write the fixed content back
        Set-Content $filePath -Value $content -Encoding UTF8
        
        Write-Host "Fixed $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "All ApiIcon imports fixed!"
