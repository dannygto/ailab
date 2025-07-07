@echo off
echo ===================================================
echo             AICAM V2 Document Cleanup
echo ===================================================

echo Cleaning up redundant and obsolete files...

REM 删除冗余脚本文件
echo Removing redundant script files...
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\test-settings-minimal.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\test-settings-minimal.ps1' -Force }"
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\start-platform-new.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\start-platform-new.ps1' -Force }"
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\简化状态检查.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\简化状态检查.ps1' -Force }"
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\简化构建检查.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\简化构建检查.ps1' -Force }"
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\test.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\test.ps1' -Force }"
powershell -Command "if (Test-Path 'D:\AICAMV2\scripts\状态检查.ps1') { Remove-Item -Path 'D:\AICAMV2\scripts\状态检查.ps1' -Force }"

REM 删除API文档重复
echo Removing duplicate API documentation...
powershell -Command "if (Test-Path 'D:\AICAMV2\文档\04-API参考\API文档.md') { Remove-Item -Path 'D:\AICAMV2\文档\04-API参考\API文档.md' -Force }"

REM 删除重复的任务和脚本
echo Removing redundant tasks and scripts...
powershell -Command "Get-ChildItem -Path 'D:\AICAMV2\scripts\*-bak.*' -File | Remove-Item -Force"
powershell -Command "Get-ChildItem -Path 'D:\AICAMV2\scripts\*-old.*' -File | Remove-Item -Force"
powershell -Command "Get-ChildItem -Path 'D:\AICAMV2\scripts\*-backup.*' -File | Remove-Item -Force"

echo ===================================================
echo          Cleanup Completed Successfully!
echo ===================================================
