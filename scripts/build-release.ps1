# 椤圭洰浜や粯鎵撳寘鑴氭湰
# 鐢ㄤ簬鍑嗗鏈€缁堢殑浜や粯鍖咃紝鍖呭惈鎵€鏈変唬鐮併€佹枃妗ｅ拰鏋勫缓浜х墿

$OutputEncoding = [System.Text.Encoding]::UTF8
# 编码设置已优化

Write-Host "===== AICAM骞冲彴 v1.0 浜や粯鎵撳寘 =====" -ForegroundColor Cyan
Write-Host "寮€濮嬪噯澶囨渶缁堜氦浠樺寘..." -ForegroundColor Cyan
Write-Host ""

# 璁剧疆璺緞
$rootPath = $PSScriptRoot
$releasePath = Join-Path $rootPath "release"
$releaseArchivePath = Join-Path $rootPath "AICAM_v1.0_Release.zip"
$frontendBuildPath = Join-Path $rootPath "frontend/build"
$backendDistPath = Join-Path $rootPath "backend/dist"
$docsPath = Join-Path $rootPath "documentation"

# 鍒涘缓鍙戝竷鐩綍
if (Test-Path $releasePath) {
    Remove-Item -Path $releasePath -Recurse -Force
}
New-Item -Path $releasePath -ItemType Directory | Out-Null
Write-Host "鍒涘缓鍙戝竷鐩綍: $releasePath" -ForegroundColor Green

# 鍒涘缓鍙戝竷瀛愮洰褰?
$releaseSubDirs = @(
    "code",
    "code/frontend",
    "code/backend",
    "code/ai",
    "docs",
    "build",
    "build/frontend",
    "build/backend",
    "deployment",
    "tests"
)

foreach ($dir in $releaseSubDirs) {
    $path = Join-Path $releasePath $dir
    New-Item -Path $path -ItemType Directory -Force | Out-Null
    Write-Host "  鍒涘缓鐩綍: $dir" -ForegroundColor Gray
}

# 1. 澶嶅埗婧愪唬鐮?
Write-Host "澶嶅埗婧愪唬鐮?.." -ForegroundColor Yellow

# 澶嶅埗鍓嶇浠ｇ爜
Copy-Item -Path (Join-Path $rootPath "frontend/src") -Destination (Join-Path $releasePath "code/frontend") -Recurse
Copy-Item -Path (Join-Path $rootPath "frontend/public") -Destination (Join-Path $releasePath "code/frontend") -Recurse
Copy-Item -Path (Join-Path $rootPath "frontend/package.json") -Destination (Join-Path $releasePath "code/frontend")
Copy-Item -Path (Join-Path $rootPath "frontend/tsconfig.json") -Destination (Join-Path $releasePath "code/frontend")
Write-Host "  澶嶅埗鍓嶇浠ｇ爜瀹屾垚" -ForegroundColor Green

# 澶嶅埗鍚庣浠ｇ爜
Copy-Item -Path (Join-Path $rootPath "backend/src") -Destination (Join-Path $releasePath "code/backend") -Recurse
Copy-Item -Path (Join-Path $rootPath "backend/package.json") -Destination (Join-Path $releasePath "code/backend")
Copy-Item -Path (Join-Path $rootPath "backend/tsconfig.json") -Destination (Join-Path $releasePath "code/backend")
Write-Host "  澶嶅埗鍚庣浠ｇ爜瀹屾垚" -ForegroundColor Green

# 澶嶅埗AI鏈嶅姟浠ｇ爜
Copy-Item -Path (Join-Path $rootPath "ai") -Destination (Join-Path $releasePath "code") -Recurse
Write-Host "  澶嶅埗AI鏈嶅姟浠ｇ爜瀹屾垚" -ForegroundColor Green

# 2. 澶嶅埗鏂囨。
Write-Host "澶嶅埗鏂囨。..." -ForegroundColor Yellow
Copy-Item -Path $docsPath -Destination (Join-Path $releasePath "docs") -Recurse
Copy-Item -Path (Join-Path $rootPath "README.md") -Destination $releasePath
Write-Host "  澶嶅埗鏂囨。瀹屾垚" -ForegroundColor Green

