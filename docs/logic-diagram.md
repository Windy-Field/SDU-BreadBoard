# 逻辑连线图

“显示逻辑电路图”按钮会打开当前实验的逻辑连线图

## 图纸内容

- 74LS86、74LS08、74LS00 等多路门拆成独立的逻辑门，例如 `U4.1` 表示 U4 的第一路门
- 逻辑门采用紧凑矩形符号：与门 `&`、或门 `≥1`、异或门 `=1`，非门使用 `1` 和输出取反圆圈，与非门使用 `&` 和输出取反圆圈
- 引脚通过短线接到方框边缘，脚号标在短线旁，元件编号位于方框上方；复杂芯片保留输入输出脚名和功能标记
- 加法器、寄存器、计数器、译码器和数据选择器保留为带物理脚号的功能块
- 输入脚通常放在左侧，输出脚通常放在右侧，左右数量取决于实际功能
- K、L 和 P 端口按实际连入的网络显示，物理引脚映射沿用当前芯片模型
- 同一网络的支线属于同一个电气节点，交叉处不自动接通，分岔口用加大的实心圆点表示，圆点统一绘在线路上方，避免被其他线段盖住
- 默认用同名网络标签标记电源和地，勾选“电源连线”可展开电源网络
- 图纸保留 X、Z 和多驱动节点，不会替用户修改原来的接线

输入数据来自当前面包板工程的芯片、导线和板内铜排，图纸生成不读取照片像素

## 查看与导出

图纸支持放大、缩小和适应宽度，图纸超出窗口时只在画布内滚动

与面包板一致，按住 Ctrl 再滚动滚轮可围绕鼠标位置缩放，Mac 可使用 Command；普通滚轮上下移动，Shift 加滚轮左右移动，触控板可双向滚动

按住鼠标左键或中键拖动可平移图纸，短按线路仍用于选择网络，拖动结束不会误选线路；也可使用滚动条，聚焦画布后用方向键滚动

选线和键盘聚焦只改变原线路的颜色与线宽，不增加路线，也不绘制线路外接矩形

点击线路、引脚或在“网络核对”中选择网络，会标亮这条网络的全部分支，并列出物理端点、电平和弱上拉位置

下载图标导出自带样式的 `breadboard-logic.svg`，离开项目目录也可以用浏览器查看。生成、缩放和导出均不会修改接线、输入开关或寄存器状态

## 方案来源

本次先检查了现成软件和开源实现

| 项目 | 已有能力 | 本项目的使用方式 |
| --- | --- | --- |
| [Fritzing](https://github.com/fritzing/fritzing-app) | 面包板、原理图与 PCB 的多视图电子设计工具 | 参考多视图共用同一份电路数据的思路，未复制其程序或零件图形 |
| [netlistsvg](https://github.com/nturley/netlistsvg) | 将 Yosys JSON 网表绘制为逻辑电路 SVG，使用 ELK 排版 | 参考网表、布局、绘制分开的处理顺序，当前工程直接读取已有电路，不转换为 Yosys 格式 |
| [elkjs](https://github.com/kieler/elkjs) | 带引脚的有向图自动布局与正交布线 | 使用 0.12.1 版官方布局库，不自行实现分层布局和反馈线排版 |

接口依据为 [ELK JSON 图结构](https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure/jsonformat.html) 和 elkjs 官方 README

布线继续采用 ELK 分层正交算法。比较 `NETWORK_SIMPLEX` 与 `LONGEST_PATH_SOURCE` 两种官方分层设置，优先选转角较少的结果，转角相同时选总线长较短的结果，引脚端点不变

参数依据为官方的[分层策略](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-layering-strategy.html)、[优先直线](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-favorStraightEdges.html)和[省略多余折点](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-unnecessaryBendpoints.html)说明

elkjs 随运行脚本打包，断网和双击打开本地页面均可使用，许可证保存于 `vendor/elkjs.LICENSE`，对应源码由上方官方仓库提供

## 模块与验证

| 模块 | 职责 |
| --- | --- |
| `src/logic-diagram.mjs` | 复用仿真连通规则，提取真实网络、门单元和引脚方向 |
| `src/logic-diagram-layout.mjs` | 将逻辑模型转换成 ELK 图，返回位置、正交路径和分支点 |
| `src/logic-diagram-view.mjs` | 绘制图形，处理缩放、网络核对和 SVG 导出 |
| `styles/logic-diagram.css` | 控制图纸线色、字体、窗口与响应式布局 |

逻辑测试核对所有布局边的真实网络归属、23 种芯片的脚位、直连端口、裸导线、多驱动节点和只读行为

浏览器测试验证断网生成、元件无重叠、网络高亮、键盘操作、SVG 导出和桌面、手机竖屏及横屏布局
