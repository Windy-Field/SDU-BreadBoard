import { CHIP_MODELS } from "./chips.mjs";

// 实验板结构与画布坐标，单位为逻辑像素，孔距需与实物布局保持一致
export const BOARD = {
    columns: 59,
    sections: 4,
    startX: 90,
    pitch: 18,
    startY: 116,
    sectionHeight: 250,
    width: 1300,
    height: 1215,
    panelLeft: 42,
    panelWidth: 1132,
    rowPitch: 15,
    trenchGap: 35,
    busTopOffset: -16,
    busBottomOffset: 193,
    busHolePeriod: 6
};
// 输入输出端口的位置，横坐标沿用面包板列网格
export const PORT_LAYOUT = { lowestColumn: 49, columnStep: 2, positiveColumn: 53, negativeColumn: 57, outputY: 68, inputY: 1105 };
// 右侧两列各保留 60 孔，首尾孔分别对齐第一块 X 排和最后一块 Y 排
export const RAIL_LAYOUT = {
    groundX: 1210,
    powerX: 1242,
    count: 60,
    startY: BOARD.startY + BOARD.busTopOffset,
    endY: BOARD.startY + (BOARD.sections - 1) * BOARD.sectionHeight + BOARD.busBottomOffset
};
// 固定孔排名称和母线分段，属于实验板结构
export const ROWS = "ABCDEFGHIJ";
export const BUS_ROWS = "XY";
export const BUS_SEGMENTS = [[1, 17], [19, 41], [43, 59]];
// 板载输入输出的物理数量上限
export const IO_LIMIT = 24;
// 单份备注允许的字符数
export const NOTES_LIMIT = 50000;
// 新实验默认显示的端口数与供电状态
export const PROJECT_DEFAULTS = { inputCount: 8, outputCount: 8, power: true };
// 接线布局版本，3 表示第四块板的输入对应列跨沟槽接通
export const WIRING_VERSION = 3;
// 新建实验时使用的备注模板
export const GENERAL_NOTES = "# 电路说明\n\n## 功能\n\n填写这个电路的用途\n\n## 输入口\n\n| 端口 | 作用 |\n| --- | --- |\n| K0 | 待填写 |\n\n## 输出口\n\n| 端口 | 作用 |\n| --- | --- |\n| L0 | 待填写 |\n\n## 操作步骤\n\n1. 检查供电和接线\n2. 设置输入，观察输出\n";
// 调色板默认颜色，排列顺序就是界面中的显示顺序
export const WIRE_COLORS = ["#dc3545", "#1976d2", "#16845b", "#d68a0b", "#8b55c5", "#0d939d", "#d44f93", "#46515f", "#93a619", "#e26c2b", "#8494a7", "#65483d"];

// 将面包板列号转换为横坐标，插孔、接口和脉冲端口共用这个网格
export function columnX(column) {
    return BOARD.startX + (column - 1) * BOARD.pitch;
}

// 返回指定板块和字母行的纵坐标，沟槽两边各有五排孔
export function rowY(section, row) {
    if (row === "X") {
        return BOARD.startY + section * BOARD.sectionHeight + BOARD.busTopOffset;
    }
    if (row === "Y") {
        return BOARD.startY + section * BOARD.sectionHeight + BOARD.busBottomOffset;
    }
    let offset = ROWS.indexOf(row) * BOARD.rowPitch;
    if (ROWS.indexOf(row) >= 5) {
        offset = offset + BOARD.trenchGap;
    }
    return BOARD.startY + section * BOARD.sectionHeight + offset;
}

// 判断横向母线在这一列是否真的有孔，每五个孔之后留一个空位
export function busHasHole(column) {
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns && column % BOARD.busHolePeriod !== 0;
}

// 返回横向母线的分段序号，三个分段之间不相通
export function busSegment(column) {
    for (let index = 0; index < BUS_SEGMENTS.length; index = index + 1) {
        const segment = BUS_SEGMENTS[index];
        if (column >= segment[0] && column <= segment[1]) {
            return index;
        }
    }
    return -1;
}

// 为插孔创建稳定的名称，参数为板块、字母行和列号
export function holeId(section, row, column) {
    return "B" + section + ":" + row + ":" + column;
}