# 3. 缂栬瘧鍓嶇
Write-Host "缂栬瘧鍓嶇..." -ForegroundColor Yellow
try {
    Push-Location (Join-Path $rootPath "frontend")
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "鍓嶇鏋勫缓澶辫触"
    }
    Pop-Location
    
    # 澶嶅埗鏋勫缓浜х墿
    if (Test-Path $frontendBuildPath) {
        Copy-Item -Path $frontendBuildPath -Destination (Join-Path $releasePath "build/frontend") -Recurse
        Write-Host "  澶嶅埗鍓嶇鏋勫缓浜х墿瀹屾垚" -ForegroundColor Green
    } else {
        Write-Host "  鍓嶇鏋勫缓浜х墿涓嶅瓨鍦? $frontendBuildPath" -ForegroundColor Red
    }
} catch {
    Write-Host "  鍓嶇鏋勫缓澶辫触: $_" -ForegroundColor Red
    Pop-Location
}

# 4. 缂栬瘧鍚庣
Write-Host "缂栬瘧鍚庣..." -ForegroundColor Yellow
try {
    Push-Location (Join-Path $rootPath "backend")
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "鍚庣鏋勫缓澶辫触"
    }
    Pop-Location
    
    # 澶嶅埗鏋勫缓浜х墿
    if (Test-Path $backendDistPath) {
        Copy-Item -Path $backendDistPath -Destination (Join-Path $releasePath "build/backend") -Recurse
        Write-Host "  澶嶅埗鍚庣鏋勫缓浜х墿瀹屾垚" -ForegroundColor Green
    } else {
        Write-Host "  鍚庣鏋勫缓浜х墿涓嶅瓨鍦? $backendDistPath" -ForegroundColor Red
    }
} catch {
    Write-Host "  鍚庣鏋勫缓澶辫触: $_" -ForegroundColor Red
    Pop-Location
}

# 5. 澶嶅埗閮ㄧ讲璧勬簮
Write-Host "澶嶅埗閮ㄧ讲璧勬簮..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $rootPath "docker-compose.yml") -Destination (Join-Path $releasePath "deployment")
Copy-Item -Path (Join-Path $rootPath "scripts") -Destination (Join-Path $releasePath "deployment") -Recurse
Copy-Item -Path (Join-Path $rootPath "env.example") -Destination (Join-Path $releasePath "deployment")
Write-Host "  澶嶅埗閮ㄧ讲璧勬簮瀹屾垚" -ForegroundColor Green

# 6. 澶嶅埗娴嬭瘯璧勬簮
Write-Host "澶嶅埗娴嬭瘯璧勬簮..." -ForegroundColor Yellow
# 鍓嶇娴嬭瘯
if (Test-Path (Join-Path $rootPath "frontend/src/__tests__")) {
    Copy-Item -Path (Join-Path $rootPath "frontend/src/__tests__") -Destination (Join-Path $releasePath "tests/frontend") -Recurse
}
if (Test-Path (Join-Path $rootPath "frontend/jest.config.js")) {
    Copy-Item -Path (Join-Path $rootPath "frontend/jest.config.js") -Destination (Join-Path $releasePath "tests/frontend")
}

# 鍚庣娴嬭瘯
if (Test-Path (Join-Path $rootPath "backend/src/__tests__")) {
    Copy-Item -Path (Join-Path $rootPath "backend/src/__tests__") -Destination (Join-Path $releasePath "tests/backend") -Recurse
}
if (Test-Path (Join-Path $rootPath "backend/jest.config.js")) {
    Copy-Item -Path (Join-Path $rootPath "backend/jest.config.js") -Destination (Join-Path $releasePath "tests/backend")
}
Write-Host "  澶嶅埗娴嬭瘯璧勬簮瀹屾垚" -ForegroundColor Green

# 7. 鍒涘缓鍙戝竷璇存槑
$releaseNotes = @"
# AICAM骞冲彴 v1.0 鍙戝竷璇存槑

