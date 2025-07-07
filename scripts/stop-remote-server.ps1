# AICAM杩滅▼鏈嶅姟鍣ㄥ仠姝㈠伐鍏?
# 璁剧疆鎺у埗鍙拌緭鍑虹紪鐮佷负UTF-8
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM杩滅▼鏈嶅姟鍣ㄥ仠姝㈠伐鍏?                 " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 榛樿璁剧疆
$RemoteHost = "192.168.1.100"
$RemoteUser = "aicam"
$RemotePort = 22
$RemotePath = "/home/aicam/aicam-platform"

# 瑙ｆ瀽鍛戒护琛屽弬鏁?
for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "--host" { 
            $RemoteHost = $args[$i+1]
            $i++
        }
        "--user" { 
            $RemoteUser = $args[$i+1]
            $i++
        }
        "--port" { 
            $RemotePort = $args[$i+1]
            $i++
        }
        "--path" { 
            $RemotePath = $args[$i+1]
            $i++
        }
        "--help" { 
            Write-Host "鐢ㄦ硶:"
            Write-Host "  .\stop-remote-server.ps1 [閫夐」]"
            Write-Host ""
            Write-Host "閫夐」:"
            Write-Host "  --host HOST        杩滅▼涓绘満鍦板潃 (榛樿: 192.168.1.100)"
            Write-Host "  --user USER        杩滅▼鐢ㄦ埛鍚?(榛樿: aicam)"
            Write-Host "  --port PORT        SSH绔彛 (榛樿: 22)"
            Write-Host "  --path PATH        杩滅▼AICAM鐩綍 (榛樿: /home/aicam/aicam-platform)"
            Write-Host "  --help             鏄剧ず姝ゅ府鍔╀俊鎭?
            exit
        }
    }
}

Write-Host "杩滅▼鏈嶅姟鍣ㄩ厤缃?" -ForegroundColor Yellow
Write-Host "  杩滅▼涓绘満: $RemoteUser@$RemoteHost`:$RemotePort" -ForegroundColor Gray
Write-Host "  杩滅▼璺緞: $RemotePath" -ForegroundColor Gray
Write-Host ""

# 妫€鏌SH鏄惁瀹夎
try {
    $null = Get-Command ssh -ErrorAction Stop
    Write-Host "鉁?SSH瀹㈡埛绔凡瀹夎" -ForegroundColor Green
}
catch {
    Write-Host "鉁?SSH瀹㈡埛绔湭瀹夎!" -ForegroundColor Red
    Write-Host "璇峰畨瑁匫penSSH瀹㈡埛绔悗鍐嶈瘯" -ForegroundColor Red
    exit 1
}

# 娴嬭瘯SSH杩炴帴
Write-Host "姝ラ1: 娴嬭瘯SSH杩炴帴..." -ForegroundColor Yellow
try {
    $sshTestResult = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost -o ConnectTimeout=5 `"echo '杩炴帴鎴愬姛'; exit`""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?SSH杩炴帴鎴愬姛" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?SSH杩炴帴澶辫触!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "鉁?SSH杩炴帴寮傚父: $_" -ForegroundColor Red
    exit 1
}

