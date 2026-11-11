# 下载与打包

## 游客使用

1. 打开 [GitHub 发布页](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest)，下载文件名带 `offline.zip` 的离线包。你也可以点击仓库的 **Code → Download ZIP** 下载完整源码
2. 将整个压缩包解压到一个文件夹
3. 双击其中的 `index.html`，用 Chrome 或 Edge 打开

页面所需的脚本、样式、图标和芯片引脚图都在压缩包内。请保留这些文件之间的目录关系

## Windows 快捷打包

双击项目根目录的 `package.cmd`。它会调用 Windows 自带的 PowerShell，将离线包放进 `releases/`。打包不需要 Node.js，也不需要联网；同版本再次打包时，程序会生成新文件，不覆盖之前的压缩包

打包程序收集 `index.html`、`application.js`、`styles/`、`vendor/`、`assets/`、`examples/`、`docs/`、`README.md` 和 `LICENSE`，并在离线包中加入 `START-HERE.md`。源码、开发依赖、Git 记录、测试报告和浏览器中的个人实验数据不进入离线包

打包成功或失败后，窗口都会停留，按任意键才会关闭。`package.cmd` 使用 Windows 的 CRLF 换行，编辑时请保留这个格式，避免命令被截断

## 更新页面后再打包

开发者修改 `src/` 后，先运行 `npm run build`，再双击 `package.cmd`。打包程序收集当前已构建的 `application.js`；游客打开压缩包时，直接运行这份构建结果

提交仓库时，请保留最新的 `application.js`、样式、图标和资料。这样，GitHub 自动生成的源码 ZIP 也能解压后直接使用

## 验证离线包

开发环境中可以运行 `npm run test:package`。测试先在含中文和空格的临时路径中运行 `package.cmd`，检查成功和失败时的提示，再解压 ZIP，用浏览器检查图片、补码运算及导出功能，完成后清理临时目录
