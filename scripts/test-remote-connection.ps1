# AICAM杩滅▼鏈嶅姟鍣ㄨ繛鎺ユ祴璇曞伐鍏?
# 璁剧疆鎺у埗鍙拌緭鍑虹紪鐮佷负UTF-8
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM杩滅▼鏈嶅姟鍣ㄨ繛鎺ユ祴璇?                 " -ForegroundColor Cyan
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
            Write-Host "  .\test-remote-connection.ps1 [閫夐」]"
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

Write-Host "杩炴帴閰嶇疆:" -ForegroundColor Yellow
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

# 娴嬭瘯缃戠粶杩炴帴
Write-Host "`n姝ラ1: 娴嬭瘯缃戠粶杩炴帴..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $RemoteHost -Count 2 -Quiet
if ($pingResult) {
    Write-Host "鉁?涓绘満 $RemoteHost 鍙互ping閫? -ForegroundColor Green
}
else {
    Write-Host "鉁?鏃犳硶ping閫氫富鏈?$RemoteHost!" -ForegroundColor Red
    Write-Host "  璇锋鏌ョ綉缁滆繛鎺ユ垨闃茬伀澧欒缃? -ForegroundColor Red
    # 鍗充娇ping涓嶉€氾紝浠嶅皾璇昐SH杩炴帴锛屽洜涓烘湁浜涙湇鍔″櫒鍙兘绂佺敤浜咺CMP
}

# 娴嬭瘯SSH杩炴帴
Write-Host "`n姝ラ2: 娴嬭瘯SSH杩炴帴..." -ForegroundColor Yellow
Write-Host "灏濊瘯閫氳繃SSH杩炴帴鍒拌繙绋嬫湇鍔″櫒..." -ForegroundColor Gray

try {
    $sshCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost -o ConnectTimeout=5 `"echo '杩炴帴鎴愬姛'; uname -a; exit`""
    $sshResult = Invoke-Expression $sshCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?SSH杩炴帴鎴愬姛" -ForegroundColor Green
        Write-Host $sshResult -ForegroundColor Gray
    }
    else {
        Write-Host "鉁?SSH杩炴帴澶辫触!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "鉁?SSH杩炴帴寮傚父: $_" -ForegroundColor Red
    Write-Host "鍙兘鐨勯棶棰?" -ForegroundColor Yellow
    Write-Host "  1. SSH鏈嶅姟鏈湪杩滅▼涓绘満涓婅繍琛? -ForegroundColor Yellow
    Write-Host "  2. 鐢ㄦ埛鍚嶆垨瀵嗙爜涓嶆纭? -ForegroundColor Yellow
    Write-Host "  3. 闃茬伀澧欓樆姝簡SSH杩炴帴" -ForegroundColor Yellow
    Write-Host "  4. 涓绘満鍚嶈В鏋愰棶棰? -ForegroundColor Yellow
    exit 1
}

# 妫€鏌ICAM瀹夎鐩綍
Write-Host "`n姝ラ3: 妫€鏌ICAM瀹夎鐩綍..." -ForegroundColor Yellow
try {
    $dirCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"if [ -d '$RemotePath' ]; then echo 'AICAM鐩綍瀛樺湪'; else echo 'AICAM鐩綍涓嶅瓨鍦?; fi`""
    $dirCheckResult = Invoke-Expression $dirCheckCommand
    
    if ($dirCheckResult -match "瀛樺湪") {
        Write-Host "鉁?$dirCheckResult" -ForegroundColor Green
        
        # 妫€鏌ュ叧閿枃浠?
        $fileCheckCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"if [ -f '$RemotePath/scripts/linux-server-start.sh' ]; then echo '鍚姩鑴氭湰瀛樺湪'; else echo '鍚姩鑴氭湰涓嶅瓨鍦?; fi`""
        $fileCheckResult = Invoke-Expression $fileCheckCommand
        
        if ($fileCheckResult -match "瀛樺湪") {
            Write-Host "鉁?$fileCheckResult" -ForegroundColor Green
            Write-Host "鉁?杩滅▼鏈嶅姟鍣ㄩ厤缃畬鏁达紝鍙互鍚姩鏈嶅姟" -ForegroundColor Green
        }
        else {
            Write-Host "鉁?$fileCheckResult" -ForegroundColor Red
            Write-Host "  闇€瑕佸厛鍚屾鏂囦欢鍒拌繙绋嬫湇鍔″櫒" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "鉁?$dirCheckResult" -ForegroundColor Red
        Write-Host "  闇€瑕佸厛鍒涘缓鐩綍骞跺悓姝ユ枃浠跺埌杩滅▼鏈嶅姟鍣? -ForegroundColor Yellow
    }
}
catch {
    Write-Host "鉁?鐩綍妫€鏌ュ紓甯? $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "        杩炴帴娴嬭瘯瀹屾垚!                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

