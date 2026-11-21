import { CHIP_MODELS } from "../chips/chips.mjs";
import { emptyProject, WIRE_COLORS } from "../board/board.mjs";
import { connect } from "./preset-wiring.mjs";
import ramRoutes from "./ram-routes.json" with { type: "json" };

// RAM示例的布局和配色，电源、地址、数据与控制各用独立线色
const RAM_CHIPS = [
    { id: "U1", model: "6116", section: 1, column: 10 },
    { id: "U2", model: "6116", section: 1, column: 39 },
    { id: "U3", model: "74LS244", section: 2, column: 40 },
    { id: "U4", model: "74LS138", section: 2, column: 12 }
];
const RAM_COLORS = {
    power: WIRE_COLORS[0],
    ground: WIRE_COLORS[7],
    dataInput: WIRE_COLORS[2],
    dataBus: WIRE_COLORS[1],
    address: WIRE_COLORS[3],
    select: WIRE_COLORS[5],
    control: WIRE_COLORS[4]
};

// 示例端口分工，读写控制均低有效，隔离控制为高时244退出总线
export const RAM_INPUTS = { dataStart: 0, addressStart: 8, bank: 12, write: 13, read: 14, isolate: 15, count: 16 };
export const RAM_EXPERIMENT_ID = "ram-expansion-example";
export const RAM_EXPERIMENT_NAME = "实验三 RAM字扩展";
// 两片芯片之间的长线使用同列外侧空孔，给中间的地址和数据线留出间距
export const RAM_OUTER_WIRES = ["W29", "W31", "W33", "W35", "W41", "W45", "W49", "W53", "W57", "W61", "W65", "W69", "W72", "W74"];
// 仅用于识别旧版默认备注，用户自行修改过的说明不会被替换
export const PREVIOUS_RAM_NOTES = `# 实验三 RAM字扩展

## 实验目标

使用两片6116（各2K×8）和74LS138组成4K×8存储器，74LS244隔离数据开关与共享数据总线。接线依据第三次实验课件第4～8页

## 器件与地址

| 器件 | 作用 | 完整地址范围 |
| --- | --- | --- |
| U1 6116 | 第1片RAM，A11=0时选中 | 000H～7FFH |
| U2 6116 | 第2片RAM，A11=1时选中 | 800H～FFFH |
| U3 74LS244 | 两组四路缓冲器，共同控制八位数据输入 | 单向输入总线 |
| U4 74LS138 | A输入接A11，B/C接地，Y0′/Y1′分别选中U1/U2 | 两片不会同时选中 |

按课件允许的简化方式，A4～A10接地，A0～A3由开关设置，A11独立选片。可操作地址为000H～00FH及800H～80FH，每片RAM的完整容量仍为2K×8

## 开关和指示灯

| 端口 | 作用 |
| --- | --- |
| K7～K0 | 写入数据D7～D0，K0为最低位 |
| K11～K8 | 片内地址A3～A0，K8为最低位 |
| K12 | A11，0选U1，1选U2 |
| K13 | WE′，0允许写入，1结束写入 |
| K14 | OE′，0允许读出，1关闭RAM读输出 |
| K15 | 244使能，0接入数据开关，1隔离开关 |
| L7～L0 | 共享数据总线，读取时显示RAM内容 |

默认K13、K14、K15均为1，读写和数据输入均关闭，总线显示Z属于正常状态。写入时指示灯显示开关数据，必须切到读取状态才能确认RAM保存了内容

## 写入步骤

1. 保持K13=1、K14=1、K15=1，设置K12选片和K11～K8地址
2. 用K7～K0设置八位数据，设置K15=0，让244驱动数据总线
3. 设置K13=0写入，保持地址和数据稳定，再设置K13=1结束写入
4. 设置K15=1隔离数据开关。更换地址前必须确认K13=1

## 读取步骤

1. 保持K13=1、K15=1，设置K12和K11～K8选择地址
2. 设置K14=0，从L7～L0读取数据
3. 下一次写入前先设置K14=1，避免RAM与244同时驱动总线

## 课件验收

先完成以下四次写入，再集中读取核对，读取时只改变地址和选片，不重新写入

| K12 | K11～K8 | 完整地址 | 写入并预期读出的数据 |
| --- | --- | --- | --- |
| 0 | 1010 | 00AH | 01010101 |
| 0 | 0101 | 005H | 10101010 |
| 1 | 1010 | 80AH | 11111111 |
| 1 | 0101 | 805H | 00000000 |

相同片内地址在不同芯片中保存不同内容，才能证明字扩展和译码选片正确

## 现象与报告

记录四个地址的写入内容、实际读出内容和是否一致，报告写明两片RAM完整地址范围、译码接法与读写顺序。先结束写入，再隔离244，否则悬空数据可能被写入RAM并变为X。RAM读出开启时又接入244会造成驱动冲突

红色为电源，深灰为地，绿色为数据开关，蓝色为共享数据总线，黄色为地址，青色为片选，紫色为读写与隔离控制。交叉导线保持绝缘，电气连接由实际插孔决定

RAM内容属于易失运行状态。断电、切换实验、重新加载、导入或撤销后需要重新写入，存档保存接线、开关和备注，不保存已写入的数据。初次读取未写过的地址会显示X，不能据此判断接线错误
`;

