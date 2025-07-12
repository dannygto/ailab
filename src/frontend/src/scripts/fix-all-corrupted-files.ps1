# 系统性修复所有损坏的文件

Write-Host "开始修复所有损坏的文件..." -ForegroundColor Yellow

# 定义需要修复的文件列表
$corruptedFiles = @(
    "src\__tests__\Button.test.tsx",
    "src\__tests__\Card.test.tsx",
    "src\components\ai-assistant\AIChatInterface.tsx",
    "src\features\licensing.tsx",
    "src\fixtures\devices.ts",
    "src\hooks\usePWA.ts",
    "src\pages\experiments\components\ExperimentDataPanel.tsx",
    "src\pages\experiments\ExperimentCreate.tsx",
    "src\pages\experiments\ExperimentCreateFinal.tsx",
    "src\pages\experiments\ExperimentCreateFixed.tsx",
    "src\pages\experiments\ExperimentCreateNew.tsx",
    "src\pages\Settings.tsx",
    "src\pages\templates\TemplateCreate.tsx",
    "src\services\base\apiService.ts"
)

# 备份损坏的文件
$backupDir = "src\backup-corrupted-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

foreach ($file in $corruptedFiles) {
    if (Test-Path $file) {
        Write-Host "备份文件: $file" -ForegroundColor Blue
        $backupPath = Join-Path $backupDir (Split-Path $file -Leaf)
        Copy-Item $file $backupPath -Force
        
        Write-Host "删除损坏的文件: $file" -ForegroundColor Red
        Remove-Item $file -Force
    }
}

Write-Host "已备份并删除损坏的文件到: $backupDir" -ForegroundColor Green
Write-Host "请手动重新创建这些文件或从其他备份恢复" -ForegroundColor Yellow
