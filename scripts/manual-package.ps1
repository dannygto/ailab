# AICAM骞冲彴鏍囧噯鐗堟墦鍖呰剼鏈?(鎵嬪姩鎵撳寘)
# 鍒涘缓浜? 2025-06-28

# 璁剧疆鐜鍙橀噺
$date = Get-Date -Format "yyyyMMdd"
$releaseDir = "d:\AICAMV2\release"
$zipName = "AICAM-Standard-$date.zip"
$zipPath = "$releaseDir\$zipName"

# 鍒涘缓涓存椂鎵撳寘鐩綍
$tempDir = "d:\AICAMV2\temp-package"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir\frontend" | Out-Null
New-Item -ItemType Directory -Path "$tempDir\backend" | Out-Null
New-Item -ItemType Directory -Path "$tempDir\ai" | Out-Null
New-Item -ItemType Directory -Path "$tempDir\documentation" | Out-Null
New-Item -ItemType Directory -Path "$tempDir\scripts" | Out-Null

# 澶嶅埗鍓嶇鏂囦欢
Write-Host "姝ｅ湪鍑嗗鍓嶇鏂囦欢..." -ForegroundColor Yellow
Copy-Item -Path "d:\AICAMV2\frontend\*" -Destination "$tempDir\frontend" -Recurse -Exclude "node_modules"

# 澶嶅埗鍚庣鏂囦欢
Write-Host "姝ｅ湪鍑嗗鍚庣鏂囦欢..." -ForegroundColor Yellow
Copy-Item -Path "d:\AICAMV2\backend\*" -Destination "$tempDir\backend" -Recurse -Exclude "node_modules"

# 澶嶅埗AI鏈嶅姟鏂囦欢
Write-Host "姝ｅ湪鍑嗗AI鏈嶅姟鏂囦欢..." -ForegroundColor Yellow
Copy-Item -Path "d:\AICAMV2\ai\*" -Destination "$tempDir\ai" -Recurse -Exclude "__pycache__"

# 澶嶅埗鏂囨。
Write-Host "姝ｅ湪鍑嗗鏂囨。鏂囦欢..." -ForegroundColor Yellow
Copy-Item -Path "d:\AICAMV2\documentation\*" -Destination "$tempDir\documentation" -Recurse

# 澶嶅埗鑴氭湰鏂囦欢
Write-Host "姝ｅ湪鍑嗗鑴氭湰鏂囦欢..." -ForegroundColor Yellow
if (Test-Path "d:\AICAMV2\scripts") {
    Copy-Item -Path "d:\AICAMV2\scripts\*" -Destination "$tempDir\scripts" -Recurse
}

# 澶嶅埗鏍圭洰褰曟枃浠?
Write-Host "姝ｅ湪鍑嗗鏍圭洰褰曟枃浠?.." -ForegroundColor Yellow
Copy-Item -Path "d:\AICAMV2\README.md" -Destination "$tempDir"
Copy-Item -Path "d:\AICAMV2\DELIVERY.md" -Destination "$tempDir"
Copy-Item -Path "d:\AICAMV2\椤圭洰瀹屾垚搴︽€荤粨.md" -Destination "$tempDir"
Copy-Item -Path "d:\AICAMV2\docker-compose.yml" -Destination "$tempDir" -ErrorAction SilentlyContinue
Copy-Item -Path "d:\AICAMV2\env.example" -Destination "$tempDir" -ErrorAction SilentlyContinue
Copy-Item -Path "d:\AICAMV2\package.json" -Destination "$tempDir" -ErrorAction SilentlyContinue

# 澶嶅埗鐗堟湰淇℃伅鏂囦欢
Copy-Item -Path "d:\AICAMV2\release\RELEASE-NOTES.md" -Destination "$tempDir\VERSION.md"
Copy-Item -Path "d:\AICAMV2\release\AICAM-Standard-20250628-delivery-checklist.md" -Destination "$tempDir\DELIVERY-CHECKLIST.md"

# 鍒涘缓鍚姩鑴氭湰
@"
# AICAM Platform 鏍囧噯鐗堝惎鍔ㄨ剼鏈?
# 杩愯姝よ剼鏈互鍚姩AICAM骞冲彴鐨勬墍鏈夋湇鍔?

Write-Host "姝ｅ湪鍚姩AICAM骞冲彴鏍囧噯鐗?.." -ForegroundColor Green
if (Test-Path ".\scripts\start-platform.ps1") {
    & ".\scripts\start-platform.ps1"
} else {
    Write-Host "鍚姩鍓嶇鏈嶅姟..." -ForegroundColor Cyan
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd frontend && npm start"
    Write-Host "鍚姩鍚庣鏈嶅姟..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd backend && npm run dev"
}
"@ | Out-File -FilePath "$tempDir\start.ps1" -Encoding utf8

# 鍒涘缓瀹夎鑴氭湰
@"
# AICAM Platform 鏍囧噯鐗堝畨瑁呰剼鏈?
# 杩愯姝よ剼鏈互瀹夎AICAM骞冲彴鐨勬墍鏈変緷璧?

Write-Host "姝ｅ湪瀹夎AICAM骞冲彴鏍囧噯鐗堜緷璧?.." -ForegroundColor Green
Write-Host "瀹夎鏍圭洰褰曚緷璧?.." -ForegroundColor Cyan
npm install

Write-Host "瀹夎鍓嶇渚濊禆..." -ForegroundColor Cyan
Push-Location frontend
npm install
Pop-Location

Write-Host "瀹夎鍚庣渚濊禆..." -ForegroundColor Green
Push-Location backend
npm install
Pop-Location

Write-Host "瀹夎AI鏈嶅姟渚濊禆..." -ForegroundColor Magenta
Push-Location ai
pip install -r requirements.txt
Pop-Location

Write-Host "鎵€鏈変緷璧栧畨瑁呭畬鎴?" -ForegroundColor Green
"@ | Out-File -FilePath "$tempDir\install.ps1" -Encoding utf8

# 鍒涘缓ZIP鍖?
Write-Host "姝ｅ湪鍒涘缓ZIP鍖?.." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)

# 娓呯悊涓存椂鐩綍
Write-Host "姝ｅ湪娓呯悊涓存椂鏂囦欢..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# 鏄剧ず瀹屾垚淇℃伅
$fileSize = (Get-Item -Path $zipPath).Length / 1MB
Write-Host "=====================================" -ForegroundColor Green
Write-Host "AICAM骞冲彴鏍囧噯鐗堟墦鍖呭畬鎴?" -ForegroundColor Green
Write-Host "鏂囦欢鍚? $zipName" -ForegroundColor Cyan
Write-Host "浣嶇疆: $zipPath" -ForegroundColor Cyan
Write-Host "澶у皬: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Green

