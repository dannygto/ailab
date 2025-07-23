# Delete empty scripts, batch files and documentation files
# Created: 2025-07-21

$extensions = @(".ps1", ".sh", ".bat", ".cmd", ".md", ".txt")
$emptyFiles = @()

Write-Host "Starting to search for empty files..."
$files = Get-ChildItem -Path "D:\ailab\ailab" -Recurse -File | Where-Object { $extensions -contains $_.Extension }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ([string]::IsNullOrWhiteSpace($content)) {
        $emptyFiles += $file.FullName
        Write-Host "Found empty file: $($file.FullName)"
    }
}

Write-Host "Total empty files found: $($emptyFiles.Count)"

if ($emptyFiles.Count -gt 0) {
    $confirmation = Read-Host "Do you want to delete these files? (Y/N)"
    if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
        foreach ($file in $emptyFiles) {
            Remove-Item -Path $file -Force
            Write-Host "Deleted: $file"
        }
        Write-Host "Deletion completed!"
    } else {
        Write-Host "Operation cancelled."
    }
} else {
    Write-Host "No empty files found to delete."
}
