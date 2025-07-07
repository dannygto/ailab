# 璁剧疆娴嬭瘯鑴氭湰
# 杩愯Settings缁勪欢鐨勬祴璇曞苟鐢熸垚鎶ュ憡

$ErrorActionPreference = "Stop"

Write-Host "姝ｅ湪杩愯璁剧疆鐣岄潰娴嬭瘯..." -ForegroundColor Cyan

# 杩涘叆鍓嶇鐩綍
Set-Location -Path "$PSScriptRoot\..\frontend"

# 瀹夎蹇呰鐨勪緷璧?
Write-Host "妫€鏌ユ祴璇曚緷璧?.." -ForegroundColor Yellow
npm install --no-save @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# 杩愯Settings鐩稿叧娴嬭瘯
Write-Host "鎵ц璁剧疆鐣岄潰娴嬭瘯..." -ForegroundColor Green
npm run test -- --testPathPattern=Settings --coverage

# 濡傛灉娴嬭瘯鎴愬姛锛屾樉绀烘垚鍔熶俊鎭?
if ($LASTEXITCODE -eq 0) {
    Write-Host "娴嬭瘯閫氳繃!" -ForegroundColor Green
} else {
    Write-Host "娴嬭瘯澶辫触锛岃妫€鏌ユ祴璇曟姤鍛娿€? -ForegroundColor Red
}

# 杩斿洖鍘熺洰褰?
Set-Location -Path $PSScriptRoot

# 鎵撳紑娴嬭瘯鎶ュ憡(濡傛灉鐢熸垚)
$reportPath = "$PSScriptRoot\..\frontend\coverage\lcov-report\index.html"
if (Test-Path $reportPath) {
    Write-Host "娴嬭瘯瑕嗙洊鐜囨姤鍛婂凡鐢熸垚锛屾鍦ㄦ墦寮€..." -ForegroundColor Cyan
    Start-Process $reportPath
}