// 检查端点是否合法；导入电路和界面接线使用同一套规则
export function validEndpoint(name) {
    if (typeof name !== "string") {
        return false;
    }
    if (/^(K|L)([0-9]|1[0-9]|2[0-3])$/.test(name)) {
        return true;
    }
    if (/^(P\+|P-|GND|VCC)$/.test(name)) {
        return true;
    }
    if (/^R:(GND|VCC):([0-9]|[1-4][0-9]|5[0-9])$/.test(name)) {
        return true;
    }
    const parts = name.split(":");
    if (parts.length !== 3 || !/^B[0-3]$/.test(parts[0])) {
        return false;
    }
    if (parts[1].length !== 1 || (!ROWS.includes(parts[1]) && !BUS_ROWS.includes(parts[1]))) {
        return false;
    }
    if (!/^([1-9]|[1-5][0-9])$/.test(parts[2])) {
        return false;
    }
    const column = Number(parts[2]);
    if (BUS_ROWS.includes(parts[1])) {
        return busHasHole(column);
    }
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns;
}

// 将板载信号名称对应到真实插孔，输出接最上块上半列，输入和脉冲接最下块下半列
export function portHole(name) {
    if (/^[KL]\d+$/.test(name)) {
        const bit = Number(name.slice(1));
        if (bit >= IO_LIMIT) {
            return "";
        }
        const column = PORT_LAYOUT.lowestColumn - bit * PORT_LAYOUT.columnStep;
        if (name.startsWith("L")) {
            return holeId(0, "A", column);
        }
        return holeId(BOARD.sections - 1, "J", column);
    }
    if (name === "P+") {
        return holeId(BOARD.sections - 1, "J", PORT_LAYOUT.positiveColumn);
    }
    if (name === "P-") {
        return holeId(BOARD.sections - 1, "J", PORT_LAYOUT.negativeColumn);
    }
    if (name === "GND" || name === "VCC") {
        return "R:" + name + ":" + (RAIL_LAYOUT.count - 1);
    }
    return "";
}

// 判断名称是否是可以实际插线的孔，端口名称只用于读取信号
export function isPhysicalHole(name) {
    return validEndpoint(name) && (name.startsWith("B") || name.startsWith("R:"));
}

// 判断某列是否直接接输入或脉冲信号，供连通计算与固定细线绘制共用
export function isInputColumn(column) {
    if (column === PORT_LAYOUT.positiveColumn || column === PORT_LAYOUT.negativeColumn) {
        return true;
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        const inputColumn = PORT_LAYOUT.lowestColumn - bit * PORT_LAYOUT.columnStep;
        if (column === inputColumn) {
            return true;
        }
    }
    return false;
}

// 返回内部连通组；旧布局版本仅用于导入比较，不影响当前实验的真实连接
export function baseNode(name, wiringVersion = WIRING_VERSION) {
    if (/^[KL]\d+$/.test(name) || name === "P+" || name === "P-") {
        const hole = portHole(name);
        if (hole !== "") {
            return baseNode(hole, wiringVersion);
        }
    }
    if (name === "GND" || name.startsWith("R:GND:")) {
        return "GND";
    }
    if (name === "VCC" || name.startsWith("R:VCC:")) {
        return "VCC";
    }
    if (!name.startsWith("B")) {
        return name;
    }
    const parts = name.split(":");
    if (BUS_ROWS.includes(parts[1])) {
        return parts[0] + ":" + parts[1] + ":segment" + busSegment(Number(parts[2]));
    }
    let side = "upper";
    if (ROWS.indexOf(parts[1]) >= 5) {
        side = "lower";
    }
    // 输入板占据第四块板的一半，对应列的上下五孔归入同一输入节点
    const section = Number(parts[0].slice(1));
    if (wiringVersion >= 3 && section === BOARD.sections - 1 && isInputColumn(Number(parts[2]))) {
        side = "lower";
    }
    return parts[0] + ":" + side + ":" + parts[2];
}

