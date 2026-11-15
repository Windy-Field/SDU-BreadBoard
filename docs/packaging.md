# 下载与打包

## 游客使用

你可以从 [GitHub 发布页](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest) 下载文件名带 `offline.zip` 的离线包，也可以通过仓库的 **Code → Download ZIP** 下载完整源码

完整解压后，使用 Chrome 或 Edge 打开 `index.html`。压缩包已包含页面所需的脚本、样式、图标和芯片引脚图，解压时请保留原有目录关系

标准补码示例首次打开或从浏览器存档恢复时，会先清零寄存器，再恢复保存的 K6 值和其他输入，不恢复上次累计结果。改接电路、导入实验、切换实验或重新上电后，仍需按电路自己的复位方式初始化

## Windows 桌面版

桌面版提供 `Setup-x64.exe` 安装包和 `Portable-x64.exe` 免安装程序，均包含运行环境，不需要用户另装 Node.js 或浏览器，适用于 Windows 10/11 的 64 位系统

安装版可选择安装目录并创建桌面、开始菜单快捷方式；免安装版直接双击运行。实验使用独立的应用数据目录 `%APPDATA%\SDU-BreadBoard`，两个版本共用存档，移动程序和升级不会改变存档位置

网页版存档与桌面版分开，迁移时先在网页导出 JSON，再在桌面版导入。关闭有未保存更改的窗口时会询问，卸载默认保留应用数据

开发时运行 `npm run desktop`，构建两个 Windows 程序运行 `npm run desktop:package`，产物位于 `releases/desktop/`，可使用 `npm run test:desktop` 检查真实桌面入口

桌面运行使用 [Electron](https://www.electronjs.org/docs/latest/)，安装包使用 [electron-builder](https://www.electron.build/)，主进程在 `desktop/` 中维护，页面继续复用原有 `src/` 和构建产物

## Windows 快捷打包

当你双击项目根目录的 `package.cmd` 后，程序就会调用 Windows 自带的 PowerShell，将离线包放进 `releases/`。整个过程在本地完成。同版本再次打包时，程序会生成新文件，保留之前的压缩包

离线包包含 `index.html`、`application.js`、`styles/`、`vendor/`、`assets/`、`examples/`、`docs/`、`README.md`、`LICENSE` 和入口说明 `START-HERE.md`。源码、开发依赖、Git 记录和测试报告留在本地，个人实验数据仍保存在你的浏览器中

打包成功或失败后，窗口都会停留，按任意键才会关闭。`package.cmd` 使用 Windows 的 CRLF 换行，编辑时请保留这个格式，避免命令被截断

## 更新页面后再打包

当你修改 `src/` 后，需要先运行 `npm run build`，再运行 `package.cmd`。打包程序会收集刚生成的 `application.js`，游客解压后运行的就是这份构建结果

提交仓库时，请一并提交最新的 `application.js`、样式、图标和资料，让 GitHub 自动生成的源码 ZIP 也能解压后直接使用

## 验证离线包

你可以在开发环境中运行 `npm run test:package`。测试会先在含中文和空格的临时路径中运行 `package.cmd`，检查成功和失败时的提示，再解压 ZIP，用浏览器检查图片、补码运算及导出功能，结束后自动清理临时目录
