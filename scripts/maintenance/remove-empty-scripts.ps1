# 删除空的脚本、批处理、说明文件
# 创建日期：2025年7月21日

$extensions = @(".ps1", ".sh", ".bat", ".cmd", ".md", ".txt")
$emptyFiles = @()

Write-Host "开始搜索空文件..."
$files = Get-ChildItem -Path "D:\ailab\ailab" -Recurse -File | Where-Object { $extensions -contains $_.Extension }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ([string]::IsNullOrWhiteSpace($content)) {
        $emptyFiles += $file.FullName
        Write-Host "发现空文件: $($file.FullName)"
    }
}

Write-Host "共找到 $($emptyFiles.Count) 个空文件。"

if ($emptyFiles.Count -gt 0) {
    $confirmation = Read-Host "是否删除这些文件？(Y/N)"
    if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
        foreach ($file in $emptyFiles) {
            Remove-Item -Path $file -Force
            Write-Host "已删除: $file"
        }
        Write-Host "删除完成！"
    } else {
        Write-Host "操作已取消。"
    }
} else {
    Write-Host "没有找到需要删除的空文件。"
}
