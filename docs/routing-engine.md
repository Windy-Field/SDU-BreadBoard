# 布线引擎

## 实现与来源

项目接入了 libavoid-js 0.5.0-beta.5，通过 WebAssembly 运行 libavoid 的正交布线引擎

- JS 移植项目：<https://github.com/Aksem/libavoid-js>
- npm 版本对应提交：`5062a42fbd82fff562afeebcbb7b1ed45eed8e75`
- 移植项目使用的 C++ 源码：<https://github.com/Aksem/adaptagrams/tree/v1.0.4>
- libavoid 官方接口说明：<https://www.adaptagrams.org/documentation/>

## 路径处理

`src/routing.mjs` 为芯片建立障碍，将导线真实端点交给引擎。引擎统一计算正交路径和线间距，返回后补齐准确的插孔端点，并检查路线是否穿过芯片

当你确认“整理走线”后，引擎会重新规划全部导线。逐根接线时，程序只采用新线的结果，并将已有路径节点作为约束。手动指定的中间点也会成为必经点

45° 短斜角在引擎输出的横竖路径上处理，斜角长度最多为根号二个孔距。芯片避让、路径点数和插孔端点均需要通过检查后才提交，失败时保留原实验

## 离线构建

构建命令为 `npm run build`，首次构建前需运行 `npm install` 安装依赖

构建程序会读取固定版本依赖中的原版 WebAssembly，将字节转成数据地址，再打入 `application.js`。浏览器通过内嵌的数据地址初始化引擎，保留了双击入口文件的离线使用方式

你可以修改 `src/routing-runtime.mjs` 更换引擎加载方式，也可以修改 `src/routing.mjs` 的参数后重新构建

## 许可证与源代码

libavoid-js 与 libavoid 按 LGPL-2.1-or-later 发布。项目保留了原始引擎，适配代码位于 `src/`，许可证保存在 `vendor/libavoid.LICENSE`

离线包和仓库都附带了以下对应源码归档，供查看和重新构建依赖

- `vendor/libavoid-js-source.tar.gz`：上述 JS 移植提交，包含绑定代码与构建脚本
- `vendor/libavoid-source.tar.gz`：移植项目引用的 Adaptagrams v1.0.4 源码

项目的引擎适配层、构建脚本和锁定版本保存在仓库中，你可以替换依赖后重新生成离线脚本
