# 工作区目录

## 目录分类

| 路径 | 用途 |
| --- | --- |
| `index.html` | 网页入口，可直接用浏览器打开 |
| `application.js` | 构建生成的网页脚本，不手动编辑 |
| `src/` | 网页、芯片和实验源码 |
| `desktop/` | Electron 桌面入口、更新检查与发布说明 |
| `styles/` | 页面样式、设计参数和逻辑图样式 |
| `assets/` | 运行所需图片、芯片引脚图、数据手册和展示截图 |
| `vendor/` | 第三方运行文件及许可证 |
| `examples/` | 构建生成的实验 JSON，可在界面导入 |
| `scripts/` | 构建、生成走线、生成文档和网页打包 |
| `tests/` | 逻辑、浏览器、桌面和发布包测试 |
| `tests/fixtures/` | 独立测试参考数据 |
| `docs/` | 操作与开发文档，入口为[文档索引](README.md) |
| `reports/` | 本地测试与核查结果，不进入 Git 和发布包 |
| `releases/` | 本地发布产物，不进入 Git |
| `node_modules/` | 安装的依赖，由 npm 管理 |

根目录保留 `package.json`、`package-lock.json`、`electron-builder.json`、`LICENSE` 和两个双击打包入口，不搬动运行或工具所需文件

## 源码分类

| 目录或入口 | 内容 |
| --- | --- |
| `src/app.mjs` | 网页启动和操作协调入口 |
| `src/chips/` | 芯片引脚、组合逻辑、时序状态、RAM 状态和资料目录 |
| `src/simulation/` | 电气网络仿真与电路诊断 |
| `src/board/` | 面包板结构、画布绘制、几何命中与自动走线 |
| `src/experiments/` | 补码与 RAM 实验、公共接线、旧布局迁移和固定走线 JSON |
| `src/storage/` | 实验文件校验、导入兼容与多实验存档 |
| `src/diagram/` | 逻辑图网络提取、自动布局与图纸交互 |
| `src/ui/` | DOM 工具、资料面板、备注、下拉控件、提示、动效、平移和框选 |
| `src/version.mjs` | 版本与时钟配置，版本需与根目录 `package.json` 保持一致 |

分类只调整文件位置与引用，不改变模块功能。桌面主进程仍在 `desktop/`，构建与打包脚本仍在 `scripts/`，页面样式仍在 `styles/`

## 测试分类

| 目录或入口 | 内容 |
| --- | --- |
| `tests/unit/` | 芯片、仿真、存档、走线和逻辑图的逻辑回归 |
| `tests/browser/` | 页面、面包板、逻辑图、框选和 RAM 操作验证 |
| `tests/desktop/` | Electron 运行、更新、发布说明与桌面打包入口验证 |
| `tests/helpers/` | 接线核对和走线质量计算 |
| `tests/fixtures/` | 独立引脚表和旧版实验参考数据 |
| `tests/style.mjs` | 全项目代码风格检查入口 |
| `tests/package.mjs` | 网页离线包验证入口 |

原有 `npm run` 命令保持不变，命令内部已指向分类后的文件

## 发布产物

| 路径 | 内容 |
| --- | --- |
| `releases/*.zip` | 当前网页离线包 |
| `releases/desktop/*-Setup-x64.exe` | 当前桌面安装包 |
| `releases/desktop/*-Portable-x64.exe` | 当前桌面免安装程序 |
| `releases/desktop/latest.yml`、`*.blockmap` | 与当前安装包配套的自动更新文件 |
| `releases/desktop/win-unpacked/` | 桌面构建生成的解包目录，供本地验证 |
| `releases/desktop/.icon-ico/`、`builder-debug.yml` | 打包工具生成的缓存与诊断 |
| `releases/archive/1.8.3/` | 历史版本归档，网页包与桌面包分别保存 |

发布时使用同一次构建的 EXE、`.blockmap` 和 `latest.yml`，不要从历史归档中混取更新文件。后续打包沿用原输出路径，历史归档按需整理

## 本地报告

| 路径 | 内容 |
| --- | --- |
| `reports/screenshots/` | 浏览器测试截图及测试导出的 JSON |
| `reports/chip-audit/` | 芯片核查结果与引脚复核图片 |
| `reports/chip-reference/` | 芯片参考数据 |
| `reports/lesson-audit/` | 课件核查结果 |
| `reports/archive/screenshots/` | 以前保留的测试截图 |
| `reports/release-notes/` | 历史发布说明草稿 |

`assets/screenshots/` 是 README 使用的展示图片，`reports/screenshots/` 是测试报告，两者不能混用。未经明确要求，不更新展示图片

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 生成网页脚本、示例与接线说明 |
| `npm run lint` | 检查代码风格 |
| `npm test` | 完整逻辑测试 |
| `npm run test:ui` | 浏览器与 RAM 实验操作测试 |
| `npm run test:updates` | 更新、发布说明和窗口加载测试 |
| `npm run test:desktop` | 桌面运行与存档测试 |
| `npm run test:startup` | 桌面或便携程序三次启动耗时测量 |
| `npm run test:package` | 网页离线包验证 |
| `npm run package` 或 `package.cmd` | 生成网页离线包 |
| `npm run desktop:package` 或 `package-desktop.cmd` | 生成安装版、免安装版和更新文件 |

工作区整理不改变浏览器或桌面程序保存的个人实验，也不自动修改 GitHub Release
