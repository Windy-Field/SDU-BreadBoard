@echo off
chcp 65001 >nul
rem 双击后打包当前离线版本，运行过程不需要安装 Node.js。
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\package.ps1"
if errorlevel 1 goto failed
echo.
echo 打包完成，压缩包已放入 releases 文件夹。
pause
exit /b 0

:failed
echo.
echo 打包未完成，请查看上方提示。
pause
exit /b 1
