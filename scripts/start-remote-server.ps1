# AICAM杩滅▼鏈嶅姟鍣ㄥ惎鍔ㄥ伐鍏?
# 璁剧疆鎺у埗鍙拌緭鍑虹紪鐮佷负UTF-8
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM杩滅▼鏈嶅姟鍣ㄥ惎鍔ㄥ伐鍏?                 " -ForegroundColor Cyan
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
            Write-Host "  .\start-remote-server.ps1 [閫夐」]"
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
    $sshCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost -o ConnectTimeout=5 `"echo '杩炴帴鎴愬姛'; exit`""
    $sshResult = Invoke-Expression $sshCommand
    
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

# 妫€鏌ュ惎鍔ㄨ剼鏈槸鍚﹀瓨鍦?
Write-Host "姝ラ2: 妫€鏌ュ惎鍔ㄨ剼鏈?.." -ForegroundColor Yellow
try {
    $scriptCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"if [ -f '$RemotePath/scripts/linux-server-start.sh' ]; then echo 'exists'; else echo 'not_exists'; fi`""
    $scriptCheckResult = Invoke-Expression $scriptCheckCommand
    
    if ($scriptCheckResult -eq "exists") {
        Write-Host "鉁?鍚姩鑴氭湰瀛樺湪" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍚姩鑴氭湰涓嶅瓨鍦?" -ForegroundColor Red
        Write-Host "  璇峰厛鍚屾鏂囦欢鍒拌繙绋嬫湇鍔″櫒" -ForegroundColor Yellow
        Write-Host "  鍙互浣跨敤: .\scripts\sync-linux-incremental.bat --host $RemoteHost --user $RemoteUser --port $RemotePort --path $RemotePath" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "鉁?鑴氭湰妫€鏌ュ紓甯? $_" -ForegroundColor Red
    exit 1
}

# 璧嬩簣鍚姩鑴氭湰鎵ц鏉冮檺
Write-Host "姝ラ3: 璧嬩簣鍚姩鑴氭湰鎵ц鏉冮檺..." -ForegroundColor Yellow
try {
    $chmodCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"chmod +x $RemotePath/scripts/linux-server-start.sh $RemotePath/scripts/linux-server-stop.sh`""
    Invoke-Expression $chmodCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?宸茶祴浜堟墽琛屾潈闄? -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鏃犳硶璧嬩簣鎵ц鏉冮檺!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "鉁?鏉冮檺璁剧疆寮傚父: $_" -ForegroundColor Red
    exit 1
}

# 鍚姩杩滅▼鏈嶅姟
Write-Host "姝ラ4: 鍚姩杩滅▼鏈嶅姟..." -ForegroundColor Yellow
try {
    Write-Host "  姝ｅ湪鍚姩鏈嶅姟锛岃繖鍙兘闇€瑕佸嚑鍒嗛挓..." -ForegroundColor Gray
    $startCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"cd $RemotePath && ./scripts/linux-server-start.sh`""
    $startResult = Invoke-Expression $startCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?杩滅▼鏈嶅姟鍚姩鎴愬姛" -ForegroundColor Green
        Write-Host $startResult -ForegroundColor Gray
    }
    else {
        Write-Host "鉁?杩滅▼鏈嶅姟鍚姩澶辫触!" -ForegroundColor Red
        Write-Host $startResult -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "鉁?鍚姩鏈嶅姟寮傚父: $_" -ForegroundColor Red
    exit 1
}

# 妫€鏌ユ湇鍔＄姸鎬?
Write-Host "姝ラ5: 妫€鏌ユ湇鍔＄姸鎬?.." -ForegroundColor Yellow
Start-Sleep -Seconds 5  # 绛夊緟鏈嶅姟瀹屽叏鍚姩

try {
    # 妫€鏌ュ墠绔湇鍔?
    $frontendCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s http://localhost:3000 > /dev/null && echo 'running' || echo 'not_running'`""
    $frontendStatus = Invoke-Expression $frontendCheckCommand
    
    if ($frontendStatus -eq "running") {
        Write-Host "鉁?鍓嶇鏈嶅姟杩愯姝ｅ父 (http://$RemoteHost:3000)" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍓嶇鏈嶅姟鏈繍琛? -ForegroundColor Red
    }
    
    # 妫€鏌ュ悗绔湇鍔?
    $backendCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s http://localhost:3002/health > /dev/null && echo 'running' || echo 'not_running'`""
    $backendStatus = Invoke-Expression $backendCheckCommand
    
    if ($backendStatus -eq "running") {
        Write-Host "鉁?鍚庣鏈嶅姟杩愯姝ｅ父 (http://$RemoteHost:3002)" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鍚庣鏈嶅姟鏈繍琛? -ForegroundColor Red
    }
    
    # 妫€鏌I鏈嶅姟
    $aiCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"curl -s http://localhost:5000/health > /dev/null && echo 'running' || echo 'not_running'`""
    $aiStatus = Invoke-Expression $aiCheckCommand
    
    if ($aiStatus -eq "running") {
        Write-Host "鉁?AI鏈嶅姟杩愯姝ｅ父 (http://$RemoteHost:5000)" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?AI鏈嶅姟鏈繍琛? -ForegroundColor Red
    }
}
catch {
    Write-Host "鉁?鏈嶅姟鐘舵€佹鏌ュ紓甯? $_" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "        杩滅▼鏈嶅姟鍚姩瀹屾垚!                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "鏈嶅姟璁块棶鍦板潃:"
Write-Host "  鍓嶇: http://$RemoteHost:3000" -ForegroundColor Green
Write-Host "  鍚庣: http://$RemoteHost:3002" -ForegroundColor Green
Write-Host "  AI鏈嶅姟: http://$RemoteHost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "瑕佸仠姝㈣繙绋嬫湇鍔★紝璇疯繍琛?"
Write-Host "  .\stop-remote-server.ps1 --host $RemoteHost --user $RemoteUser --port $RemotePort" -ForegroundColor Yellow

