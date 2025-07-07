Write-Host "AICAM浠诲姟鍒锋柊宸ュ叿" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "姝ｅ湪灏濊瘯鍒锋柊VS Code浠诲姟..." -ForegroundColor Yellow

# 妫€鏌asks.json鏂囦欢鏄惁瀛樺湪
$tasksPath = ".vscode\tasks.json"
if (Test-Path $tasksPath) {
    Write-Host "鉁?鎵惧埌浠诲姟閰嶇疆鏂囦欢: $tasksPath" -ForegroundColor Green
    
    # 璇诲彇鏂囦欢鍐呭
    $content = Get-Content $tasksPath -Raw
    
    # 鏄剧ず鍓嶅嚑涓换鍔″悕绉?
    $taskMatches = [regex]::Matches($content, '"label"\s*:\s*"([^"]*)"')
    
    Write-Host ""
    Write-Host "妫€娴嬪埌浠ヤ笅浠诲姟:" -ForegroundColor Yellow
    foreach ($match in $taskMatches | Select-Object -First 5) {
        Write-Host "   - " $match.Groups[1].Value -ForegroundColor Green
    }
    
    if ($taskMatches.Count -gt 5) {
        Write-Host "   ... (绛夊叡" $taskMatches.Count "涓换鍔?" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "鍒锋柊鎿嶄綔鎻愮ず:" -ForegroundColor Yellow
    Write-Host "1. 鎸変笅 Ctrl+Shift+P 鎵撳紑鍛戒护闈㈡澘"
    Write-Host "2. 杈撳叆 'Developer: Reload Window' 骞舵寜鍥炶溅"
    Write-Host "3. VS Code閲嶆柊鍔犺浇鍚庯紝鍐嶆鎸変笅 Ctrl+Shift+P"
    Write-Host "4. 杈撳叆 '浠诲姟' 鎴?'Task' 骞堕€夋嫨 '杩愯浠诲姟'"
    
} else {
    Write-Host "脳 鏈壘鍒颁换鍔￠厤缃枃浠? $tasksPath" -ForegroundColor Red
    Write-Host "璇风‘璁ゆ偍鍦ˋICAM椤圭洰鏍圭洰褰曚腑杩愯姝よ剼鏈? -ForegroundColor Yellow
}
}

Write-Host ""
Read-Host "鎸塃nter閿户缁?

