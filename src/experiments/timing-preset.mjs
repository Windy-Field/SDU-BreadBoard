import { emptyProject } from "../board/board.mjs";
import timingWires from "./timing-wires.json" with { type: "json" };

export const TIMING_EXPERIMENT_ID = "timing-system-example";
export const TIMING_EXPERIMENT_NAME = "实验四 时序系统";

// 上排放输出所需的译码器和反相器，下排放需要接输入的时序芯片
const TIMING_CHIPS = [
    { id: "U1", model: "74LS161", section: 2, column: 12 },
    { id: "U2", model: "74LS138", section: 1, column: 12 },
    { id: "U3", model: "74LS194", section: 2, column: 40 },
    { id: "U4", model: "74LS04", section: 1, column: 41 }
];
const PORTS = { load: 5, inputs: 6, outputs: 8 };

const TIMING_NOTES = `# 实验四 时序系统

## 端口分配

| 端口 | 用途 |
| --- | --- |
| K3～K0 | 并行输入 A、B、C、D，启动时设为 0001 |
| K4 | 0 清零，1 解除清零 |
| K5 | 1 并行装载，0 循环左移 |
| P+ | 时钟，按一次推进一步 |
| L0～L3 | 节拍 T0～T3，对应 74LS194 的 QD、QC、QB、QA |
| L4～L7 | 工作脉冲 M0～M3，高电平时亮起 |

## 启动与观察

1. 打开电源，选择单脉冲模式。把 K4 拨到 0、K5 拨到 1，再将 K3～K0 设为 0001。此时节拍灯全灭，只有 M0 亮起。
2. 把 K4 拨到 1，按一次 P+。寄存器装入了 0001，此时 T0 和 M0 一起亮起。
3. 把 K5 拨到 0。在「时序」里按顺序选中 L0～L7，点「开始」，然后逐次按 P+。M0 亮着时，节拍灯会依次显示 T0～T3。T3 亮起后，再按一次 P+，工作脉冲切到 M1，节拍回到 T0。
4. 从开始记录算起，按 16 次 P+ 后回到 T0、M0。重新打开存档或断电后，从第 1 步重新初始化。

74LS161 的 Q2、Q3 分别接到 74LS138 的地址低位和高位。译码输出反相后得到 M0～M3。74LS194 与计数器共用 P+ 时钟，QA 回接到 SL，使高电平在四个节拍输出之间循环。K5 也经过反相后接到计数器的 LOAD 端，装载时让计数器和寄存器同时回到起始状态。
`;

// 生成最新实验四，沿用验收存档的孔位、线色和路径
export function timingPreset() {
    const project = emptyProject();
    project.name = TIMING_EXPERIMENT_NAME;
    project.notes = TIMING_NOTES;
    project.inputCount = PORTS.inputs;
    project.outputCount = PORTS.outputs;
    project.switches[0] = 1;
    project.switches[PORTS.load] = 1;
    project.chips = structuredClone(TIMING_CHIPS);
    project.wires = structuredClone(timingWires);
    return project;
}
