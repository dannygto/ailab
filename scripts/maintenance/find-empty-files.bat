@echo off
echo 开始查找空文件 - %date% %time%
echo =======================================
echo.

set logfile=empty-files-log.txt
echo 空文件扫描日志 - %date% %time% > %logfile%
echo ======================================= >> %logfile%
echo. >> %logfile%

echo 查找所有空文件...
for /r %%f in (*) do (
    if %%~zf==0 (
        echo 找到空文件: %%f
        echo 找到空文件: %%f >> %logfile%

        rem 检查文件的最后修改时间
        for /f "tokens=1-3 delims=/ " %%a in ('echo %%~tf') do (
            set filedate=%%c%%a%%b

            rem 获取当前日期
            for /f "tokens=1-3 delims=/ " %%x in ('date /t') do (
                set currdate=%%z%%x%%y
            )

            rem 计算日期差值（简化版）
            set /a datediff=%currdate% - %filedate%

            if !datediff! gtr 9000 (
                echo   - 文件超过90天未修改，将被删除
                echo   - 文件超过90天未修改，将被删除 >> %logfile%
                del "%%f"
                if not exist "%%f" (
                    echo   - 已成功删除 >> %logfile%
                ) else (
                    echo   - 删除失败 >> %logfile%
                )
            ) else (
                echo   - 文件修改时间在90天内，不删除
                echo   - 文件修改时间在90天内，不删除 >> %logfile%
            )
        )
    )
)

echo.
echo 操作完成，详细日志已保存到 %logfile%
echo.
echo 操作完成 - %date% %time% >> %logfile%
