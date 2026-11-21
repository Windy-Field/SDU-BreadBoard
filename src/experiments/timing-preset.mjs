import { CHIP_MODELS } from "../chips/chips.mjs";
import { emptyProject, WIRE_COLORS } from "../board/board.mjs";
import { connect } from "./preset-wiring.mjs";
import timingRoutes from "./timing-routes.json" with { type: "json" };

export const TIMING_EXPERIMENT_ID = "timing-system-example";
export const TIMING_EXPERIMENT_NAME = "实验四 时序系统";

// 上排放输出所需的译码器和反相器，下排放需要接输入的时序芯片
const TIMING_CHIPS = [
    { id: "U1", model: "74LS161", section: 2, column: 12 },
    { id: "U2", model: "74LS138", section: 1, column: 12 },
    { id: "U3", model: "74LS194", section: 2, column: 40 },
    { id: "U4", model: "74LS04", section: 1, column: 41 }
];
const PORTS = { reset: 4, load: 5, inputs: 6, outputs: 8, firstPhase: 4 };
// 并行数据和节拍按低位到高位排列，分别对应 D～A 和 QD～QA
const DATA_PINS = [6, 5, 4, 3];
const BEAT_PINS = [12, 13, 14, 15];
const HIGH_PINS = ["U1-7", "U1-10", "U2-6", "U3-10"];
const LOW_PINS = ["U4-13", "U2-3", "U2-4", "U2-5", "U1-3", "U1-4", "U1-5", "U1-6", "U3-2"];
const COLORS = {
    power: WIRE_COLORS[0], ground: WIRE_COLORS[7], data: WIRE_COLORS[2],
    control: WIRE_COLORS[4], clock: WIRE_COLORS[6], beat: WIRE_COLORS[1], phase: WIRE_COLORS[5]
};

const TIMING_NOTES = `# 实验四 时序系统

## 端口分配

| 端口 | 用途 |
| --- | --- |
| K3～K0 | 并行输入 A、B、C、D，预置 0001 |
| K4 | 0 清零计数器和移位寄存器，1 解除清零 |
| K5 | 1 并行装载，0 循环左移 |
| P+ | 计数时钟，按下时计数一次 |
| L0～L3 | 节拍 M0～M3，对应 QD、QC、QB、QA |
| L4～L7 | 工作脉冲 T0～T3，高电平有效 |

## 启动与观察

1. 打开电源，先用单脉冲模式。把 K4 拨到 0 清零，K5 拨到 1，K3～K0 设为 0001。
2. 把 K4 拨回 1，再点一次 P+。计数器装入 0，移位寄存器装入 0001，这时 M0 和 T0 会同时亮起。
3. 把 K5 拨到 0。在右侧「时序」取消勾选 P− 和 K0（列表中写作 P- 和 K0），保留 L0，再依次勾选 L1～L7。L0～L3 对应 M0～M3，L4～L7 对应 T0～T3。点「开始」后逐次点击 P+，也可以开启连续脉冲来记录每一拍的变化。
4. 重新打开存档或断电后，从第 1 步做起。

| 工作相 | 顺序点亮的节拍 |
| --- | --- |
| T0 | M0、M1、M2、M3 |
| T1 | M0、M1、M2、M3 |
| T2 | M0、M1、M2、M3 |
| T3 | M0、M1、M2、M3 |

装载完成时亮起的是 M0 和 T0。U3 的 QA 接回 SL，所以节拍会循环。U1 的高两位 Q2、Q3 决定当前是哪一相，每四拍切到下一相。到了 T3 的 M3，再发一个脉冲就回到 T0、M0。
`;

// 连接四片芯片的电源，将固定控制脚和未使用的输入接到确定电平
function connectPower(project, usage) {
    let supply = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        const supplyPin = chip.id + "-" + model.power;
        const groundPin = chip.id + "-" + model.ground;
        connect(project, usage, supply, supplyPin, COLORS.power);
        connect(project, usage, ground, groundPin, COLORS.ground);
        supply = supplyPin;
        ground = groundPin;
    }
    for (const pin of HIGH_PINS) {
        connect(project, usage, supply, pin, COLORS.power);
        supply = pin;
    }
    for (const pin of LOW_PINS) {
        connect(project, usage, ground, pin, COLORS.ground);
        ground = pin;
    }
}

// 两片时序芯片共享时钟，计数器高两位让每个工作相持续四个节拍
function connectClock(project, usage) {
    connect(project, usage, "P+", "U1-2", COLORS.clock);
    connect(project, usage, "U1-2", "U3-11", COLORS.clock);
    connect(project, usage, "U1-12", "U2-1", COLORS.phase);
    connect(project, usage, "U1-11", "U2-2", COLORS.phase);
    connect(project, usage, "K" + PORTS.reset, "U1-1", COLORS.control);
    connect(project, usage, "U1-1", "U3-1", COLORS.control);
    connect(project, usage, "K" + PORTS.load, "U3-9", COLORS.control);
    connect(project, usage, "U3-9", "U4-1", COLORS.control);
    connect(project, usage, "U4-2", "U1-9", COLORS.control);
}

// 把 QA 回接到左移串入端，四位节拍和反相后的四路工作脉冲接指示灯
function connectOutputs(project, usage) {
    connect(project, usage, "U3-15", "U3-7", COLORS.beat);
    const inverter = CHIP_MODELS["74LS04"];
    const decoder = CHIP_MODELS["74LS138"];
    for (let bit = 0; bit < BEAT_PINS.length; bit = bit + 1) {
        const dataPin = DATA_PINS[bit];
        const beatPin = BEAT_PINS[bit];
        const gate = inverter.gates[bit + 1];
        connect(project, usage, "K" + bit, "U3-" + dataPin, COLORS.data);
        connect(project, usage, "U3-" + beatPin, "L" + bit, COLORS.beat);
        connect(project, usage, "U2-" + decoder.outputs[bit], "U4-" + gate[0], COLORS.phase);
        connect(project, usage, "U4-" + gate[2], "L" + (bit + PORTS.firstPhase), COLORS.phase);
    }
}

// 生成可以直接打开的时序系统存档，初始保持清零并预置并行输入
export function timingPreset() {
    const project = emptyProject();
    project.name = TIMING_EXPERIMENT_NAME;
    project.notes = TIMING_NOTES;
    project.inputCount = PORTS.inputs;
    project.outputCount = PORTS.outputs;
    project.switches[0] = 1;
    project.switches[PORTS.load] = 1;
    project.chips = structuredClone(TIMING_CHIPS);
    const usage = {};
    connectPower(project, usage);
    connectClock(project, usage);
    connectOutputs(project, usage);
    for (const wire of project.wires) {
        if (Object.hasOwn(timingRoutes, wire.id)) {
            wire.bends = structuredClone(timingRoutes[wire.id]);
        }
    }
    return project;
}
