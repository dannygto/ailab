# 浼樺寲VS Code浠诲姟閰嶇疆
# 璁剧疆缂栫爜涓篣TF-8锛岄伩鍏嶄腑鏂囦贡鐮?
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        浼樺寲VS Code浠诲姟閰嶇疆                        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$tasksJsonPath = "$PSScriptRoot\..\.vscode\tasks.json"

# 鍒涘缓浼樺寲鍚庣殑浠诲姟閰嶇疆
$optimizedTasks = @{
    version = "2.0.0"
    tasks = @(
        @{
            label = "1-鍚姩鍏ㄩ儴鏈嶅姟"
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-NoProfile",
                "-File",
                "`${workspaceFolder}/ascii-compatible-start.ps1"
            )
            group = @{
                kind = "build"
                isDefault = $true
            }
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "build"
            }
        },
        @{
            label = "2-绯荤粺鍋ュ悍妫€鏌?
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-NoProfile",
                "-File",
                "`${workspaceFolder}/scripts/health-check.ps1"
            )
            group = "test"
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "test"
            }
        },
        @{
            label = "3-鍋滄鎵€鏈夋湇鍔?
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                "Write-Host '姝ｅ湪鍋滄鎵€鏈夋湇鍔?..' -ForegroundColor Yellow; Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Get-NetTCPConnection -LocalPort 3000,3002 -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id `$_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} }; Write-Host '鎵€鏈夋湇鍔″凡鍋滄' -ForegroundColor Green"
            )
            group = "build"
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "build"
            }
        },
        @{
            label = "4-瀹夎鎵€鏈変緷璧?
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-NoProfile",
                "-File",
                "`${workspaceFolder}/scripts/install-dependencies.ps1"
            )
            group = "build"
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "build"
            }
        },
        @{
            label = "5-娓呯悊椤圭洰"
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-NoProfile",
                "-File",
                "`${workspaceFolder}/scripts/clean-project.ps1"
            )
            group = "build"
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "build"
            }
        },
        @{
            label = "6-TypeScript绫诲瀷妫€鏌?
            type = "shell"
            command = "powershell"
            args = @(
                "-ExecutionPolicy",
                "Bypass",
                "-NoProfile",
                "-File",
                "`${workspaceFolder}/scripts/typescript-check.ps1"
            )
            group = "build"
            isBackground = $false
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "build"
            }
        },
        @{
            label = "7-杩愯闆嗘垚娴嬭瘯"
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
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "test"
            }
        },
        @{
            label = "8-Linux杩滅▼鍚屾"
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
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "deploy"
            }
        },
        @{
            label = "9-閰嶇疆杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩"
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
            presentation = @{
                echo = $true
                reveal = "always"
                focus = $false
                panel = "shared"
                showReuseMessage = $true
                clear = $false
                group = "deploy"
            }
        }
    )
}

# 淇濆瓨浼樺寲鍚庣殑tasks.json鏂囦欢
$optimizedTasks | ConvertTo-Json -Depth 10 | Set-Content $tasksJsonPath -Encoding UTF8

Write-Host "鉁?浠诲姟閰嶇疆浼樺寲瀹屾垚!" -ForegroundColor Green
Write-Host ""
Write-Host "浼樺寲鍚庣殑浠诲姟鍒楄〃:" -ForegroundColor Yellow
Write-Host "  1-鍚姩鍏ㄩ儴鏈嶅姟 (榛樿鏋勫缓浠诲姟)" -ForegroundColor Green
Write-Host "  2-绯荤粺鍋ュ悍妫€鏌? -ForegroundColor Green
Write-Host "  3-鍋滄鎵€鏈夋湇鍔? -ForegroundColor Green
Write-Host "  4-瀹夎鎵€鏈変緷璧? -ForegroundColor Green
Write-Host "  5-娓呯悊椤圭洰" -ForegroundColor Green
Write-Host "  6-TypeScript绫诲瀷妫€鏌? -ForegroundColor Green
Write-Host "  7-杩愯闆嗘垚娴嬭瘯" -ForegroundColor Green
Write-Host "  8-Linux杩滅▼鍚屾" -ForegroundColor Green
Write-Host "  9-閰嶇疆杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩" -ForegroundColor Green
Write-Host ""
Write-Host "鎵€鏈変换鍔＄幇鍦ㄩ兘鍦ㄥ綋鍓嶇粓绔殑鍒嗘爮涓繍琛岋紝涓嶄細鎵撳紑鏂扮獥鍙ｃ€? -ForegroundColor Cyan

