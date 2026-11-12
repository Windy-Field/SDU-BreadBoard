# 参数位置

修改参数后运行 `npm run build`，以让离线页面使用新的配置

| 文件 | 参数内容 |
| --- | --- |
| `src/app.mjs` | 撤销上限、缩放、点击与拖动阈值、下载释放时间和时钟刷新 |
| `src/board.mjs` | 实物孔距、母线分段、电源轨、端口数量、默认显示位数、备注上限和线色 |
| `src/storage.mjs` | 导入大小、芯片和导线数量、转折点上限、名称长度及旧文件坐标范围 |
| `src/geometry.mjs` | 选择范围、吸附距离、默认折线通道和芯片外框 |
| `src/wire-path.mjs` | 路径坐标比较容差、短斜角的最大孔距与相邻线段占比 |
| `src/render.mjs` | 画布像素倍率、线宽、灯和按键模块的显示位置 |
| `src/routing.mjs` | libavoid 线段代价、芯片避让距离、线间距和寻路边界 |
| `src/routing-runtime.mjs` | 浏览器与 Node 的引擎初始化入口 |
| `src/select-control.mjs` | 下拉位置、高度和键盘名称搜索等待时间 |
| `src/toast.mjs`、`src/motion.mjs` | 提示停留数量与时间、动画时长和淡入透明度 |
| `src/notes.mjs` | Markdown 解析选项、安全标签、属性和链接协议 |
| `src/engine.mjs` | 组合逻辑与时序逻辑的最大稳定计算轮数 |
| `src/diagnostics.mjs` | 通用诊断规则、时钟与控制脚定义、逐片状态说明 |
| `styles/tokens.css` | 语义颜色、字体、间距、圆角和动效变量 |
| `styles/app.css`、`styles/select.css` | 栏目尺寸、下拉内边距、滚动条宽度和控件间距 |
| `scripts/build.mjs`、`scripts/route-preset.mjs`、`scripts/wiring-guide.mjs` | 构建输出、示例路径和接线文档位置 |
| `scripts/package.ps1` | 离线包文件列表、输出目录、命名和压缩方式 |

芯片物理脚号、真值表和示例电气连接属于固定设计数据
