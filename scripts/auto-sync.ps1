# 自动同步项目到远程开发机
param(
    [switch]$QuickSync
)

$host.UI.RawUI.WindowTitle = "AICAM V2 项目自动同步工具"
$remoteHost = "82.156.75.232"
$username = "ubuntu"
$password = "Danny486020!!&&"
$localPath = "D:\AICAMV2"
$remotePath = "/home/ubuntu/AICAMV2"

function Show-Banner {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "          AICAM V2 项目自动同步工具                " -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-RemoteConnection {
    Write-Host "正在检测远程连接..." -ForegroundColor Yellow
    $pingResult = Test-Connection -ComputerName $remoteHost -Count 1 -Quiet
    if (-not $pingResult) {
        Write-Host "[错误] 无法连接到远程主机 $remoteHost，请检查网络连接" -ForegroundColor Red
        exit
    }
    Write-Host "[成功] 远程主机连接正常" -ForegroundColor Green
}

function Sync-ProjectCode {
    Write-Host ""
    Write-Host "1. 正在同步项目代码..." -ForegroundColor Yellow
    Write-Host "   - 本地路径: $localPath" -ForegroundColor Gray
    Write-Host "   - 远程路径: $remotePath" -ForegroundColor Gray
    Write-Host ""
    
    # 确保远程目录结构存在
    plink -batch -ssh "$username@$remoteHost" -pw "$password" "mkdir -p $remotePath/{frontend,backend,ai,scripts,项目管理}" | Out-Null
    
    if ($QuickSync) {
        # 快速同步 - 只同步必要的代码文件
        Write-Host "   - 快速同步模式：只同步代码和文档..." -ForegroundColor Yellow
        
        # 同步前端代码
        Write-Host "   - 同步前端代码..." -ForegroundColor Gray
        pscp -batch -r -pw "$password" "$localPath\frontend\src" "$username@$remoteHost`:$remotePath/frontend/"
        pscp -batch -r -pw "$password" "$localPath\frontend\package.json" "$username@$remoteHost`:$remotePath/frontend/"
        
        # 同步后端代码
        Write-Host "   - 同步后端代码..." -ForegroundColor Gray
        pscp -batch -r -pw "$password" "$localPath\backend\src" "$username@$remoteHost`:$remotePath/backend/"
        pscp -batch -r -pw "$password" "$localPath\backend\package.json" "$username@$remoteHost`:$remotePath/backend/"
        
        # 同步AI服务代码
        Write-Host "   - 同步AI服务代码..." -ForegroundColor Gray
        pscp -batch -r -pw "$password" "$localPath\ai\*.py" "$username@$remoteHost`:$remotePath/ai/"
        pscp -batch -r -pw "$password" "$localPath\ai\requirements.txt" "$username@$remoteHost`:$remotePath/ai/"
        
        # 同步项目文档
        Write-Host "   - 同步项目文档..." -ForegroundColor Gray
        pscp -batch -r -pw "$password" "$localPath\项目管理\*.md" "$username@$remoteHost`:$remotePath/项目管理/"
    }
    else {
        # 完整同步 - 同步整个项目，但排除node_modules和缓存文件
        Write-Host "   - 完整同步模式：同步整个项目..." -ForegroundColor Yellow
        
        # 创建排除规则
        $excludeFile = "$env:TEMP\pscp_exclude.txt"
        @(
            "node_modules",
            ".git",
            "build",
            "dist",
            "__pycache__",
            "*.pyc",
            ".vs",
            ".vscode",
            "coverage",
            "tmp"
        ) | Out-File -FilePath $excludeFile -Encoding ASCII
        
        # 同步整个项目，但排除不必要的文件
        $remoteHostPath = "$username@$remoteHost`:$remotePath/"
        pscp -batch -r -pw "$password" -exclude-from $excludeFile "$localPath\*" "$remoteHostPath"
        
        # 清理临时文件
        Remove-Item -Path $excludeFile -Force
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[成功] 项目代码同步完成" -ForegroundColor Green
    } else {
        Write-Host "[警告] 项目同步过程中可能有错误，但已尽量完成同步" -ForegroundColor Yellow
    }
}

function Sync-ProjectStatus {
    Write-Host ""
    Write-Host "2. 正在同步项目状态报告..." -ForegroundColor Yellow
    
    # 创建临时文件，解决中文编码问题
    $tempFile = "$env:TEMP\project-status.md"
    $content = Get-Content -Path "$localPath\项目管理\项目进度报告汇总-新.md" -Raw -Encoding UTF8
    $content | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
    
    # 使用PSCP上传文件
    $remoteStatusPath = "$username@$remoteHost" + ":/home/ubuntu/AICAM-PROJECT-STATUS.md"
    pscp -batch -pw "$password" $tempFile $remoteStatusPath
    
    # 同步其他重要的项目管理文档
    Write-Host "   - 同步测试与验收计划..." -ForegroundColor Gray
    $tempFile = "$env:TEMP\test-plan.md"
    $content = Get-Content -Path "$localPath\项目管理\T1-10-第一阶段测试与验收计划.md" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        $content | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
        $remotePlanPath = "$username@$remoteHost" + ":/home/ubuntu/AICAM-TEST-PLAN.md"
        pscp -batch -pw "$password" $tempFile $remotePlanPath
        Remove-Item -Path $tempFile -Force
    }
    
    # 在远程上转换文件格式
    plink -batch -ssh "$username@$remoteHost" -pw "$password" "dos2unix /home/ubuntu/AICAM-PROJECT-STATUS.md 2>/dev/null || echo 'dos2unix不可用，跳过格式转换'" | Out-Null
    
    # 清理临时文件
    Remove-Item -Path $tempFile -Force
    
    Write-Host "[成功] 项目状态报告同步完成" -ForegroundColor Green
}