// 返回芯片脚占用的孔；缺口朝左时下排脚号递增，上排递减
export function pinHole(chip, pin) {
    const count = CHIP_MODELS[chip.model].count;
    const half = count / 2;
    let column = chip.column + pin - 1;
    let row = "F";
    if (pin > half) {
        column = chip.column + count - pin;
        row = "E";
    }
    return holeId(chip.section, row, column);
}

// 返回端点在画布中的位置，用于点击、连线和电平标记
export function endpointPosition(name) {
    if (name.startsWith("B")) {
        const parts = name.split(":");
        const section = Number(parts[0].slice(1));
        return { x: columnX(Number(parts[2])), y: rowY(section, parts[1]) };
    }
    if (name.startsWith("R:")) {
        const parts = name.split(":");
        let horizontal = RAIL_LAYOUT.groundX;
        if (parts[1] === "VCC") {
            horizontal = RAIL_LAYOUT.powerX;
        }
        const pitch = (RAIL_LAYOUT.endY - RAIL_LAYOUT.startY) / (RAIL_LAYOUT.count - 1);
        return { x: horizontal, y: RAIL_LAYOUT.startY + Number(parts[2]) * pitch };
    }
    if (name.startsWith("K") || name.startsWith("L")) {
        const number = Number(name.slice(1));
        const column = PORT_LAYOUT.lowestColumn - number * PORT_LAYOUT.columnStep;
        let vertical = PORT_LAYOUT.inputY;
        if (name.startsWith("L")) {
            vertical = PORT_LAYOUT.outputY;
        }
        return { x: columnX(column), y: vertical };
    }
    if (name === "P+") {
        return { x: columnX(PORT_LAYOUT.positiveColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "P-") {
        return { x: columnX(PORT_LAYOUT.negativeColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "GND") {
        return { x: RAIL_LAYOUT.groundX, y: PORT_LAYOUT.inputY };
    }
    return { x: RAIL_LAYOUT.powerX, y: PORT_LAYOUT.inputY };
}

// 返回便于阅读的孔位中文名称，原始名称仍用于保存电路
export function endpointLabel(name) {
    if (name.startsWith("B")) {
        const parts = name.split(":");
        const section = Number(parts[0].slice(1)) + 1;
        return "第" + section + "块 " + parts[1] + parts[2];
    }
    if (name.startsWith("R:")) {
        const parts = name.split(":");
        return "右侧 " + parts[1] + " 第" + (Number(parts[2]) + 1) + "孔";
    }
    return name;
}

// 检查芯片摆放范围和引脚冲突，合法返回空文字，否则返回中文原因
export function placementError(chips, candidate, ignoredId) {
    if (!Object.hasOwn(CHIP_MODELS, candidate.model)) {
        return "不支持这个芯片型号";
    }
    const half = CHIP_MODELS[candidate.model].count / 2;
    if (!Number.isInteger(candidate.section) || candidate.section < 0 || candidate.section >= BOARD.sections) {
        return "请把芯片放在已有的面包板上";
    }
    if (!Number.isInteger(candidate.column) || candidate.column < 1 || candidate.column + half - 1 > BOARD.columns) {
        return "芯片引脚超出了面包板范围";
    }
    for (const chip of chips) {
        if (chip.id === ignoredId || chip.section !== candidate.section) {
            continue;
        }
        const last = chip.column + CHIP_MODELS[chip.model].count / 2 - 1;
        const candidateLast = candidate.column + half - 1;
        if (candidate.column <= last && candidateLast >= chip.column) {
            return "此处已有芯片，请换一组空列";
        }
    }
    return "";
}

// 创建空电路；上电初始寄存器没有已知值，必须实际清零
export function emptyProject() {
    const switches = [];
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        switches.push(0);
    }
    return {
        version: 1,
        wiringVersion: WIRING_VERSION,
        inputCount: PROJECT_DEFAULTS.inputCount,
        outputCount: PROJECT_DEFAULTS.outputCount,
        notes: GENERAL_NOTES,
        name: "未命名电路",
        chips: [],
        wires: [],
        pullUps: [],
        switches: switches,
        power: PROJECT_DEFAULTS.power
    };
}

// 复制电路的可保存数据，不复制仿真过程中的临时状态
export function copyProject(project) {
    return structuredClone(project);
}
