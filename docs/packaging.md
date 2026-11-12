# 下载与打包

## 游客使用

你可以从 [GitHub 发布页](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest) 下载文件名带 `offline.zip` 的离线包，也可以通过仓库的 **Code → Download ZIP** 下载完整源码

完整解压后，使用 Chrome 或 Edge 打开 `index.html`。压缩包已包含页面所需的脚本、样式、图标和芯片引脚图，解压时请保留原有目录关系

## Windows 快捷打包

当你双击项目根目录的 `package.cmd` 后，程序就会调用 Windows 自带的 PowerShell，将离线包放进 `releases/`。整个过程在本地完成。同版本再次打包时，程序会生成新文件，保留之前的压缩包

离线包包含 `index.html`、`application.js`、`styles/`、`vendor/`、`assets/`、`examples/`、`docs/`、`README.md`、`LICENSE` 和入口说明 `START-HERE.md`。源码、开发依赖、Git 记录和测试报告留在本地，个人实验数据仍保存在你的浏览器中

打包成功或失败后，窗口都会停留，按任意键才会关闭。`package.cmd` 使用 Windows 的 CRLF 换行，编辑时请保留这个格式，避免命令被截断

## 更新页面后再打包

当你修改 `src/` 后，需要先运行 `npm run build`，再运行 `package.cmd`。打包程序会收集刚生成的 `application.js`，游客解压后运行的就是这份构建结果

提交仓库时，请一并提交最新的 `application.js`、样式、图标和资料，让 GitHub 自动生成的源码 ZIP 也能解压后直接使用

## 验证离线包

你可以在开发环境中运行 `npm run test:package`。测试会先在含中文和空格的临时路径中运行 `package.cmd`，检查成功和失败时的提示，再解压 ZIP，用浏览器检查图片、补码运算及导出功能，结束后自动清理临时目录