export const RAM_NOTES = `# RAM 字扩展操作

## 开关

| 端口 | 用途 |
| --- | --- |
| K7～K0 | 写入数据，高位在左 |
| K11～K8 | 片内地址，高位在左 |
| K12 | 0选第一片，1选第二片 |
| K13 | 0写入，1停止写入 |
| K14 | 0读出，1关闭读出 |
| K15 | 0接入数据开关，1隔离数据开关 |
| L7～L0 | 读出结果 |

## 写入

1. 打开电源，把 K13、K14 和 K15 都拨到 1。
2. 用 K12 选芯片，用 K11～K8 设地址，再用 K7～K0 设数据。
3. 把 K15 拨到 0，让数据开关接到总线上。
4. 把 K13 拨到 0，再拨回 1，数据就写进去了。
5. 把 K15 拨回 1，将数据开关与总线隔开。

重复第 2～5 步，把下面四组数据都写完。

## 验收数据

| K12 | K11～K8 | K7～K0 |
| --- | --- | --- |
| 0 | 1010 | 01010101 |
| 0 | 0101 | 10101010 |
| 1 | 1010 | 11111111 |
| 1 | 0101 | 00000000 |

## 读取

保持 K13 和 K15 为 1，把 K14 拨到 0。接着只切换选片 K12 和地址 K11～K8，看看 L7～L0 显示的数据和表中是否一致。

要再次写入，先把 K14 拨回 1。整个过程用不到 P+ 或 P−。

## 提醒

先结束写入，再将数据开关与总线隔开。Z 表示总线没有被驱动，读到没写过的地址会显示 X。实验存档只记录接线等设置，RAM 里的数据在断电、刷新或切换实验后需要重新写入。
`;

// 连接所有芯片电源，并将未使用地址和译码控制接到确定电平
function connectPower(project, usage) {
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        const powerPin = chip.id + "-" + model.power;
        const groundPin = chip.id + "-" + model.ground;
        connect(project, usage, power, powerPin, RAM_COLORS.power);
        connect(project, usage, ground, groundPin, RAM_COLORS.ground);
        power = powerPin;
        ground = groundPin;
    }
    for (const id of ["U1", "U2"]) {
        const memory = CHIP_MODELS["6116"].memory;
        for (let bit = 4; bit < memory.address.length; bit = bit + 1) {
            const pin = id + "-" + memory.address[bit];
            connect(project, usage, ground, pin, RAM_COLORS.ground);
            ground = pin;
        }
    }
    for (const pin of [2, 3, 4, 5]) {
        const endpoint = "U4-" + pin;
        connect(project, usage, ground, endpoint, RAM_COLORS.ground);
        ground = endpoint;
    }
    connect(project, usage, power, "U4-6", RAM_COLORS.power);
}

