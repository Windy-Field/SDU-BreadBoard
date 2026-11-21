import { DOCUMENT_REFERENCES } from "./document-references.mjs";

// 原厂资料的本地文件名、页码和功能说明，图片路径由资料面板统一生成
export const CHIP_REFERENCES = {
    "74LS273": { file: "sn74ls273", page: 1, summary: "这片寄存器能同时保存八位数据。把清零脚拉低，八路输出都会立即变成 0。清零脚为高电平时，寄存器在时钟上升沿把 D 上的数据存下来，再从 Q 输出。" },
    "74LS283": { file: "sn74ls283", page: 1, summary: "把两个四位数和输入进位 C0 加起来，就得到四位和与输出进位 C4。A1、B1 和 Σ1 都对应最低位。" },
    "74LS86": { file: "sn74ls86a", page: 1, summary: "片内有四个独立的异或门。每个门在两个输入不同时输出 1，相同时输出 0。图中的 TI LS86A DIP 脚位与实验材料一致。" },
    "74LS00": { file: "sn74ls00", page: 3, summary: "片内有四个独立的与非门。对每个门来说，只有两个输入都是 1，输出才会变成 0。接线时可以按图中的脚名找到对应引脚。" },
    "74LS08": { file: "sn74ls08", page: 1, summary: "片内有四个独立的与门。对每个门来说，两个输入都为 1 时，输出才是 1，其余情况下输出 0。" },
    "74LS32": { file: "sn74ls32", page: 1, summary: "片内有四个独立的或门。对每个门来说，只要至少有一个输入是 1，输出就是 1。" },
    "74LS04": { file: "sn74ls04", page: 1, summary: "片内的六个非门各自工作。每个门都会把输入反过来，输入 0 就输出 1，输入 1 就输出 0。" },
    "74LS138": { file: "sn74ls138", page: 1, summary: "A、B、C 分别是地址的低位、中间位和高位。G1=1 且 G2A′、G2B′ 都为 0 时，地址选中的那一路输出低电平，其余七路输出高电平。禁止译码时，八路都保持高电平。" },
    "74LS194": { file: "sn74ls194a", page: 1, summary: "这片四位寄存器可以向左或向右移位。把 CLR′ 拉低就会立即清零。CLK 出现上升沿时，S1S0 为 00 就保持原值，为 01 就右移（SR 串入 QA），为 10 就左移（SL 串入 QD），为 11 就并行装载。" }
};

// 只加入新型号的文档资料，原有芯片的原厂图和介绍保持不变
for (const model of Object.keys(DOCUMENT_REFERENCES)) {
    CHIP_REFERENCES[model] = DOCUMENT_REFERENCES[model];
}

// 先比较型号系列，再比较末尾数字，让74LS系列按器件编号自然排列
function compareChipNames(first, second) {
    const firstFamily = first.replace(/[0-9]+$/, "");
    const secondFamily = second.replace(/[0-9]+$/, "");
    const familyOrder = firstFamily.localeCompare(secondFamily, "en");
    if (familyOrder !== 0) {
        return familyOrder;
    }
    return first.localeCompare(second, "en", { numeric: true });
}

// 返回排序后的型号列表，不改变芯片模型的登记顺序
export function sortedChipNames() {
    const names = Object.keys(CHIP_REFERENCES);
    names.sort(compareChipNames);
    return names;
}
