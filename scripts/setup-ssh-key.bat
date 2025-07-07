@echo off
echo ===================================================
echo        AICAM V2 SSH Key Setup Tool
echo ===================================================

echo 正在为远程开发机 82.156.75.232 设置 SSH 密钥认证...

:: 检查是否已经存在SSH密钥
if not exist "%USERPROFILE%\.ssh\id_rsa" (
    echo 生成新的SSH密钥...
    :: 生成新的SSH密钥（无需密码）
    ssh-keygen -t rsa -b 2048 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
) else (
    echo 已找到现有SSH密钥，将使用现有密钥...
)

:: 将公钥上传到远程服务器
echo 将SSH公钥上传到远程服务器...
:: 使用sshpass临时使用密码
echo 请注意：这是最后一次需要输入密码
ssh ubuntu@82.156.75.232 "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
type "%USERPROFILE%\.ssh\id_rsa.pub" | ssh ubuntu@82.156.75.232 "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

:: 测试SSH密钥认证是否成功
echo 测试SSH密钥认证...
ssh -o BatchMode=yes ubuntu@82.156.75.232 "echo SSH密钥认证成功！"

if %errorlevel% equ 0 (
    echo ===================================================
    echo            SSH 密钥设置成功！
    echo ===================================================
    echo 您现在可以使用无密码登录和同步：
    echo 1. 使用 ssh ubuntu@82.156.75.232 直接登录远程服务器
    echo 2. linux-sync-new.bat 脚本现在可以无需密码同步项目
) else (
    echo [错误] SSH密钥设置失败，请检查网络连接和服务器配置。
)

pause
