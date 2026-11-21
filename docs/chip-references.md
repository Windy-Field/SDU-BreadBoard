# 部分芯片资料

## 引脚图来源

下表列出的引脚图裁自 TI 数据手册，每张图都保留了完整的 DIP 脚号和信号名称。

| 芯片 | 原厂资料 | 引脚图页码 |
| --- | --- | --- |
| 74LS273 | [SN74LS273](https://www.ti.com/lit/ds/symlink/sn74ls273.pdf) | 1 |
| 74LS283 | [SN74LS283](https://www.ti.com/lit/ds/symlink/sn74ls283.pdf) | 1 |
| 74LS86 | [SN74LS86A](https://www.ti.com/lit/ds/symlink/sn74ls86a.pdf) | 1 |
| 74LS00 | [SN74LS00](https://www.ti.com/lit/ds/symlink/sn74ls00.pdf) | 3 |
| 74LS08 | [SN74LS08](https://www.ti.com/lit/ds/symlink/sn74ls08.pdf) | 1 |
| 74LS32 | [SN74LS32](https://www.ti.com/lit/ds/symlink/sn74ls32.pdf) | 1 |
| 74LS04 | [SN74LS04](https://www.ti.com/lit/ds/symlink/sn74ls04.pdf) | 1 |
| 74LS138 | [SN74LS138](https://www.ti.com/lit/ds/symlink/sn74ls138.pdf) | 1 |
| 74LS194 | [SN74LS194A](https://www.ti.com/lit/ds/symlink/sn74ls194a.pdf) | 1 |

## 核对当前实验

点左侧的「诊断电路」，就能在右侧逐片查看供电、输入和时序状态。驱动冲突与短路也会列出来。

输入输出板上的细线标出了板内固定连接，可插拔导线则连接在面包板插孔上。K、P 信号接第四块面包板对应列的 A～J，上下五孔组通过细线桥接，L 信号只接最上块对应列的 A～E。程序按这一连通关系检查接线，X、Y 母线与普通五孔列分别连接
