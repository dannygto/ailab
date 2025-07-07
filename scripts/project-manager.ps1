# ============================================================================
# AICAM V2 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴 - 缁熶竴椤圭洰绠＄悊鑴氭湰
# 鏍囧噯鍖栧紑鍙戙€佹祴璇曘€侀儴缃插叏娴佺▼绠＄悊
# ============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "test", "install", "build", "clean", "health", "setup", "help")]
    [string]$Action = "help",
    
    [ValidateSet("dev", "prod", "test")]
    [string]$Mode = "dev",
    
    [ValidateSet("all", "frontend", "backend", "ai")]
    [string]$Target = "all",
    
    [switch]$Force,
    [switch]$Verbose,
    [switch]$SkipDeps
)

# 鍏ㄥ眬閰嶇疆
$Global:Config = @{
    ProjectName = "AICAM V2 浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴"
    Version = "2.0.0"
    FrontendPort = 3000
    BackendPort = 3002
    Timeout = 30
    Colors = @{
        Success = "Green"
        Error = "Red" 
        Warning = "Yellow"
        Info = "Cyan"
        Debug = "Gray"
        Primary = "Blue"
        Secondary = "Magenta"
    }
}

# ============================================================================
# 宸ュ叿鍑芥暟
# ============================================================================

function Write-Banner {
    param([string]$Title, [string]$Color = "Primary")
    $border = "=" * 80
    Write-ColorOutput $border $Global:Config.Colors[$Color]
    Write-ColorOutput " $Title" $Global:Config.Colors[$Color]
    Write-ColorOutput $border $Global:Config.Colors[$Color]
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = "",
        [switch]$NoNewline
    )
    
    if ($Prefix) {
        Write-Host "[$Prefix] " -NoNewline -ForegroundColor $Color
    }
    
    if ($NoNewline) {
        Write-Host $Message -NoNewline -ForegroundColor $Color
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

function Stop-ProcessByPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                    ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
        
        if ($processes) {
            $processes | ForEach-Object {
                Write-ColorOutput "馃洃 鍋滄杩涚▼: $($_.ProcessName) (PID: $($_.Id))" $Global:Config.Colors.Warning "CLEANUP"
                $_ | Stop-Process -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Test-ProjectStructure {
    $required = @("package.json", "frontend", "backend")
    foreach ($item in $required) {
        if (!(Test-Path $item)) {
            Write-ColorOutput "鉂?缂哄皯蹇呰鏂囦欢/鐩綍: $item" $Global:Config.Colors.Error "STRUCTURE"
            return $false
        }
    }
    return $true
}

function Invoke-Command-Safely {
    param(
        [string]$Command,
        [string]$WorkingDirectory = ".",
        [string]$Description = "",
        [int]$TimeoutSeconds = 300
    )
    
    if ($Description) {
        Write-ColorOutput "馃敡 $Description" $Global:Config.Colors.Info "EXEC"
    }
    
    if ($Verbose) {
        Write-ColorOutput "   鍛戒护: $Command" $Global:Config.Colors.Debug "EXEC"
        Write-ColorOutput "   鐩綍: $WorkingDirectory" $Global:Config.Colors.Debug "EXEC"
    }
    
    try {
        $process = Start-Process -FilePath "powershell" -ArgumentList "-Command", $Command -WorkingDirectory $WorkingDirectory -Wait -PassThru -WindowStyle Hidden
        
        if ($process.ExitCode -eq 0) {
            Write-ColorOutput "鉁?鎵ц鎴愬姛" $Global:Config.Colors.Success "EXEC"
            return $true
        } else {
            Write-ColorOutput "鉂?鎵ц澶辫触 (閫€鍑虹爜: $($process.ExitCode))" $Global:Config.Colors.Error "EXEC"
            return $false
        }
    } catch {
        Write-ColorOutput "鉂?鎵ц寮傚父: $($_.Exception.Message)" $Global:Config.Colors.Error "EXEC"
        return $false
    }
}

# ============================================================================
# 鏍稿績鍔熻兘鍑芥暟
# ============================================================================

function Start-Services {
    Write-Banner "鍚姩鏈嶅姟 ($Mode 妯″紡)"
    
    # 妫€鏌ラ」鐩粨鏋?
    if (!(Test-ProjectStructure)) {
        Write-ColorOutput "鉂?椤圭洰缁撴瀯妫€鏌ュけ璐? $Global:Config.Colors.Error "START"
        return $false
    }
    
    # 娓呯悊绔彛
    Write-ColorOutput "馃Ч 娓呯悊绔彛鍐茬獊..." $Global:Config.Colors.Info "CLEANUP"
    Stop-ProcessByPort $Global:Config.FrontendPort
    Stop-ProcessByPort $Global:Config.BackendPort
    
    # 瀹夎渚濊禆
    if (!$SkipDeps) {
        Install-Dependencies
    }
    
    # 鏍规嵁鐩爣鍚姩涓嶅悓鏈嶅姟
    switch ($Target) {
        "frontend" {
            Start-Frontend
        }
        "backend" {
            Start-Backend
        }
        "all" {
            Start-AllServices
        }
    }
}

function Start-AllServices {
    Write-ColorOutput "馃殌 鍚姩鍏ㄦ爤鏈嶅姟 (鍓嶇:$($Global:Config.FrontendPort), 鍚庣:$($Global:Config.BackendPort))" $Global:Config.Colors.Primary "START"
    
    if ($Mode -eq "dev") {
        # 寮€鍙戞ā寮忥細浣跨敤 concurrently 鍚屾椂鍚姩
        $command = "npx concurrently --names `"馃帹鍓嶇,鈿欙笍鍚庣`" --prefix-colors `"blue,green`" --kill-others-on-fail --restart-tries 2 `"cd frontend && npm start`" `"cd backend && npm run dev`""
        
        Write-ColorOutput "馃摫 鍓嶇寮€鍙戞湇鍔″櫒: http://localhost:$($Global:Config.FrontendPort)" $Global:Config.Colors.Info "INFO"
        Write-ColorOutput "馃敡 鍚庣API鏈嶅姟鍣? http://localhost:$($Global:Config.BackendPort)" $Global:Config.Colors.Info "INFO"
        Write-ColorOutput "馃挕 鎸?Ctrl+C 鍋滄鎵€鏈夋湇鍔? $Global:Config.Colors.Warning "INFO"
        
        Invoke-Expression $command
    } else {
        # 鐢熶骇妯″紡锛氬厛鏋勫缓鍐嶅惎鍔?
        Build-Project
        
        # 鍚姩鍚庣鏈嶅姟锛堝悗鍙帮級
        Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd backend; npm start" -WindowStyle Hidden
        
        # 鍚姩鍓嶇鏈嶅姟
        Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd frontend; npx serve -s build -l $($Global:Config.FrontendPort)" -WindowStyle Hidden
        
        Write-ColorOutput "鉁?鐢熶骇鐜鏈嶅姟宸插惎鍔? $Global:Config.Colors.Success "START"
    }
}

function Start-Frontend {
    Write-ColorOutput "馃帹 鍚姩鍓嶇鏈嶅姟 (绔彛: $($Global:Config.FrontendPort))" $Global:Config.Colors.Primary "FRONTEND"
    
    if ($Mode -eq "dev") {
        Set-Location "frontend"
        npm start
        Set-Location ".."
    } else {
        Invoke-Command-Safely "npm run build" "frontend" "鏋勫缓鍓嶇椤圭洰"
        Invoke-Command-Safely "npx serve -s build -l $($Global:Config.FrontendPort)" "frontend" "鍚姩鍓嶇鏈嶅姟鍣?
    }
}

function Start-Backend {
    Write-ColorOutput "鈿欙笍 鍚姩鍚庣鏈嶅姟 (绔彛: $($Global:Config.BackendPort))" $Global:Config.Colors.Primary "BACKEND"
    
    Set-Location "backend"
    if ($Mode -eq "dev") {
        npm run dev
    } else {
        Invoke-Command-Safely "npm run build" "." "鏋勫缓鍚庣椤圭洰"
        npm start
    }
    Set-Location ".."
}

function Stop-Services {
    Write-Banner "鍋滄鎵€鏈夋湇鍔?
    
    Write-ColorOutput "馃洃 鍋滄Node.js杩涚▼..." $Global:Config.Colors.Warning "STOP"
    Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-ColorOutput "馃洃 娓呯悊绔彛鍗犵敤..." $Global:Config.Colors.Warning "STOP"
    Stop-ProcessByPort $Global:Config.FrontendPort
    Stop-ProcessByPort $Global:Config.BackendPort
    
    Write-ColorOutput "鉁?鎵€鏈夋湇鍔″凡鍋滄" $Global:Config.Colors.Success "STOP"
}

function Install-Dependencies {
    Write-Banner "瀹夎椤圭洰渚濊禆"
    
    $success = $true
    
    # 鏍圭洰褰曚緷璧?
    Write-ColorOutput "馃摝 瀹夎鏍圭洰褰曚緷璧?.." $Global:Config.Colors.Info "INSTALL"
    if (!(Invoke-Command-Safely "npm install" "." "瀹夎鏍圭洰褰曚緷璧?)) {
        $success = $false
    }
    
    # 鍓嶇渚濊禆
    Write-ColorOutput "馃帹 瀹夎鍓嶇渚濊禆..." $Global:Config.Colors.Info "INSTALL"
    if (!(Invoke-Command-Safely "npm install" "frontend" "瀹夎鍓嶇渚濊禆")) {
        $success = $false
    }
    
    # 鍚庣渚濊禆
    Write-ColorOutput "鈿欙笍 瀹夎鍚庣渚濊禆..." $Global:Config.Colors.Info "INSTALL"
    if (!(Invoke-Command-Safely "npm install" "backend" "瀹夎鍚庣渚濊禆")) {
        $success = $false
    }
    
    if ($success) {
        Write-ColorOutput "鉁?鎵€鏈変緷璧栧畨瑁呭畬鎴? $Global:Config.Colors.Success "INSTALL"
    } else {
        Write-ColorOutput "鉂?閮ㄥ垎渚濊禆瀹夎澶辫触" $Global:Config.Colors.Error "INSTALL"
    }
    
    return $success
}

function Build-Project {
    Write-Banner "鏋勫缓椤圭洰"
    
    $success = $true
    
    # 鏋勫缓鍓嶇
    Write-ColorOutput "馃帹 鏋勫缓鍓嶇椤圭洰..." $Global:Config.Colors.Info "BUILD"
    if (!(Invoke-Command-Safely "npm run build" "frontend" "鏋勫缓鍓嶇椤圭洰")) {
        $success = $false
    }
    
    # 鏋勫缓鍚庣
    Write-ColorOutput "鈿欙笍 鏋勫缓鍚庣椤圭洰..." $Global:Config.Colors.Info "BUILD"
    if (!(Invoke-Command-Safely "npm run build" "backend" "鏋勫缓鍚庣椤圭洰")) {
        $success = $false
    }
    
    if ($success) {
        Write-ColorOutput "鉁?椤圭洰鏋勫缓瀹屾垚" $Global:Config.Colors.Success "BUILD"
    } else {
        Write-ColorOutput "鉂?椤圭洰鏋勫缓澶辫触" $Global:Config.Colors.Error "BUILD"
    }
    
    return $success
}

function Test-System {
    Write-Banner "绯荤粺鍋ュ悍妫€鏌?
    
    # 妫€鏌ode.js
    Write-ColorOutput "馃攳 妫€鏌ode.js..." $Global:Config.Colors.Info "TEST"
    try {
        $nodeVersion = node --version 2>&1
        Write-ColorOutput "鉁?Node.js鐗堟湰: $nodeVersion" $Global:Config.Colors.Success "TEST"
    } catch {
        Write-ColorOutput "鉂?Node.js鏈畨瑁呮垨涓嶅彲鐢? $Global:Config.Colors.Error "TEST"
        return $false
    }
    
    # 妫€鏌pm
    Write-ColorOutput "馃攳 妫€鏌pm..." $Global:Config.Colors.Info "TEST"
    try {
        $npmVersion = npm --version 2>&1
        Write-ColorOutput "鉁?npm鐗堟湰: $npmVersion" $Global:Config.Colors.Success "TEST"
    } catch {
        Write-ColorOutput "鉂?npm鏈畨瑁呮垨涓嶅彲鐢? $Global:Config.Colors.Error "TEST"
        return $false
    }
    
    # 妫€鏌ョ鍙ｅ彲鐢ㄦ€?
    Write-ColorOutput "馃攳 妫€鏌ョ鍙ｅ彲鐢ㄦ€?.." $Global:Config.Colors.Info "TEST"
    if (Test-Port $Global:Config.FrontendPort) {
        Write-ColorOutput "鉁?鍓嶇绔彛 $($Global:Config.FrontendPort) 鍙敤" $Global:Config.Colors.Success "TEST"
    } else {
        Write-ColorOutput "鈿狅笍 鍓嶇绔彛 $($Global:Config.FrontendPort) 琚崰鐢? $Global:Config.Colors.Warning "TEST"
    }
    
    if (Test-Port $Global:Config.BackendPort) {
        Write-ColorOutput "鉁?鍚庣绔彛 $($Global:Config.BackendPort) 鍙敤" $Global:Config.Colors.Success "TEST"
    } else {
        Write-ColorOutput "鈿狅笍 鍚庣绔彛 $($Global:Config.BackendPort) 琚崰鐢? $Global:Config.Colors.Warning "TEST"
    }
    
    # 杩愯AI鏈嶅姟娴嬭瘯
    if (Test-Path "test-ai-complete.js") {
        Write-ColorOutput "馃 杩愯AI鏈嶅姟娴嬭瘯..." $Global:Config.Colors.Info "TEST"
        try {
            node test-ai-complete.js
        } catch {
            Write-ColorOutput "鈿狅笍 AI鏈嶅姟娴嬭瘯鎵ц寮傚父" $Global:Config.Colors.Warning "TEST"
        }
    }
    
    return $true
}

function Clean-Project {
    Write-Banner "娓呯悊椤圭洰"
    
    Write-ColorOutput "馃Ч 娓呯悊Node.js杩涚▼..." $Global:Config.Colors.Warning "CLEAN"
    Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-ColorOutput "馃Ч 娓呯悊node_modules..." $Global:Config.Colors.Warning "CLEAN"
    $nodeModules = @("node_modules", "frontend/node_modules", "backend/node_modules")
    foreach ($dir in $nodeModules) {
        if (Test-Path $dir) {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-ColorOutput "鉁?宸叉竻鐞? $dir" $Global:Config.Colors.Success "CLEAN"
        }
    }
    
    Write-ColorOutput "馃Ч 娓呯悊鏋勫缓浜х墿..." $Global:Config.Colors.Warning "CLEAN"
    $buildDirs = @("frontend/build", "backend/dist")
    foreach ($dir in $buildDirs) {
        if (Test-Path $dir) {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-ColorOutput "鉁?宸叉竻鐞? $dir" $Global:Config.Colors.Success "CLEAN"
        }
    }
    
    Write-ColorOutput "鉁?椤圭洰娓呯悊瀹屾垚" $Global:Config.Colors.Success "CLEAN"
}

function Show-Help {
    Write-Banner "$($Global:Config.ProjectName) v$($Global:Config.Version)"
    
    Write-ColorOutput "浣跨敤鏂规硶: .\project-manager.ps1 <鍔ㄤ綔> [閫夐」]" $Global:Config.Colors.Info
    Write-ColorOutput ""
    
    Write-ColorOutput "鍙敤鍔ㄤ綔:" $Global:Config.Colors.Primary
    Write-ColorOutput "  start    鍚姩鏈嶅姟 (榛樿: 寮€鍙戞ā寮忓叏鏍?" $Global:Config.Colors.Info
    Write-ColorOutput "  stop     鍋滄鎵€鏈夋湇鍔? $Global:Config.Colors.Info
    Write-ColorOutput "  test     杩愯绯荤粺鍋ュ悍妫€鏌ュ拰AI娴嬭瘯" $Global:Config.Colors.Info
    Write-ColorOutput "  install  瀹夎鎵€鏈変緷璧? $Global:Config.Colors.Info
    Write-ColorOutput "  build    鏋勫缓椤圭洰" $Global:Config.Colors.Info
    Write-ColorOutput "  clean    娓呯悊椤圭洰 (鍒犻櫎node_modules鍜屾瀯寤轰骇鐗?" $Global:Config.Colors.Info
    Write-ColorOutput "  health   蹇€熷仴搴锋鏌? $Global:Config.Colors.Info
    Write-ColorOutput "  setup    鍒濆鍖栭」鐩幆澧? $Global:Config.Colors.Info
    Write-ColorOutput "  help     鏄剧ず姝ゅ府鍔╀俊鎭? $Global:Config.Colors.Info
    Write-ColorOutput ""
    
    Write-ColorOutput "妯″紡閫夐」 (-Mode):" $Global:Config.Colors.Primary
    Write-ColorOutput "  dev      寮€鍙戞ā寮?(榛樿)" $Global:Config.Colors.Info
    Write-ColorOutput "  prod     鐢熶骇妯″紡" $Global:Config.Colors.Info
    Write-ColorOutput "  test     娴嬭瘯妯″紡" $Global:Config.Colors.Info
    Write-ColorOutput ""
    
    Write-ColorOutput "鐩爣閫夐」 (-Target):" $Global:Config.Colors.Primary
    Write-ColorOutput "  all      鍓嶇+鍚庣 (榛樿)" $Global:Config.Colors.Info
    Write-ColorOutput "  frontend 浠呭墠绔? $Global:Config.Colors.Info
    Write-ColorOutput "  backend  浠呭悗绔? $Global:Config.Colors.Info
    Write-ColorOutput ""
    
    Write-ColorOutput "鍏朵粬閫夐」:" $Global:Config.Colors.Primary
    Write-ColorOutput "  -Force     寮哄埗鎵ц鎿嶄綔" $Global:Config.Colors.Info
    Write-ColorOutput "  -Verbose   鏄剧ず璇︾粏杈撳嚭" $Global:Config.Colors.Info
    Write-ColorOutput "  -SkipDeps  璺宠繃渚濊禆瀹夎" $Global:Config.Colors.Info
    Write-ColorOutput ""
    
    Write-ColorOutput "绀轰緥:" $Global:Config.Colors.Primary
    Write-ColorOutput "  .\project-manager.ps1 start                    # 寮€鍙戞ā寮忓惎鍔ㄥ叏鏍? $Global:Config.Colors.Debug
    Write-ColorOutput "  .\project-manager.ps1 start -Mode prod         # 鐢熶骇妯″紡鍚姩" $Global:Config.Colors.Debug
    Write-ColorOutput "  .\project-manager.ps1 start -Target frontend   # 浠呭惎鍔ㄥ墠绔? $Global:Config.Colors.Debug
    Write-ColorOutput "  .\project-manager.ps1 test                     # 杩愯绯荤粺娴嬭瘯" $Global:Config.Colors.Debug
    Write-ColorOutput "  .\project-manager.ps1 clean                    # 娓呯悊椤圭洰" $Global:Config.Colors.Debug
}

# ============================================================================
# 涓诲嚱鏁?
# ============================================================================

function Main {
    # 璁剧疆閿欒澶勭悊
    $ErrorActionPreference = "Stop"
    
    # 纭繚鍦ㄩ」鐩牴鐩綍
    if (!(Test-ProjectStructure)) {
        Write-ColorOutput "鉂?璇峰湪椤圭洰鏍圭洰褰曟墽琛屾鑴氭湰" $Global:Config.Colors.Error "ERROR"
        Write-ColorOutput "   椤圭洰鏍圭洰褰曞簲鍖呭惈: package.json, frontend/, backend/" $Global:Config.Colors.Warning "ERROR"
        return 1
    }
    
    # 鎵ц鐩稿簲鍔ㄤ綔
    switch ($Action.ToLower()) {
        "start" {
            Start-Services
        }
        "stop" {
            Stop-Services
        }
        "test" {
            Test-System
        }
        "install" {
            Install-Dependencies
        }
        "build" {
            Build-Project
        }
        "clean" {
            Clean-Project
        }
        "health" {
            Test-System
        }
        "setup" {
            Install-Dependencies
            Test-System
        }
        "help" {
            Show-Help
        }
        default {
            Show-Help
            return 1
        }
    }
    
    return 0
}

# 鎵ц涓诲嚱鏁?
try {
    $result = Main
    exit $result
} catch {
    Write-ColorOutput "鉂?鑴氭湰鎵ц寮傚父: $($_.Exception.Message)" $Global:Config.Colors.Error "ERROR"
    if ($Verbose) {
        Write-ColorOutput $_.ScriptStackTrace $Global:Config.Colors.Debug "DEBUG"
    }
    exit 1
}

