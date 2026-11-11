import { CHIP_MODELS } from "./chips.mjs";
import { emptyProject, holeId, pinHole, portHole, WIRE_COLORS } from "./board.mjs";
import presetRoutes from "./preset-routes.json" with { type: "json" };

// 标准示例的芯片位置，改变位置后需重新生成路径并运行接线验证
const PRESET_CHIPS = [
    { id: "U1", model: "74LS273", section: 1, column: 24 },
    { id: "U2", model: "74LS283", section: 2, column: 16 },
    { id: "U3", model: "74LS283", section: 2, column: 39 },
    { id: "U4", model: "74LS86", section: 1, column: 3 },
    { id: "U5", model: "74LS86", section: 1, column: 44 }
];
// 以下为固定引脚接法，不是可随意改变的显示选项
const UNUSED_INPUTS = ["U1-17", "U1-18", "U3-14", "U3-15", "U3-12", "U3-11", "U5-9", "U5-10", "U5-12", "U5-13"];
const INPUT_PINS = [1, 4, 9, 12];
const OUTPUT_PINS = [3, 6, 8, 11];
const ADDER_PINS = [6, 2, 15, 11];
const CONTROL_PINS = ["U4-2", "U4-5", "U4-10", "U4-13", "U5-2", "U2-7"];
const SUM_CONNECTIONS = [["U2-4", "U1-3"], ["U2-1", "U1-4"], ["U2-13", "U1-7"], ["U2-10", "U1-8"], ["U3-4", "U1-13"], ["U3-1", "U1-14"]];
const FEEDBACK_CONNECTIONS = [["U1-2", "U2-5"], ["U1-5", "U2-3"], ["U1-6", "U2-14"], ["U1-9", "U2-12"], ["U1-12", "U3-5"], ["U1-15", "U3-3"]];
const REGISTER_OUTPUTS = [2, 5, 6, 9, 12, 15];
// 新载入示例的端口显示数量，包含清零控制与溢出指示
const PRESET_PORT_COUNT = 7;
// 示例备注模板，与构建生成的接线文档共用
export const COMPLEMENT_NOTES = `# 双符号位补码运算器

## 功能

连续进行补码加、减运算。U1（74LS273）保存 **两个符号位和四个数值位**，共六位，并把结果反馈到下一轮运算。U2、U3（74LS283）计算数值位和符号位，U4、U5（74LS86）负责输入取反和溢出判断

## 输入口

| 端口 | 作用 |
| --- | --- |
| K0、K1、K2、K3 | 输入补码的低四位，K0 最低位 |
| K4 | 输入符号位；电路将此位复制成两个符号位 |
| K5 | 0 为加法，1 为减法 |
| K6 | 0 异步清零，正常运算保持 1 |
| P− | 完整负脉冲结束时的上升沿，保存本次结果 |
| P+ | 本示例未连接，不会加载结果 |

输入顺序为 **K4 K3 K2 K1 K0**，使用五位补码，范围为 −16～15。例：7 为 00111，−12 为 10100，−2 为 11110。减去 6 时输入正数 00110，再把 K5 设置为 1

## 输出口

| 端口 | 作用 |
| --- | --- |
| L5 | 高符号位 |
| L4 | 低符号位 |
| L3、L2、L1、L0 | 结果的四个数值位，L0 最低位 |
| L6 | 两个符号位异或的结果，1 表示当前结果溢出 |

按 **L5 L4｜L3 L2 L1 L0** 读取。符号 00、11 为未溢出，01 为正溢出，10 为负溢出。所有输入、输出指示灯均为 **已知高电平 1 亮**；X 或 Z 不按高电平点亮

## 操作步骤

1. 打开电源，将 K6 切到 0 再切回 1，L6～L0 应显示 000 0000
2. 设置 K4～K0 和加减控制 K5，保持输入稳定
3. 发一次完整 P− 脉冲，再读取 L5～L0 的六位结果；L6 单独指示溢出
4. 重复输入和发脉冲，进行连续运算。单独改变输入不会更新累计结果

## 验收

| 算式 | 每次脉冲后的累计结果 |
| --- | --- |
| 7＋5−6＋12 | 00 0111 → 00 1100 → 00 0110 → **01 0010**（正溢出） |
| （−12）＋（−2）−6 | 11 0100 → 11 0010 → **10 1100**（负溢出） |

## 走线与线色

输入输出板上没有接线孔，K、L、P 信号直接连到对应的面包板列。所有导线只插面包板孔或右侧电源轨孔，端口与孔位对应关系见接线说明

第四块面包板的输入与脉冲对应列通过细线桥接，上下 A～J 的空孔可读取同一信号，其他列及 X/Y 母线保持隔离

红色为电源，深灰为地，绿色为数值输入，紫色为加减控制和进位，蓝色为计算结果，黄色为寄存器反馈，青色为 LED 输出，粉色为清零和时钟

导线沿分开的通道绕开芯片外框。交叉处没有接点，只有导线两端插入的孔参与连接。你可以点击左侧“整理走线”，确认后调整当前电路的路径；芯片位置、端点、线色和备注保持不变，随后可撤销

重新加载文件、断电或撤销后，寄存器易失状态不保留，需要再次清零。这是理想数字逻辑模型，不模拟电流、按键抖动和实际传播时延
`;

