@echo off
echo 正在启动TCP/Socket设备模拟器...

REM 启动处理器模拟器
start "处理器模拟器" cmd /c "node .\scripts\device-simulator-proc.js"

REM 启动传感器模拟器
start "传感器模拟器" cmd /c "node .\scripts\device-simulator-sens.js"

REM 启动测试工具
echo 设备模拟器已启动，正在启动测试工具...
node .\scripts\tcp-socket-adapter-test-tool.js

REM 关闭所有模拟器
echo 测试工具已关闭，正在关闭所有模拟器...
taskkill /FI "WINDOWTITLE eq 处理器模拟器*" /T /F
taskkill /FI "WINDOWTITLE eq 传感器模拟器*" /T /F

echo 所有设备模拟器已关闭
