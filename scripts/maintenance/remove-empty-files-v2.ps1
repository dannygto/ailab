# 删除所有过期的空文件脚本
# 创建日期: 2025年7月21日

$rootDir = "D:\ailab\ailab"
$currentDate = Get-Date
$logFile = Join-Path $rootDir "scripts\maintenance\empty-files-removal-log.txt"

# 记录日志
function Write-Log {
    param (
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -Append -FilePath $logFile -Encoding utf8
    Write-Host $Message
}

# 初始化日志
"删除空文件操作日志 - 开始于 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logFile -Encoding utf8

# 寻找空文件（大小为0字节的文件）
Write-Log "开始扫描空文件..."
$emptyFiles = Get-ChildItem -Path $rootDir -Recurse -File | Where-Object {
    $_.Length -eq 0 -and
    # 排除特定文件和目录
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\.vscode\*" -and
    $_.FullName -notlike "*\dist\*" -and
    $_.FullName -notlike "*\build\*"
}

# 如果没有找到空文件
if ($emptyFiles.Count -eq 0) {
    Write-Log "未发现空文件。"
}
else {
    Write-Log "发现 $($emptyFiles.Count) 个空文件。"

    # 创建报告
    $reportFile = Join-Path $rootDir "empty-files-report.md"
    "# 空文件报告" | Out-File -FilePath $reportFile -Encoding utf8
    "生成日期: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" | Out-File -Append -FilePath $reportFile -Encoding utf8
    "## 发现的空文件" | Out-File -Append -FilePath $reportFile -Encoding utf8

    foreach ($file in $emptyFiles) {
        $fileAge = ($currentDate - $file.LastWriteTime).Days
        $relativePath = $file.FullName.Substring($rootDir.Length + 1)

        # 添加到报告
        "- `"$relativePath`" (最后修改: $($file.LastWriteTime.ToString('yyyy-MM-dd')), 文件年龄: ${fileAge}天)" | Out-File -Append -FilePath $reportFile -Encoding utf8

        # 删除超过90天未修改的空文件
        if ($fileAge -gt 90) {
            try {
                Remove-Item -Path $file.FullName -Force
                Write-Log "已删除: $relativePath (超过90天未修改的空文件)"
                "  - ✓ 已删除 (超过90天未修改)" | Out-File -Append -FilePath $reportFile -Encoding utf8
            }
            catch {
                Write-Log "删除失败: $relativePath - $($_.Exception.Message)"
                "  - ❌ 删除失败: $($_.Exception.Message)" | Out-File -Append -FilePath $reportFile -Encoding utf8
            }
        }
        else {
            "  - ⚠️ 未删除 (修改时间在90天内)" | Out-File -Append -FilePath $reportFile -Encoding utf8
        }
    }

    Write-Log "空文件处理完成。详细报告已保存到: $reportFile"
}

Write-Log "操作完成。"
