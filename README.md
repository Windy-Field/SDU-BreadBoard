# SDU 面包板模拟器

SDU-BreadBoard 基于山东大学计算机组成原理实验的面包板设计。你可以放置芯片、连接导线、设置输入并观察输出，在本地完成数字电路接线测试

你可以从[发布页下载离线包](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest)，也可以使用仓库的 **Code → Download ZIP**。将压缩包完整解压，再双击 `index.html`，即可使用。运行页面不需要安装 Node.js

需要重新打包时，你可以双击 Windows 下的 `package.cmd`。程序会在 `releases` 文件夹生成离线 ZIP，里面只包含运行文件和使用资料。[打包说明](docs/packaging.md)介绍了更新和验证方法

## 最新页面

![SDU 面包板最新页面](assets/screenshots/latest.png)

## 最近版本

### v1.1.0 · 2026-11-11

按芯片合集增加 16 种器件，器件库共有 23 种芯片。画布与外部脉冲按钮支持按下、松开操作，器件库和实验列表可独立滚动。输入输出直接按端口位数显示

### v1.0.8 · 2026-11-11

多选导线后，你可以通过调色板或自定义颜色批量改色，一次撤销即可恢复。芯片的外观保持不变

新增双击打包入口 `package.cmd`。当你从 GitHub 下载压缩包后，完整解压并打开 `index.html` 即可使用

你可以查看[完整版本记录](docs/changelog.md)和[使用说明](docs/user-guide.md)

## 参考面包板

![山东大学计组实验参考面包板](assets/reference-board.jpg)

芯片资料与接线核对方式见[资料说明](docs/chip-references.md)