// 在同一个芯片脚的五孔组中分配空孔，返回可接线的物理孔名
function allocatePin(project, usage, name) {
    if (!name.startsWith("U")) {
        const hole = portHole(name);
        if (hole !== "") {
            return hole;
        }
        return name;
    }
    const parts = name.split("-");
    let chip = null;
    for (const candidate of project.chips) {
        if (candidate.id === parts[0]) {
            chip = candidate;
        }
    }
    const pin = Number(parts[1]);
    const hole = pinHole(chip, pin);
    const position = hole.split(":");
    let rows = "GHIJ";
    if (pin > CHIP_MODELS[chip.model].count / 2) {
        rows = "DCBA";
    }
    let index = 0;
    if (Object.hasOwn(usage, name)) {
        index = usage[name];
    }
    if (index >= rows.length) {
        throw new Error("示例电路的同列空孔不足");
    }
    usage[name] = index + 1;
    return holeId(chip.section, rows[index], Number(position[2]));
}

// 为示例增加一根导线，按物理孔分配端点
function connect(project, usage, first, second, color) {
    const from = allocatePin(project, usage, first);
    const to = allocatePin(project, usage, second);
    const number = project.wires.length + 1;
    project.wires.push({ id: "W" + number, from: from, to: to, color: WIRE_COLORS[color], bends: [] });
}

// 创建已接好的双符号位补码运算器，电气端点与显示路径分别维护
export function complementPreset() {
    const project = emptyProject();
    project.inputCount = PRESET_PORT_COUNT;
    project.outputCount = PRESET_PORT_COUNT;
    project.notes = COMPLEMENT_NOTES;
    project.name = "双符号位补码运算器";
    project.chips = structuredClone(PRESET_CHIPS);
    const usage = {};
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        const powerPin = chip.id + "-" + model.power;
        const groundPin = chip.id + "-" + model.ground;
        connect(project, usage, power, powerPin, 0);
        connect(project, usage, ground, groundPin, 7);
        power = powerPin;
        ground = groundPin;
    }
    for (const pin of UNUSED_INPUTS) {
        connect(project, usage, ground, pin, 7);
        ground = pin;
    }
    for (let bit = 0; bit < 4; bit = bit + 1) {
        connect(project, usage, "K" + bit, "U4-" + INPUT_PINS[bit], 2);
        connect(project, usage, "U4-" + OUTPUT_PINS[bit], "U2-" + ADDER_PINS[bit], 2);
    }
    connect(project, usage, "K4", "U5-1", 2);
    let control = "K5";
    for (const pin of CONTROL_PINS) {
        connect(project, usage, control, pin, 4);
        control = pin;
    }
    connect(project, usage, "U5-3", "U3-6", 4);
    connect(project, usage, "U3-6", "U3-2", 4);
    connect(project, usage, "U2-9", "U3-7", 4);
    for (const pair of SUM_CONNECTIONS) {
        connect(project, usage, pair[0], pair[1], 1);
    }
    for (const pair of FEEDBACK_CONNECTIONS) {
        connect(project, usage, pair[0], pair[1], 3);
    }
    for (let bit = 0; bit < 6; bit = bit + 1) {
        connect(project, usage, "U1-" + REGISTER_OUTPUTS[bit], "L" + bit, 5);
    }
    connect(project, usage, "U1-12", "U5-4", 5);
    connect(project, usage, "U1-15", "U5-5", 5);
    connect(project, usage, "U5-6", "L6", 5);
    connect(project, usage, "K6", "U1-1", 6);
    connect(project, usage, "P-", "U1-11", 6);
    for (const wire of project.wires) {
        if (Object.hasOwn(presetRoutes, wire.id)) {
            wire.bends = structuredClone(presetRoutes[wire.id]);
        }
    }
    project.switches[6] = 1;
    return project;
}