// 两片RAM共享四位片内地址，A11经138译码后只选中其中一片
function connectAddresses(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    for (let bit = 0; bit < 4; bit = bit + 1) {
        const firstPin = "U1-" + memory.address[bit];
        const secondPin = "U2-" + memory.address[bit];
        const input = "K" + (RAM_INPUTS.addressStart + bit);
        connect(project, usage, input, firstPin, RAM_COLORS.address);
        connect(project, usage, firstPin, secondPin, RAM_COLORS.address);
    }
    connect(project, usage, "K" + RAM_INPUTS.bank, "U4-1", RAM_COLORS.address);
    connect(project, usage, "U4-15", "U1-18", RAM_COLORS.select);
    connect(project, usage, "U4-14", "U2-18", RAM_COLORS.select);
}

// 每位数据经244进入共享总线，两片RAM和同一位指示灯接在同一网络
function connectData(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    const buffer = CHIP_MODELS["74LS244"];
    for (let bit = 0; bit < memory.data.length; bit = bit + 1) {
        const gate = buffer.gates[bit];
        const input = "K" + (RAM_INPUTS.dataStart + bit);
        const firstPin = "U1-" + memory.data[bit];
        const secondPin = "U2-" + memory.data[bit];
        connect(project, usage, input, "U3-" + gate[1], RAM_COLORS.dataInput);
        connect(project, usage, "U3-" + gate[2], secondPin, RAM_COLORS.dataBus);
        connect(project, usage, secondPin, firstPin, RAM_COLORS.dataBus);
        connect(project, usage, firstPin, "L" + bit, RAM_COLORS.dataBus);
    }
}

// 读写控制分别共用，244两组使能接同一个隔离开关
function connectControls(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    connect(project, usage, "K" + RAM_INPUTS.write, "U1-" + memory.write, RAM_COLORS.control);
    connect(project, usage, "U1-" + memory.write, "U2-" + memory.write, RAM_COLORS.control);
    connect(project, usage, "K" + RAM_INPUTS.read, "U1-" + memory.read, RAM_COLORS.control);
    connect(project, usage, "U1-" + memory.read, "U2-" + memory.read, RAM_COLORS.control);
    connect(project, usage, "K" + RAM_INPUTS.isolate, "U3-1", RAM_COLORS.control);
    connect(project, usage, "U3-1", "U3-19", RAM_COLORS.control);
}

// 只移动芯片同列的导线端点，返回修改后的孔位，其他端点保持不变
function outerHole(endpoint) {
    const parts = endpoint.split(":");
    if (parts[0] !== "B1") {
        return endpoint;
    }
    if (parts[1] === "C" || parts[1] === "D") {
        return parts[0] + ":A:" + parts[2];
    }
    if (parts[1] === "G" || parts[1] === "H") {
        return parts[0] + ":J:" + parts[2];
    }
    return endpoint;
}

// 创建课件要求的RAM字扩展实验，初始禁止读写，不预置RAM内容
export function ramPreset(useOuterHoles = true) {
    const project = emptyProject();
    project.name = RAM_EXPERIMENT_NAME;
    project.notes = RAM_NOTES;
    project.inputCount = RAM_INPUTS.count;
    project.outputCount = 8;
    project.chips = structuredClone(RAM_CHIPS);
    const usage = {};
    connectPower(project, usage);
    connectAddresses(project, usage);
    connectData(project, usage);
    connectControls(project, usage);
    project.switches[RAM_INPUTS.write] = 1;
    project.switches[RAM_INPUTS.read] = 1;
    project.switches[RAM_INPUTS.isolate] = 1;
    for (const wire of project.wires) {
        if (useOuterHoles && RAM_OUTER_WIRES.includes(wire.id)) {
            wire.from = outerHole(wire.from);
            wire.to = outerHole(wire.to);
        }
        if (Object.hasOwn(ramRoutes, wire.id)) {
            wire.bends = structuredClone(ramRoutes[wire.id]);
        }
    }
    return project;
}
