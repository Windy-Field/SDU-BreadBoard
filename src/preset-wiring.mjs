import { CHIP_MODELS } from "./chips.mjs";
import { holeId, pinHole, portHole } from "./board.mjs";

// 为示例的芯片脚分配同列空孔，参数为电路、用孔记录和端点名称
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

// 给示例增加一根导线，按端点名称分配物理孔，颜色由所属实验指定
export function connect(project, usage, first, second, color) {
    const from = allocatePin(project, usage, first);
    const to = allocatePin(project, usage, second);
    const number = project.wires.length + 1;
    project.wires.push({ id: "W" + number, from: from, to: to, color: color, bends: [] });
}
