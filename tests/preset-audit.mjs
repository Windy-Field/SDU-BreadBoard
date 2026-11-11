import { CHIP_MODELS } from "../src/chips.mjs";
import { pinHole, IO_LIMIT } from "../src/board.mjs";
import { buildTopology, nodeFor } from "../src/engine.mjs";
import { complementPreset } from "../src/presets.mjs";

// 收集电路中的电源、输入输出口和每一片芯片引脚，返回实际连接端点
function terminalMap(project) {
    const terminals = {};
    for (const name of ["VCC", "GND", "P+", "P-"]) {
        terminals[name] = name;
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        terminals["K" + index] = "K" + index;
        terminals["L" + index] = "L" + index;
    }
    for (const chip of project.chips) {
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
            terminals[chip.id + "-" + pin] = pinHole(chip, pin);
        }
    }
    return terminals;
}

// 按真实电气连通关系核对标准补码实验，不把线色或折线路径当作接线错误
export function auditComplement(project) {
    const reference = complementPreset();
    const issues = [];
    for (const expected of reference.chips) {
        let found = false;
        for (const chip of project.chips) {
            if (chip.id === expected.id && chip.model === expected.model) {
                found = true;
            }
        }
        if (!found) {
            issues.push(expected.id + " 应为 " + expected.model + "，请检查芯片型号和编号");
        }
    }
    if (project.chips.length !== reference.chips.length) {
        issues.push("标准实验使用 5 片芯片，当前有 " + project.chips.length + " 片");
    }
    if (issues.length > 0) {
        return issues;
    }
    const actualTerminals = terminalMap(project);
    const expectedTerminals = terminalMap(reference);
    const actualTopology = buildTopology(project);
    const expectedTopology = buildTopology(reference);
    const names = Object.keys(expectedTerminals);
    for (let first = 0; first < names.length; first = first + 1) {
        for (let second = first + 1; second < names.length; second = second + 1) {
            const firstName = names[first];
            const secondName = names[second];
            const expectedSame = nodeFor(expectedTopology, expectedTerminals[firstName]) === nodeFor(expectedTopology, expectedTerminals[secondName]);
            const actualSame = nodeFor(actualTopology, actualTerminals[firstName]) === nodeFor(actualTopology, actualTerminals[secondName]);
            if (expectedSame !== actualSame) {
                let message = firstName + " 与 " + secondName + " 应当连通，请检查这条通路";
                if (actualSame) {
                    message = firstName + " 与 " + secondName + " 被额外接通，请检查相关导线";
                }
                issues.push(message);
            }
        }
    }
    return issues;
}
