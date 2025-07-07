@echo off
echo ===================================================
echo     AICAM V2 Linux Remote Login Tool (PuTTY)
echo ===================================================

echo 正在连接到远程开发机...
echo 用户: ubuntu
echo 主机: 82.156.75.232
echo.

rem 使用PuTTY的plink工具，可以直接在命令行提供密码
plink -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&"

echo.
echo 远程会话已结束
