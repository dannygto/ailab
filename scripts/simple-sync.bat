@echo off
setlocal

echo =================================================
echo AICAM V2 简易项目同步工具
echo =================================================
echo.
echo 正在同步项目到远程开发机...
echo.

REM 确保远程目录存在
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "mkdir -p /home/ubuntu/AICAMV2"

REM 同步项目代码
echo 同步项目代码...
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\* ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/

REM 同步项目状态
echo 同步项目状态...
pscp -batch -pw "Danny486020!!&&" "D:\AICAMV2\项目管理\项目进度报告汇总-新.md" ubuntu@82.156.75.232:/home/ubuntu/AICAM-PROJECT-STATUS.md

echo.
echo =================================================
echo 同步完成！
echo 上次同步时间: %date% %time%
echo =================================================

echo %date% %time% > last_sync.txt

pause
