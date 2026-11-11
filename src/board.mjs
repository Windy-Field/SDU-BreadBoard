import { CHIP_MODELS } from "./chips.mjs";

export const BOARD = { columns: 59, sections: 4, startX: 90, pitch: 18, startY: 116, sectionHeight: 250, width: 1300, height: 1215, panelLeft: 42, panelWidth: 1132 };
export const PORT_LAYOUT = { lowestColumn: 49, columnStep: 2, positiveColumn: 53, negativeColumn: 57, outputY: 68, inputY: 1105 };
export const ROWS = "ABCDEFGHIJ";
export const BUS_ROWS = "XY";
export const BUS_SEGMENTS = [[1, 17], [19, 41], [43, 59]];
export const IO_LIMIT = 24;
export const NOTES_LIMIT = 50000;
export const GENERAL_NOTES = "# 电路说明\n\n## 功能\n\n填写这个电路的用途\n\n## 输入口\n\n| 端口 | 作用 |\n| --- | --- |\n| K0 | 待填写 |\n\n## 输出口\n\n| 端口 | 作用 |\n| --- | --- |\n| L0 | 待填写 |\n\n## 操作步骤\n\n1. 检查供电和接线\n2. 设置输入，观察输出\n";
export const WIRE_COLORS = ["#dc3545", "#1976d2", "#16845b", "#d68a0b", "#8b55c5", "#0d939d", "#d44f93", "#46515f", "#93a619", "#e26c2b", "#8494a7", "#65483d"];

// 将面包板列号转换为横坐标，插孔、接口和脉冲端口共用这个网格
export function columnX(column) {
    return BOARD.startX + (column - 1) * BOARD.pitch;
}

// 返回指定板块和字母行的纵坐标，沟槽两边各有五排孔
export function rowY(section, row) {
    if (row === "X") {
        return BOARD.startY + section * BOARD.sectionHeight - 16;
    }
    if (row === "Y") {
        return BOARD.startY + section * BOARD.sectionHeight + 193;
    }
    let offset = ROWS.indexOf(row) * 15;
    if (ROWS.indexOf(row) >= 5) {
        offset = offset + 35;
    }
    return BOARD.startY + section * BOARD.sectionHeight + offset;
}

// 判断横向母线在这一列是否真的有孔，每五个孔之后留一个空位
export function busHasHole(column) {
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns && column % 6 !== 0;
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

// 返回插孔所在的内部连通组，同列五孔相通，沟槽两侧分开
export function baseNode(name) {
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
        let horizontal = 1210;
        if (parts[1] === "VCC") {
            horizontal = 1242;
        }
        return { x: horizontal, y: 102 + Number(parts[2]) * 18 };
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
        return { x: 1210, y: PORT_LAYOUT.inputY };
    }
    return { x: 1242, y: PORT_LAYOUT.inputY };
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
    for (let index = 0; index < 24; index = index + 1) {
        switches.push(0);
    }
    return { version: 1, inputCount: 8, outputCount: 8, notes: GENERAL_NOTES, name: "未命名电路", chips: [], wires: [], pullUps: [], switches: switches, power: true };
}

// 复制电路的可保存数据，不复制仿真过程中的临时状态
export function copyProject(project) {
    return JSON.parse(JSON.stringify(project));
}