# 妫€鏌ュ仠姝㈣剼鏈槸鍚﹀瓨鍦?
Write-Host "姝ラ2: 妫€鏌ュ仠姝㈣剼鏈?.." -ForegroundColor Yellow
try {
    $scriptCheckResult = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"if [ -f '$RemotePath/scripts/linux-server-stop.sh' ]; then echo 'exists'; else echo 'not_exists'; fi`""
    
    if ($scriptCheckResult -eq "exists") {
        Write-Host "鉁?鍋滄鑴氭湰瀛樺湪" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍋滄鑴氭湰涓嶅瓨鍦?" -ForegroundColor Red
        Write-Host "  灏濊瘯浣跨敤閫氱敤鍋滄鏂规硶..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "鉁?鑴氭湰妫€鏌ュ紓甯? $_" -ForegroundColor Red
    Write-Host "  灏濊瘯浣跨敤閫氱敤鍋滄鏂规硶..." -ForegroundColor Yellow
    $scriptCheckResult = "not_exists"
}

# 鍋滄杩滅▼鏈嶅姟
Write-Host "姝ラ3: 鍋滄杩滅▼鏈嶅姟..." -ForegroundColor Yellow
try {
    if ($scriptCheckResult -eq "exists") {
        # 浣跨敤鍋滄鑴氭湰
        Write-Host "  浣跨敤鍋滄鑴氭湰鍋滄鏈嶅姟..." -ForegroundColor Gray
        $stopResult = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"cd $RemotePath && chmod +x scripts/linux-server-stop.sh && ./scripts/linux-server-stop.sh`""
        Write-Host $stopResult -ForegroundColor Gray
    }
    else {
        # 浣跨敤閫氱敤鏂规硶鍋滄鏈嶅姟
        Write-Host "  浣跨敤閫氱敤鏂规硶鍋滄鏈嶅姟..." -ForegroundColor Gray
        
        # 鍋滄鍓嶇杩涚▼
        Write-Host "  鍋滄鍓嶇杩涚▼..." -ForegroundColor Gray
        Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"pkill -f 'npm run serve' || true`""
        
        # 鍋滄鍚庣杩涚▼
        Write-Host "  鍋滄鍚庣杩涚▼..." -ForegroundColor Gray
        Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"pkill -f 'npm run start:prod' || true`""
        
        # 鍋滄AI鏈嶅姟杩涚▼
        Write-Host "  鍋滄AI鏈嶅姟杩涚▼..." -ForegroundColor Gray
        Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"pkill -f 'python3 main.py' || true`""
        
        # 纭繚鎵€鏈塏ode.js杩涚▼閮藉凡鍋滄
        Write-Host "  纭繚鎵€鏈塏ode.js杩涚▼宸插仠姝?.." -ForegroundColor Gray
        Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"pkill -f node || true`""
    }
    
    Write-Host "鉁?杩滅▼鏈嶅姟宸插仠姝? -ForegroundColor Green
}
catch {
    Write-Host "鉁?鍋滄鏈嶅姟寮傚父: $_" -ForegroundColor Red
    exit 1
}

# 楠岃瘉鏈嶅姟鏄惁宸插仠姝?
Write-Host "姝ラ4: 楠岃瘉鏈嶅姟鐘舵€?.." -ForegroundColor Yellow
Start-Sleep -Seconds 2  # 绛夊緟鏈嶅姟瀹屽叏鍋滄

try {
    # 妫€鏌ュ墠绔湇鍔?
    $frontendStatus = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s -m 1 http://localhost:3000 > /dev/null 2>&1 && echo 'running' || echo 'not_running'`""
    
    if ($frontendStatus -eq "not_running") {
        Write-Host "鉁?鍓嶇鏈嶅姟宸插仠姝? -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍓嶇鏈嶅姟浠嶅湪杩愯" -ForegroundColor Red
    }
    
    # 妫€鏌ュ悗绔湇鍔?
    $backendStatus = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s -m 1 http://localhost:3002/health > /dev/null 2>&1 && echo 'running' || echo 'not_running'`""
    
    if ($backendStatus -eq "not_running") {
        Write-Host "鉁?鍚庣鏈嶅姟宸插仠姝? -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍚庣鏈嶅姟浠嶅湪杩愯" -ForegroundColor Red
    }
    
    # 妫€鏌I鏈嶅姟
    $aiStatus = Invoke-Expression "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s -m 1 http://localhost:5000/health > /dev/null 2>&1 && echo 'running' || echo 'not_running'`""
    
    if ($aiStatus -eq "not_running") {
        Write-Host "鉁?AI鏈嶅姟宸插仠姝? -ForegroundColor Green
    }
    else {
        Write-Host "鉁?AI鏈嶅姟浠嶅湪杩愯" -ForegroundColor Red
    }
}
catch {
    Write-Host "鉁?鏈嶅姟鐘舵€佹鏌ュ紓甯? $_" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "        杩滅▼鏈嶅姟鍋滄瀹屾垚!                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "瑕侀噸鏂板惎鍔ㄨ繙绋嬫湇鍔★紝璇疯繍琛?"
Write-Host "  .\start-remote-server.ps1 --host $RemoteHost --user $RemoteUser --port $RemotePort" -ForegroundColor Yellow