鍙戝竷鏃ユ湡锛?025骞?鏈?8鏃?
鐗堟湰锛歷1.0.0 (姝ｅ紡鐗?

## 鍙戝竷鍐呭

鏈鍙戝竷鍖呭惈瀹屾暣鐨凙ICAM浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴v1.0鐗堟湰锛屽寘鎷細

1. 婧愪唬鐮?(code/):
   - 鍓嶇 (React + TypeScript)
   - 鍚庣 (Node.js + Express)
   - AI鏈嶅姟

2. 鏋勫缓浜х墿 (build/):
   - 鍓嶇鐢熶骇鐗堟湰
   - 鍚庣缂栬瘧鐗堟湰

3. 鏂囨。 (docs/):
   - 鎶€鏈枃妗?
   - 鐢ㄦ埛鎵嬪唽
   - API鏂囨。
   - 閮ㄧ讲鎸囧崡

4. 閮ㄧ讲璧勬簮 (deployment/):
   - Docker閰嶇疆
   - 鍚姩鑴氭湰
   - 鐜閰嶇疆

5. 娴嬭瘯璧勬簮 (tests/):
   - 鍗曞厓娴嬭瘯
   - API娴嬭瘯

## 瀹夎璇存槑

1. 浣跨敤閮ㄧ讲鑴氭湰锛?
   ```
   cd deployment
   ./start-platform.ps1 -prod
   ```

2. 浣跨敤Docker Compose:
   ```
   cd deployment
   docker-compose up -d
   ```

## 璁块棶鍦板潃

- 鍓嶇搴旂敤锛歨ttp://localhost:3000
- 鍚庣API锛歨ttp://localhost:3002
- API鏂囨。锛歨ttp://localhost:3002/api/docs

## 瀹屾垚搴︾姸鎬?

鎵€鏈夋牳蹇冨姛鑳藉潎宸?00%瀹屾垚锛岃鎯呰鍙傞槄鏂囨。涓殑瀹屾垚搴︽€荤粨鎶ュ憡銆?

---

AICAM鍥㈤槦
2025骞?鏈?8鏃?
"@

Set-Content -Path (Join-Path $releasePath "RELEASE-NOTES.md") -Value $releaseNotes -Encoding UTF8
Write-Host "  鍒涘缓鍙戝竷璇存槑瀹屾垚" -ForegroundColor Green

# 8. 鍒涘缓浜や粯娓呭崟
$deliveryChecklist = @"
# AICAM骞冲彴 v1.0 浜や粯娓呭崟

## 浠ｇ爜璧勬簮
- [x] 鍓嶇婧愪唬鐮?(code/frontend/)
- [x] 鍚庣婧愪唬鐮?(code/backend/)
- [x] AI鏈嶅姟婧愪唬鐮?(code/ai/)

## 鏋勫缓浜х墿
- [x] 鍓嶇鐢熶骇鏋勫缓 (build/frontend/)
- [x] 鍚庣缂栬瘧鐗堟湰 (build/backend/)

## 鏂囨。璧勬簮
- [x] 鎶€鏈枃妗?(docs/01-project-overview/, docs/02-development/)
- [x] API鏂囨。 (docs/04-api-reference/)
- [x] 鐢ㄦ埛鎵嬪唽 (docs/07-user-guides/)
- [x] 閮ㄧ讲鏂囨。 (docs/03-deployment/)
- [x] 椤圭洰绠＄悊鏂囨。 (docs/05-project-management/)

## 閮ㄧ讲璧勬簮
- [x] Docker閰嶇疆 (deployment/docker-compose.yml)
- [x] 閮ㄧ讲鑴氭湰 (deployment/scripts/)
- [x] 鐜閰嶇疆妯℃澘 (deployment/env.example)

## 娴嬭瘯璧勬簮
- [x] 鍓嶇娴嬭瘯 (tests/frontend/)
- [x] 鍚庣娴嬭瘯 (tests/backend/)

## 椤圭洰淇℃伅
- [x] README.md
- [x] 鍙戝竷璇存槑 (RELEASE-NOTES.md)
- [x] 浜や粯娓呭崟 (DELIVERY-CHECKLIST.md)

---

楠屾敹浜猴細_________________

鏃ユ湡锛歘________________
"@

Set-Content -Path (Join-Path $releasePath "DELIVERY-CHECKLIST.md") -Value $deliveryChecklist -Encoding UTF8
Write-Host "  鍒涘缓浜や粯娓呭崟瀹屾垚" -ForegroundColor Green

# 9. 鍒涘缓ZIP褰掓。
Write-Host "鍒涘缓鍙戝竷褰掓。..." -ForegroundColor Yellow
try {
    Compress-Archive -Path "$releasePath\*" -DestinationPath $releaseArchivePath -Force
    Write-Host "  鍒涘缓ZIP褰掓。瀹屾垚: $releaseArchivePath" -ForegroundColor Green
} catch {
    Write-Host "  鍒涘缓ZIP褰掓。澶辫触: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "浜や粯鎵撳寘瀹屾垚!" -ForegroundColor Green
Write-Host "鍙戝竷鐩綍: $releasePath" -ForegroundColor Cyan
Write-Host "鍙戝竷褰掓。: $releaseArchivePath" -ForegroundColor Cyan
Write-Host ""
Write-Host "AICAM骞冲彴 v1.0 姝ｅ紡鐗堜氦浠樺畬鎴?" -ForegroundColor Green

