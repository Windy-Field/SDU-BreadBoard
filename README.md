# SDU 面包板模拟器

SDU-BreadBoard 是基于山东大学计算机组成原理实验的面包板设计的模拟器。由此，你可以在**本地**完成数字电路接线测试

你可以从[发布页下载离线包](https://github.com/Windy-Field/SDU-BreadBoard/releases/latest)，也可以使用仓库的 **Code → Download ZIP**。将压缩包完整解压，再双击 `index.html`，即可使用

需要重新打包时，你可以双击 Windows 下的 `package.cmd`。程序会在 `releases` 文件夹生成离线 ZIP，里面只包含运行文件和使用资料。[打包说明](docs/packaging.md)介绍了更新和验证方法

## 最新页面

![SDU 面包板最新页面](assets/screenshots/latest.png)

## 最近版本

### v1.4.0 · 2026-11-11

复查 23 种芯片并修正七段字形、计数器非法状态恢复和部分未知值传播，增加供电、全部字形、同钟采样与级联测试，详见[芯片核查报告](docs/chip-audit.md)

更新界面显示：细线常显直连关系（一定要仔细看！），内部连通示意包含右侧 GND 和 +5V，节点电平使用 0、1、X、Z 字符显示

注意：第四块面包板保留完整孔位，输入与脉冲对应列通过细线连接上下五孔组，模拟原板输入模块覆盖半块板的结构，其他列不跨沟槽接通

### v1.2.4 · 2026-11-11

公开参数文档，配置位置见[参数说明](docs/configuration.md)

新增适用于当前电路的“整理走线”，确认后调整导线路径，但保留端点、线色和备注，支持撤销

你可以查看[完整版本记录](docs/changelog.md)和[使用说明](docs/user-guide.md)

## 参考面包板

![山东大学计组实验参考面包板](assets/reference-board.jpg)

芯片资料与接线核对方式请见[资料说明](docs/chip-references.md)
