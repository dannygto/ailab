# AICAM杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩閰嶇疆宸ュ叿
# 璁剧疆鎺у埗鍙拌緭鍑虹紪鐮佷负UTF-8
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     AICAM杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩閰嶇疆宸ュ叿                " -ForegroundColor Cyan
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
            Write-Host "  .\setup-remote-autostart.ps1 [閫夐」]"
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

# 澶嶅埗鑷惎鍔ㄨ剼鏈埌杩滅▼鏈嶅姟鍣?
Write-Host "姝ラ2: 澶嶅埗鑷惎鍔ㄨ剼鏈埌杩滅▼鏈嶅姟鍣?.." -ForegroundColor Yellow
try {
    $scriptPath = "$PSScriptRoot\setup-linux-autostart.sh"
    if (-not (Test-Path $scriptPath)) {
        Write-Host "鉁?鑷惎鍔ㄨ剼鏈笉瀛樺湪: $scriptPath" -ForegroundColor Red
        exit 1
    }
    
    $scpCommand = "scp -P $RemotePort `"$scriptPath`" $RemoteUser@$RemoteHost`:$RemotePath/scripts/"
    Invoke-Expression $scpCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?鑷惎鍔ㄨ剼鏈凡澶嶅埗鍒拌繙绋嬫湇鍔″櫒" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?澶嶅埗鑷惎鍔ㄨ剼鏈け璐?" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "鉁?澶嶅埗鑴氭湰寮傚父: $_" -ForegroundColor Red
    exit 1
}

# 璁剧疆鑴氭湰鏉冮檺骞舵墽琛?
Write-Host "姝ラ3: 璁剧疆鑴氭湰鏉冮檺骞舵墽琛?.." -ForegroundColor Yellow
try {
    $executeCommand = "ssh -p $RemotePort $RemoteUser@$RemoteHost `"chmod +x $RemotePath/scripts/setup-linux-autostart.sh && sudo $RemotePath/scripts/setup-linux-autostart.sh`""
    Write-Host "姝ｅ湪鎵ц杩滅▼鍛戒护锛岃繖鍙兘闇€瑕佽緭鍏ュ瘑鐮?.." -ForegroundColor Yellow
    Invoke-Expression $executeCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "鉁?鑷惎鍔ㄩ厤缃剼鏈凡鎴愬姛鎵ц" -ForegroundColor Green
    }
    else {
        Write-Host "鉁?鎵ц鑷惎鍔ㄩ厤缃剼鏈け璐?" -ForegroundColor Red
        Write-Host "  鍙兘闇€瑕佹墜鍔ㄦ墽琛屼互涓嬪懡浠?" -ForegroundColor Yellow
        Write-Host "  ssh -p $RemotePort $RemoteUser@$RemoteHost" -ForegroundColor Yellow
        Write-Host "  sudo $RemotePath/scripts/setup-linux-autostart.sh" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "鉁?鎵ц鑴氭湰寮傚父: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "     杩滅▼鏈嶅姟鍣ㄨ嚜鍚姩閰嶇疆瀹屾垚!                     " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "宸插畬鎴愪互涓嬮厤缃?" -ForegroundColor Green
Write-Host "  1. 鍒涘缓浜唖ystemd鏈嶅姟鏂囦欢" -ForegroundColor Green
Write-Host "  2. 璁剧疆浜咥ICAM鏈嶅姟寮€鏈鸿嚜鍚姩" -ForegroundColor Green
Write-Host "  3. 閰嶇疆浜嗗繀瑕佺殑闃茬伀澧欒鍒? -ForegroundColor Green
Write-Host "  4. 鍚姩浜咥ICAM鏈嶅姟" -ForegroundColor Green
Write-Host ""
Write-Host "闇€瑕佸紑鏀剧殑绔彛:" -ForegroundColor Yellow
Write-Host "  - 22: SSH杩炴帴" -ForegroundColor Yellow
Write-Host "  - 3000: 鍓嶇鏈嶅姟" -ForegroundColor Yellow
Write-Host "  - 3002: 鍚庣鏈嶅姟" -ForegroundColor Yellow
Write-Host "  - 5000: AI鏈嶅姟" -ForegroundColor Yellow
Write-Host ""
Write-Host "娉ㄦ剰: 濡傛灉浣跨敤浜戞湇鍔″櫒锛岃纭繚鍦ㄤ簯鏈嶅姟鍟嗘帶鍒跺彴鐨勫畨鍏ㄧ粍/闃茬伀澧欎腑宸插紑鏀句互涓婄鍙? -ForegroundColor Red

