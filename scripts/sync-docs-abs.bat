@echo off
echo ===================================================
echo        AICAM V2 Project Document Sync Tool
echo ===================================================

echo Preparing to sync project documents...

:: Create remote directory
ssh ubuntu@82.156.75.232 "mkdir -p /home/ubuntu/AICAMV2/project_docs"

:: Create temporary directory
echo Creating temporary directory...
if exist "D:\AICAMV2\scripts\temp_docs" rmdir /s /q "D:\AICAMV2\scripts\temp_docs"
mkdir "D:\AICAMV2\scripts\temp_docs"

:: Copy project documents to temporary directory
echo Copying project documents to temporary directory...
copy "D:\AICAMV2\项目管理\*.md" "D:\AICAMV2\scripts\temp_docs\"

:: Display files to sync
echo Files to be synced:
dir /b "D:\AICAMV2\scripts\temp_docs\*.md"

:: Sync documents to remote server
echo Syncing documents to remote server...
scp "D:\AICAMV2\scripts\temp_docs\*.md" ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/project_docs/

:: Convert file format
echo Converting file format (Windows to Unix)...
ssh ubuntu@82.156.75.232 "find /home/ubuntu/AICAMV2/project_docs -type f -name '*.md' -exec dos2unix {} \;"

:: Clean up temporary directory
echo Cleaning up temporary directory...
rmdir /s /q "D:\AICAMV2\scripts\temp_docs"

echo ===================================================
echo            Project Documents Sync Complete!
echo ===================================================
echo You can view the project documents on the remote server:
echo /home/ubuntu/AICAMV2/project_docs/
echo.
