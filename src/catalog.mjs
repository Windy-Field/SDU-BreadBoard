import { DOCUMENT_REFERENCES } from "./document-references.mjs";

// 原厂资料的本地文件名、页码和功能说明，图片路径由资料面板统一生成
export const CHIP_REFERENCES = {
    "74LS273": { file: "sn74ls273", page: 1, summary: "它能同时保存八位数据。清零脚拉低时，全部输出变为 0；清零脚保持高电平时，时钟上升沿把 D 输入保存到 Q 输出" },
    "74LS283": { file: "sn74ls283", page: 1, summary: "它把两个四位数与输入进位 C0 相加，输出四位和以及进位 C4。A1、B1、Σ1 对应最低位" },
    "74LS86": { file: "sn74ls86a", page: 1, summary: "它包含四个独立的异或门。两个输入不同时输出 1，相同时输出 0。原厂 LS86A 资料中的这组 DIP 引脚与实验材料一致" },
    "74LS00": { file: "sn74ls00", page: 3, summary: "它包含四个独立的与非门。只有两个输入都是 1 时，输出才是 0。请按本型号的脚名接线" },
    "74LS08": { file: "sn74ls08", page: 1, summary: "它包含四个独立的与门。两个输入都是 1 时输出 1，其余情况输出 0" },
    "74LS32": { file: "sn74ls32", page: 1, summary: "它包含四个独立的或门。至少一个输入为 1 时输出 1" },
    "74LS04": { file: "sn74ls04", page: 1, summary: "它包含六个独立的非门。输入为 0 时输出 1，输入为 1 时输出 0" }
};

// 只加入新型号的文档资料，原有芯片的原厂图和介绍保持不变
for (const model of Object.keys(DOCUMENT_REFERENCES)) {
    CHIP_REFERENCES[model] = DOCUMENT_REFERENCES[model];
}
