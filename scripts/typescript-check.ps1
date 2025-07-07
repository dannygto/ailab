# typescript-check
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# TypeScript Type Check Script
Write-Host "Running TypeScript type check..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Execute TypeScript type check
npx tsc --noEmit

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript check passed!" -ForegroundColor Green
} else {
    Write-Host "TypeScript check found errors" -ForegroundColor Red
}


