# 部分芯片资料

## 引脚图来源

芯片介绍前部的图片均裁切自以下 TI 原厂数据手册，每张图都保留了完整的 DIP 脚号和信号名称

| 芯片 | 原厂资料 | 引脚图页码 |
| --- | --- | --- |
| 74LS273 | [SN74LS273](https://www.ti.com/lit/ds/symlink/sn74ls273.pdf) | 1 |
| 74LS283 | [SN74LS283](https://www.ti.com/lit/ds/symlink/sn74ls283.pdf) | 1 |
| 74LS86 | [SN74LS86A](https://www.ti.com/lit/ds/symlink/sn74ls86a.pdf) | 1 |
| 74LS00 | [SN74LS00](https://www.ti.com/lit/ds/symlink/sn74ls00.pdf) | 3 |
| 74LS08 | [SN74LS08](https://www.ti.com/lit/ds/symlink/sn74ls08.pdf) | 1 |
| 74LS32 | [SN74LS32](https://www.ti.com/lit/ds/symlink/sn74ls32.pdf) | 1 |
| 74LS04 | [SN74LS04](https://www.ti.com/lit/ds/symlink/sn74ls04.pdf) | 1 |

## 核对当前实验

当你点击左侧“诊断电路”后，右侧面板会按芯片列出当前电路的供电、输入、驱动冲突、短路与时序状态

输入输出板上的细线标出了板内固定连接，可插拔导线则连接在面包板插孔上。K、P 信号接第四块面包板对应列的 A～J，上下五孔组通过细线桥接，L 信号只接最上块对应列的 A～E。程序按这一连通关系检查接线，X、Y 母线与普通五孔列分别连接
