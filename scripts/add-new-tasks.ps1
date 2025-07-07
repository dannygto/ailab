# 鍒涘缓闆嗘垚娴嬭瘯鍜孡inux鍚屾浠诲姟
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        鍒涘缓鏂颁换鍔?                 " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$tasksJsonPath = "$PSScriptRoot\..\.vscode\tasks.json"

# 妫€鏌asks.json鏂囦欢鏄惁瀛樺湪
if (-not (Test-Path $tasksJsonPath)) {
    Write-Host "閿欒: .vscode/tasks.json 鏂囦欢涓嶅瓨鍦? -ForegroundColor Red
    exit 1
}

# 璇诲彇鐜版湁鐨則asks.json鏂囦欢
$tasksJson = Get-Content $tasksJsonPath -Raw | ConvertFrom-Json

# 鍒涘缓闆嗘垚娴嬭瘯浠诲姟
$integrationTestTask = @{
    label = "16-杩愯闆嗘垚娴嬭瘯"
    type = "shell"
    command = "powershell"
    args = @(
        "-ExecutionPolicy",
        "Bypass",
        "-NoProfile",
        "-File",
        "`${workspaceFolder}/scripts/integration-test.ps1"
    )
    group = "test"
    isBackground = $false
}

# 鍒涘缓Linux杩滅▼鍚屾浠诲姟
$linuxSyncTask = @{
    label = "17-Linux杩滅▼鍚屾"
    type = "shell"
    command = "powershell"
    args = @(
        "-ExecutionPolicy",
        "Bypass",
        "-NoProfile",
        "-Command",
        "cd `${workspaceFolder}; scripts\sync-linux-incremental.bat"
    )
    group = "none"
    isBackground = $false
}

# 鍒涘缓杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩閰嶇疆浠诲姟
$remoteAutoStartTask = @{
    label = "18-閰嶇疆杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩"
    type = "shell"
    command = "powershell"
    args = @(
        "-ExecutionPolicy",
        "Bypass",
        "-NoProfile",
        "-File",
        "`${workspaceFolder}/scripts/setup-remote-autostart.ps1"
    )
    group = "none"
    isBackground = $false
}

# 娣诲姞鏂颁换鍔?
$tasksJson.tasks += $integrationTestTask
$tasksJson.tasks += $linuxSyncTask
$tasksJson.tasks += $remoteAutoStartTask

# 淇濆瓨鏇存柊鍚庣殑tasks.json鏂囦欢
$tasksJson | ConvertTo-Json -Depth 10 | Set-Content $tasksJsonPath -Encoding UTF8

Write-Host "鎴愬姛娣诲姞浠ヤ笅浠诲姟:" -ForegroundColor Green
Write-Host "   - 16-杩愯闆嗘垚娴嬭瘯" -ForegroundColor Green
Write-Host "   - 17-Linux杩滅▼鍚屾" -ForegroundColor Green
Write-Host "   - 18-閰嶇疆杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩" -ForegroundColor Green
Write-Host ""
Write-Host "鎮ㄧ幇鍦ㄥ彲浠ラ€氳繃VS Code浠诲姟鑿滃崟杩愯杩欎簺浠诲姟" -ForegroundColor Cyan

