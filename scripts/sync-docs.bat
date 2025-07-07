@echo off
echo ===================================================
echo        AICAM V2 项目文档同步工具
echo ===================================================

echo 正在准备同步项目文档...

:: 确保远程目录存在
ssh ubuntu@82.156.75.232 "mkdir -p /home/ubuntu/AICAMV2/project_docs"

:: 创建临时目录，用于存放项目文档的副本
echo 创建临时文档目录...
if not exist temp_docs mkdir temp_docs

:: 复制项目文档到临时目录
echo 复制项目文档到临时目录...
copy "D:\AICAMV2\项目管理\*.md" temp_docs\

:: 显示要同步的文件
echo 以下文件将被同步:
dir /b temp_docs\*.md

:: 同步文档到远程服务器
echo 同步文档到远程服务器...
scp -r temp_docs\*.md ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/project_docs/

:: 转换文件格式
echo 转换文件格式（Windows -> Unix）...
ssh ubuntu@82.156.75.232 "find /home/ubuntu/AICAMV2/project_docs -type f -name '*.md' -exec dos2unix {} \;"

:: 清理临时目录
echo 清理临时目录...
rmdir /s /q temp_docs

echo ===================================================
echo               项目文档同步完成！
echo ===================================================
echo 您可以在远程服务器上查看项目文档：
echo /home/ubuntu/AICAMV2/project_docs/
echo.
