# 文档索引

## 使用与实验

| 文档 | 内容 |
| --- | --- |
| [使用说明](user-guide.md) | 面包板操作、保存、导入导出和状态说明 |
| [补码运算器](complement-wiring.md) | 第一份实验的操作、验收和接线表 |
| [RAM 字扩展](ram-wiring.md) | 第二份实验的读写步骤、验收和接线表 |
| [逻辑电路图](logic-diagram.md) | 自动生成图纸及网络查看 |
| [下载与打包](packaging.md) | 网页离线包、桌面版、发布与自动更新 |

## 芯片资料

| 文档 | 内容 |
| --- | --- |
| [芯片参考](chip-references.md) | 引脚资料入口与核对方式 |
| [芯片实现](document-chips.md) | 支持型号、功能和材料引脚差异 |
| [芯片核查](chip-audit.md) | 核查依据、结果与验证范围 |

## 开发与维护

| 文档 | 内容 |
| --- | --- |
| [工作区目录](workspace.md) | 各目录职责、源码分类与常用命令 |
| [参数位置](configuration.md) | 可配置参数所属文件 |
| [走线引擎](routing-engine.md) | 自动布线与路径处理 |
| [版本记录](changelog.md) | 各版本变化 |

`complement-wiring.md` 和 `ram-wiring.md` 由 `npm run build` 生成，修改说明应编辑对应的实验源码，不直接改生成文档
