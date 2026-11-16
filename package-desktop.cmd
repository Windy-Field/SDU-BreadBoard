@echo off
chcp 65001 >nul
rem 检查打包工具，再切换到脚本所在目录，支持从其他目录启动
where npm >nul 2>nul
if errorlevel 1 goto missing_npm
pushd "%~dp0"
if errorlevel 1 goto failed

rem 复用项目打包命令，一次生成安装版和免安装版，不自动发布
call npm run desktop:package
if errorlevel 1 goto build_failed
popd
echo.
echo 桌面版打包完成，安装版和免安装版已放入：
echo "%~dp0releases\desktop"
pause
exit /b 0

:build_failed
popd
goto failed

:missing_npm
echo 未找到 npm，请先安装 Node.js LTS，再重新打开此入口

:failed
echo.
echo 桌面版打包未完成，请查看上方错误提示
echo 首次使用源码打包时，请先在项目目录运行 npm ci 安装依赖
pause
exit /b 1
