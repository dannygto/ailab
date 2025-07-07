@echo off
echo 正在同步项目到远程开发机...
echo 源路径: D:\AICAMV2
echo 目标: ubuntu@82.156.75.232:/home/ubuntu/
echo.
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2 ubuntu@82.156.75.232:/home/ubuntu/
echo.
echo 同步完成！
pause