function Setup-RemoteEnvironment {
    Write-Host ""
    Write-Host "3. 正在设置远程开发环境..." -ForegroundColor Yellow
    
    # 使用PowerShell命令创建远程执行脚本
    $setupCommands = @"
echo '===== 正在设置AICAM V2开发环境 ====='

# 设置正确的文件权限
echo '设置正确的Linux文件权限...'
find $remotePath -type d -exec chmod 755 {} \;
find $remotePath -type f -exec chmod 644 {} \;

# 确保脚本是可执行的
find $remotePath -name "*.sh" -exec chmod +x {} \;

echo '安装Node.js依赖...'
cd $remotePath
if [ -d './frontend' ]; then
    echo '更新前端依赖...'
    cd ./frontend
    npm install
    cd ..
fi
if [ -d './backend' ]; then
    echo '更新后端依赖...'
    cd ./backend
    npm install
    cd ..
fi
if [ -d './ai' ] && [ -f './ai/requirements.txt' ]; then
    echo '更新AI模块依赖...'
    sudo apt-get update -y
    sudo apt-get install -y python3-pip
    pip3 install -r ./ai/requirements.txt
fi

# 转换任何Windows格式文件到Unix格式
echo '修正文件格式（Windows -> Unix）...'
if command -v dos2unix &> /dev/null; then
    find $remotePath -type f -name "*.sh" -exec dos2unix {} \;
    find $remotePath -type f -name "*.py" -exec dos2unix {} \;
    find $remotePath -type f -name "*.js" -exec dos2unix {} \;
    find $remotePath -type f -name "*.ts" -exec dos2unix {} \;
else
    echo 'dos2unix未安装，正在安装...'
    sudo apt-get update -y
    sudo apt-get install -y dos2unix
    find $remotePath -type f -name "*.sh" -exec dos2unix {} \;
    find $remotePath -type f -name "*.py" -exec dos2unix {} \;
    find $remotePath -type f -name "*.js" -exec dos2unix {} \;
    find $remotePath -type f -name "*.ts" -exec dos2unix {} \;
fi

echo '===== 环境设置完成 ====='
"@
    
    # 使用SSH命令直接执行脚本内容
    $setupCommands | plink -batch -ssh "$username@$remoteHost" -pw "$password" "bash -s"
    
    Write-Host "[成功] 远程环境设置完成" -ForegroundColor Green
}

function Show-Summary {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "               同步完成！                        " -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "您现在可以："
    Write-Host "1. 使用 remote-login.bat 连接到远程Linux开发机" -ForegroundColor Yellow
    Write-Host "2. 在远程Linux机器上运行以下命令：" -ForegroundColor Yellow
    
    if ($QuickSync) {
        Write-Host "   - 查看项目状态: cat /home/ubuntu/AICAM-PROJECT-STATUS.md" -ForegroundColor Gray
        Write-Host "   - 进入前端目录: cd $remotePath/frontend" -ForegroundColor Gray
        Write-Host "   - 进入后端目录: cd $remotePath/backend" -ForegroundColor Gray
    } else {
        Write-Host "   - 启动前端服务: cd $remotePath/frontend && npm start" -ForegroundColor Gray
        Write-Host "   - 启动后端服务: cd $remotePath/backend && npm start" -ForegroundColor Gray
        Write-Host "   - 启动AI服务: cd $remotePath/ai && python3 main.py" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "远程开发Linux环境:" -ForegroundColor Cyan
    Write-Host "   - 项目代码: $remotePath" -ForegroundColor Gray
    Write-Host "   - 项目状态: /home/ubuntu/AICAM-PROJECT-STATUS.md" -ForegroundColor Gray
    Write-Host "   - 测试计划: /home/ubuntu/AICAM-TEST-PLAN.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "同步完成时间: $(Get-Date)" -ForegroundColor Green
    if ($QuickSync) {
        Write-Host "提示: 已执行快速同步。如需完整同步环境，请运行 auto-sync-full.bat" -ForegroundColor Yellow
    }
    Write-Host "开发愉快！" -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan
}

# 主执行流程
Show-Banner
Test-RemoteConnection
Sync-ProjectCode

if ($QuickSync) {
    Sync-ProjectStatus
} else {
    Sync-ProjectStatus
    Setup-RemoteEnvironment
}

Show-Summary

# 记录同步时间
$syncTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"最后同步时间: $syncTime" | Out-File -FilePath "$localPath\scripts\last_sync.txt" -Force
