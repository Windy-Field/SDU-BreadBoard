# 下载与打包

## 游客使用

你可以从 [GitHub 发布页](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest) 下载文件名带 `offline.zip` 的离线包，也可以通过仓库的 **Code → Download ZIP** 下载完整源码

完整解压后，使用 Chrome 或 Edge 打开 `index.html`。压缩包已包含页面所需的脚本、样式、图标和芯片引脚图，解压时请保留原有目录关系

标准补码示例首次打开或从浏览器存档恢复时，会先清零寄存器，再恢复保存的 K6 值和其他输入，不恢复上次累计结果。改接电路、导入实验、切换实验或重新上电后，仍需按电路自己的复位方式初始化

## Windows 桌面版

桌面版提供 `Setup-x64.exe` 安装包和 `Portable-x64.exe` 免安装程序，均包含运行环境，不需要用户另装 Node.js 或浏览器，适用于 Windows 10/11 的 64 位系统

安装版可选择安装目录并创建桌面、开始菜单快捷方式；免安装版直接双击运行。实验使用独立的应用数据目录 `%APPDATA%\SDU-BreadBoard`，两个版本共用存档，移动程序和升级不会改变存档位置

网页版存档与桌面版分开，迁移时先在网页导出 JSON，再在桌面版导入。关闭有未保存更改的窗口时会询问，卸载默认保留应用数据

双击项目根目录的 `package-desktop.cmd`，即可一次生成安装版和免安装版，产物位于 `releases/desktop/`。入口会自动进入项目目录，成功或失败都会保留窗口显示结果，不自动上传 GitHub

桌面打包需要 Node.js LTS，首次使用源码时先在项目目录运行 `npm ci` 安装依赖。开发时运行 `npm run desktop`，命令行打包仍可使用 `npm run desktop:package`，可使用 `npm run test:desktop` 检查真实桌面入口

发行版启动约 15 秒后自动检查 GitHub 正式版，运行期间每小时检查一次。安装版自动下载新版本，完成后提示重启安装；有未保存实验时仍可返回保存。免安装版自动检查并提示打开下载页，不自动覆盖正在运行的程序

更新弹窗显示待更新版本的 GitHub Release 正文，每次弹出前通过 GitHub 纯文本接口重新读取。修改 Release 说明后，下次弹窗会使用修改后的内容，无需重新打包；已经打开的弹窗不会实时刷新。网络超时或接口限流时优先显示本次检查更新携带的备用说明，并标明未能刷新；无备用说明或正文为空时显示相应提示，下载与安装流程仍可继续

发布桌面更新时，需要一起上传安装版 EXE、对应 `.blockmap` 和 `latest.yml`，免安装 EXE 作为单独下载项。`latest.yml` 必须来自同一次构建，包含安装包版本、文件名和 SHA-512；下一版需使用更高版本号

1.8.3 已加入更新检查，之前下载的不带更新功能的同版本桌面程序需手动下载替换一次。GitHub 暂时无法连接时保留离线功能，下次定时检查重试

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
