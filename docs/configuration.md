# 参数位置

当你修改参数并重新运行 `npm run build` 后，离线页面就会使用新的配置

| 文件 | 参数内容 |
| --- | --- |
| `src/app.mjs` | 撤销上限、板面缩放、点击与拖动阈值、导出文件名和时钟刷新 |
| `src/ui/dom.mjs` | 下载后释放临时地址的等待时间 |
| `src/ui/board-io.mjs` | 二进制显示分组，输入输出控件的宽度由现有样式决定 |
| `src/ui/inspection-layout.mjs` | 资料分区的最小高度、按钮调整距离和阅读比例，分隔条高度从样式读取 |
| `src/diagram/logic-diagram-layout.mjs` | 逻辑图元件宽度、引脚间距和 ELK 自动排版参数 |
| `src/diagram/logic-diagram-view.mjs`、`styles/logic-diagram.css` | 逻辑图缩放范围、导出样式属性、窗口尺寸和线路样式 |
| `src/board/board.mjs` | 实物孔距、母线分段、电源轨、端口数量、默认显示位数、备注上限和线色 |
| `src/storage/storage.mjs` | 导入大小、芯片和导线数量、转折点上限、名称长度及旧文件坐标范围 |
| `src/storage/workspace.mjs` | 本地存储键、工作区文件版本和实验编号规则 |
| `src/board/geometry.mjs` | 选择范围、吸附距离、默认折线通道和芯片外框 |
| `src/board/wire-path.mjs` | 路径坐标比较容差、短斜角的最大孔距与相邻线段占比 |
| `src/board/render.mjs` | 画布像素倍率、线宽、灯和按键模块的显示位置 |
| `src/board/routing.mjs` | libavoid 线段代价、芯片避让距离、线间距和寻路边界 |
| `src/board/routing-runtime.mjs` | 浏览器与 Node 的引擎初始化入口 |
| `src/board/routing-browser.mjs`、`src/ui/runtime-scripts.mjs` | 布线浏览器独立入口与本地引擎按需加载 |
| `src/ui/select-control.mjs` | 下拉位置、高度和键盘名称搜索等待时间 |
| `src/ui/toast.mjs`、`src/ui/motion.mjs` | 提示停留数量与时间、数字过渡时长和两种画布共用的滚轮灵敏度 |
| `src/ui/notes.mjs` | Markdown 解析选项、安全标签、属性和链接协议 |
| `src/simulation/engine.mjs` | 组合逻辑与时序逻辑的最大稳定计算轮数 |
| `src/chips/chips.mjs`、`src/chips/extra-chips.mjs` | 芯片规格与控制脚，仿真和诊断共用这些脚号 |
| `src/simulation/timing-trace.mjs`、`src/ui/timing-panel.mjs`、`styles/timing.css` | 记录上限、默认信号、波形坐标和图表样式 |
| `styles/tokens.css` | 语义颜色、字体、间距、圆角和动效变量 |
| `styles/app.css`、`styles/select.css` | 栏目尺寸、下拉内边距、滚动条宽度和控件间距 |
| `scripts/build.mjs`、`scripts/route-preset.mjs`、`scripts/wiring-guide.mjs` | 构建输出、示例路径和接线文档位置 |
| `scripts/package.ps1` | 离线包文件列表、输出目录、命名和压缩方式 |

芯片物理脚号、真值表和示例电气连接属于固定设计数据
