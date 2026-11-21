import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAdder, logicGate } from "../../src/chips/chips.mjs";
import { BOARD, PORT_LAYOUT, RAIL_LAYOUT, IO_LIMIT, WIRING_VERSION, baseNode, copyProject, emptyProject, endpointPosition, validEndpoint, NOTES_LIMIT, rowY, portHole, isPhysicalHole, isInputColumn } from "../../src/board/board.mjs";
import { createRuntime, emitPulse, readEndpoint, simulate } from "../../src/simulation/engine.mjs";
import { complementPreset } from "../../src/experiments/presets.mjs";
import { STORAGE_KEY, validateProject } from "../../src/storage/storage.mjs";
import { auditComplement } from "../helpers/preset-audit.mjs";
import { CLEANUP_BACKUP_KEY, READ_ONLY_KEY, WORKSPACE_KEY, keepExperiment, loadWorkspace, validateWorkspace } from "../../src/storage/workspace.mjs";
import { objectSelected } from "../../src/board/geometry.mjs";
import { allEndpoints } from "../../src/board/render.mjs";
import original from "../fixtures/complement-original.json" with { type: "json" };

// 从六个 LED 读取结果，返回从高到低的逻辑值字符串
function readResult(result) {
    let binary = "";
    for (let bit = 5; bit >= 0; bit = bit - 1) {
        binary = binary + readEndpoint(result, "L" + bit);
    }
    return binary;
}

// 设置五位补码输入和加减控制，不发出时钟脉冲
function setInput(project, number, subtract) {
    let encoded = number;
    if (number < 0) {
        encoded = number + 32;
    }
    for (let bit = 0; bit < 5; bit = bit + 1) {
        project.switches[bit] = (encoded >> bit) & 1;
    }
    project.switches[5] = subtract;
}

// 检查门电路的基本真值和未知传播规则
function testGates() {
    for (let first = 0; first <= 1; first = first + 1) {
        for (let second = 0; second <= 1; second = second + 1) {
            assert.equal(logicGate("xor", first, second), first ^ second);
            assert.equal(logicGate("and", first, second), first & second);
            assert.equal(logicGate("or", first, second), first | second);
            assert.equal(logicGate("nand", first, second), 1 - (first & second));
            assert.equal(logicGate("not", first, second), 1 - first);
        }
    }
    assert.equal(logicGate("and", 0, "Z"), 0);
    assert.equal(logicGate("or", 1, "X"), 1);
    assert.equal(logicGate("xor", 1, "Z"), "X");
}

// 穷举四位全加器的 512 种输入，核对所有和位及进位
function testAdder() {
    const firstPins = [5, 3, 14, 12];
    const secondPins = [6, 2, 15, 11];
    const outputPins = [4, 1, 13, 10, 9];
    for (let first = 0; first < 16; first = first + 1) {
        for (let second = 0; second < 16; second = second + 1) {
            for (let carry = 0; carry <= 1; carry = carry + 1) {
                const pins = { 7: carry };
                for (let bit = 0; bit < 4; bit = bit + 1) {
                    pins[firstPins[bit]] = (first >> bit) & 1;
                    pins[secondPins[bit]] = (second >> bit) & 1;
                }
                const output = evaluateAdder(pins);
                let actual = 0;
                for (let bit = 0; bit < 5; bit = bit + 1) {
                    actual = actual + output[outputPins[bit]] * (2 ** bit);
                }
                assert.equal(actual, first + second + carry);
            }
        }
    }
}

// 运行一组实际接线验收数据，同时检查输入变化不会自行保存
function runSequence(inputs, controls, expected) {
    const project = validateProject(complementPreset());
    const runtime = createRuntime();
    let result = simulate(project, runtime);
    assert.equal(readResult(result), "XXXXXX");
    project.switches[6] = 0;
    result = simulate(project, runtime);
    assert.equal(readResult(result), "000000");
    project.switches[6] = 1;
    result = simulate(project, runtime);
    let previous = "000000";
    for (let step = 0; step < inputs.length; step = step + 1) {
        setInput(project, inputs[step], controls[step]);
        result = simulate(project, runtime);
        assert.equal(readResult(result), previous);
        result = emitPulse(project, runtime, "P-");
        assert.equal(readResult(result), expected[step]);
        assert.equal(result.issues.length, 0);
        previous = expected[step];
    }
    project.power = false;
    result = simulate(project, runtime);
    assert.equal(readResult(result), "ZZZZZZ");
    project.power = true;
    result = simulate(project, runtime);
    assert.equal(readResult(result), "XXXXXX");
}

// 核对两组课程验收数据和减去负数
function testPreset() {
    runSequence([7, 5, 6, 12], [0, 0, 1, 0], ["000111", "001100", "000110", "010010"]);
    runSequence([-12, -2, 6], [0, 0, 1], ["110100", "110010", "101100"]);
    runSequence([3, -2], [0, 1], ["000011", "000101"]);
}

// 核对负脉冲只有恢复上升沿保存，清零不依赖时钟
function testClock() {
    const project = complementPreset();
    const runtime = createRuntime();
    project.switches[6] = 0;
    simulate(project, runtime);
    project.switches[6] = 1;
    setInput(project, 7, 0);
    simulate(project, runtime);
    runtime.pulses.negative = 0;
    let result = simulate(project, runtime);
    assert.equal(readResult(result), "000000");
    runtime.pulses.negative = 1;
    result = simulate(project, runtime);
    assert.equal(readResult(result), "000111");
    project.switches[6] = 0;
    result = simulate(project, runtime);
    assert.equal(readResult(result), "000000");
}

// 检查右侧电源列上下连通，且地列不会与电源列内部相连
function testRails() {
    assert.equal(baseNode("R:GND:0"), baseNode("R:GND:59"));
    assert.equal(baseNode("R:VCC:0"), baseNode("VCC"));
    assert.notEqual(baseNode("R:GND:0"), baseNode("R:VCC:0"));
    assert.equal(baseNode("B1:A:3"), baseNode("B1:E:3"));
    assert.notEqual(baseNode("B1:E:3"), baseNode("B1:F:3"));
    assert.notEqual(baseNode("B0:A:3"), baseNode("B1:A:3"));
    const project = emptyProject();
    project.wires.push({ id: "W1", from: "R:GND:0", to: "R:VCC:59", color: "#dc3545", bends: [] });
    const result = simulate(project, createRuntime());
    assert.equal(readEndpoint(result, "VCC"), "X");
    assert.equal(result.issues[0].code, "power-short");
}

// 核对 X、Y 横向母线的分段和孔位空缺，实际连线也必须遵守同样规则
function testHorizontalBuses() {
    assert.equal(baseNode("B0:X:1"), baseNode("B0:X:17"));
    assert.equal(baseNode("B0:X:19"), baseNode("B0:X:41"));
    assert.equal(baseNode("B0:Y:43"), baseNode("B0:Y:59"));
    assert.notEqual(baseNode("B0:X:17"), baseNode("B0:X:19"));
    assert.notEqual(baseNode("B0:X:41"), baseNode("B0:X:43"));
    assert.notEqual(baseNode("B0:X:1"), baseNode("B0:Y:1"));
    assert.notEqual(baseNode("B0:X:1"), baseNode("B1:X:1"));
    assert.notEqual(baseNode("B0:X:1"), baseNode("B0:A:1"));
    assert.equal(validEndpoint("B0:X:6"), false);
    assert.equal(validEndpoint("B0:Y:18"), false);
    assert.equal(validEndpoint("B0:X:17"), true);
    const project = emptyProject();
    project.wires.push({ id: "W1", from: "K0", to: "B0:X:1", color: "#1976d2", bends: [] });
    project.wires.push({ id: "W2", from: "B0:X:17", to: "L0", color: "#1976d2", bends: [] });
    project.wires.push({ id: "W3", from: "B0:X:19", to: "L1", color: "#1976d2", bends: [] });
    project.switches[0] = 1;
    const result = simulate(validateProject(project), createRuntime());
    assert.equal(readEndpoint(result, "L0"), 1);
    assert.equal(readEndpoint(result, "L1"), "Z");
}

// 确认所有输入输出口与面包板列网格对齐，彼此间隔正好两列
function testPortAlignment() {
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const column = PORT_LAYOUT.lowestColumn - index * PORT_LAYOUT.columnStep;
        const expected = endpointPosition("B0:A:" + column);
        assert.equal(endpointPosition("K" + index).x, expected.x);
        assert.equal(endpointPosition("L" + index).x, expected.x);
        assert.equal(Number.isInteger(column), true);
        assert.ok(column >= 1 && column <= BOARD.columns);
    }
    assert.equal(endpointPosition("P+").x, endpointPosition("B3:A:55").x);
    assert.equal(endpointPosition("P-").x, endpointPosition("B3:A:57").x);
}

// 输入对应列跨沟槽接通，输出仍只接最上块上半列，横向母线保持隔离
function testDirectPorts() {
    const project = emptyProject();
    project.switches[0] = 1;
    const result = simulate(project, createRuntime());
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        const column = PORT_LAYOUT.lowestColumn - bit * PORT_LAYOUT.columnStep;
        for (const row of "FGHIJ") {
            assert.equal(baseNode("K" + bit), baseNode("B3:" + row + ":" + column));
        }
        for (const row of "ABCDE") {
            assert.equal(baseNode("L" + bit), baseNode("B0:" + row + ":" + column));
        }
        for (const row of "ABCDE") {
            assert.equal(baseNode("K" + bit), baseNode("B3:" + row + ":" + column));
        }
        assert.notEqual(baseNode("L" + bit), baseNode("B0:F:" + column));
    }
    assert.equal(readEndpoint(result, "B3:J:49"), 1);
    assert.equal(readEndpoint(result, "B3:F:49"), 1);
    assert.equal(readEndpoint(result, "B3:A:49"), 1);
    assert.equal(readEndpoint(result, "B3:Y:49"), "Z");
    assert.equal(baseNode("P-"), baseNode("B3:F:57"));
    assert.equal(baseNode("P+"), baseNode("B3:J:55"));
    assert.notEqual(baseNode("B3:A:53"), baseNode("B3:J:53"));
    assert.equal(readEndpoint(result, "B3:A:53"), "Z");
    assert.equal(allEndpoints().every(isPhysicalHole), true);
    assert.equal(isPhysicalHole("K0"), false);
    assert.equal(isPhysicalHole("L0"), false);
    assert.equal(isPhysicalHole("P-"), false);
    assert.equal(portHole("K24"), "");
}

// 穷举各块各列，只有第四块输入及脉冲所在列能跨沟槽；不同列互不接通
function testFourthBoardBridges() {
    const project = emptyProject();
    project.switches[0] = 1;
    const runtime = createRuntime();
    let result = simulate(project, runtime);
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
            const upper = "B" + section + ":E:" + column;
            const lower = "B" + section + ":F:" + column;
            const bridge = section === BOARD.sections - 1 && isInputColumn(column);
            assert.equal(baseNode(upper) === baseNode(lower), bridge, upper);
            assert.notEqual(baseNode(upper), baseNode("B" + section + ":X:" + column));
            assert.notEqual(baseNode(lower), baseNode("B" + section + ":Y:" + column));
            if (column < BOARD.columns) {
                assert.notEqual(baseNode(upper), baseNode("B" + section + ":E:" + (column + 1)));
            }
        }
    }
    assert.equal(readEndpoint(result, "B3:A:49"), 1);
    assert.equal(readEndpoint(result, "B3:A:47"), 0);
    assert.equal(readEndpoint(result, "B3:A:48"), "Z");
    assert.equal(readEndpoint(result, "B2:A:49"), "Z");
    assert.equal(readEndpoint(result, "B3:A:57"), 1);
    runtime.pulses.negative = 0;
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "B3:A:57"), 0);
    assert.equal(readEndpoint(result, "B3:J:57"), 0);
}

// K8 为低时逐一验证弱上拉和弱下拉可被强信号覆盖，K8 为高时恢复冲突诊断
function testBoardTriState() {
    const project = emptyProject();
    const runtime = createRuntime();
    runtime.triState = true;
    project.switches[0] = 1;
    let result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "K0"), 1);
    assert.equal(readEndpoint(result, "K7"), 0);
    project.wires.push({ id: "W1", from: portHole("K0"), to: portHole("GND"), color: "#46515f", bends: [] });
    project.wires.push({ id: "W2", from: portHole("K7"), to: portHole("VCC"), color: "#dc3545", bends: [] });
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "K0"), 0);
    assert.equal(readEndpoint(result, "K7"), 1);
    assert.equal(result.issues.length, 0);
    project.switches[8] = 1;
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "K0"), "X");
    assert.equal(readEndpoint(result, "K7"), "X");
    assert.ok(result.issues.length > 0);
}

test("三态输入的弱上拉和弱下拉可被外部信号覆盖", testBoardTriState);

// 旧文件转换为真实孔位，新旧端口不发生重复占用，迁移冲突会明确拒绝
function testPortMigration() {
    const restored = validateProject(original);
    assert.equal(restored.wires.length, 61);
    assert.equal(restored.wiringVersion, WIRING_VERSION);
    for (const wire of restored.wires) {
        assert.equal(isPhysicalHole(wire.from), true);
        assert.equal(isPhysicalHole(wire.to), true);
    }
    assert.deepEqual(validateProject(restored), restored);
    assert.equal(auditComplement(restored).length, 0);
    const conflict = structuredClone(original);
    conflict.wires.push({ id: "W99", from: "B3:F:49", to: "B3:F:47", color: "#123456", bends: [] });
    assert.throws(validateProject.bind(null, conflict), /迁移会改变连接/);
    const previous = complementPreset();
    previous.wiringVersion = 2;
    assert.equal(validateProject(previous).wiringVersion, WIRING_VERSION);
    // 旧版允许在输入上半列放另一条信号，新版桥接后应提示冲突而不是静默短接
    previous.wires.push({ id: "W99", from: "B3:A:49", to: "B3:A:47", color: "#123456", bends: [] });
    const snapshot = JSON.stringify(previous);
    assert.throws(validateProject.bind(null, previous), /迁移会改变连接/);
    assert.equal(JSON.stringify(previous), snapshot);
}

// 旧版 P+ 迁到第 55 列，原本接在第 55 列的独立信号仍保留
function testPositivePulseMigration() {
    const previous = emptyProject();
    previous.wiringVersion = 3;
    previous.wires = [
        { id: "W1", from: "B3:A:53", to: "B0:A:49", color: "#123456", bends: [] },
        { id: "W2", from: "B3:A:55", to: "B0:A:47", color: "#123456", bends: [] }
    ];
    previous.pullUps = ["B3:B:55"];
    const project = validateProject(previous);
    assert.equal(project.wires[0].from, "B3:A:55");
    assert.equal(project.wires[1].from, "B3:A:53");
    assert.deepEqual(project.pullUps, ["B3:B:53"]);
    const runtime = createRuntime();
    runtime.pulses.positive = 1;
    let result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "L0"), 1);
    runtime.pulses.positive = 0;
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, "L0"), 0);
    assert.equal(readEndpoint(result, "L1"), 1);
}

test("旧版 P+ 布局迁移保留原有接线和上拉", testPositivePulseMigration);

// 检查新建通用模式、位数配置、旧文件迁移和 Markdown 备注往返
function testProjectMetadata() {
    const project = emptyProject();
    assert.equal(Object.hasOwn(project, "mode"), false);
    project.inputCount = 24;
    project.outputCount = 1;
    project.notes = "# 与门实验\n\n- K0：输入\n- L0：输出\n";
    const restored = validateProject(JSON.parse(JSON.stringify(project)));
    assert.equal(restored.notes, project.notes);
    assert.equal(restored.inputCount, 24);
    assert.equal(restored.outputCount, 1);
    project.inputCount = 25;
    assert.throws(validateProject.bind(null, project), /位数/);
    const old = complementPreset();
    old.mode = "complement";
    delete old.inputCount;
    delete old.outputCount;
    delete old.notes;
    const migrated = validateProject(old);
    assert.equal(Object.hasOwn(migrated, "mode"), false);
    assert.match(migrated.notes, /K6/);
    project.inputCount = 8;
    project.notes = "超".repeat(NOTES_LIMIT + 1);
    assert.throws(validateProject.bind(null, project), /备注/);
}

// 检查删线会产生实际未知结果，导入格式错误会被拒绝
function testBrokenWiring() {
    const project = complementPreset();
    project.wires.splice(20, 1);
    const result = simulate(project, createRuntime());
    assert.ok(result.issues.length > 0);
    const invalid = complementPreset();
    invalid.wires[0].to = "B1:EE:4";
    assert.throws(validateProject.bind(null, invalid), /端点/);
    const custom = complementPreset();
    custom.wires[0].color = "#123abc";
    assert.equal(validateProject(custom).wires[0].color, "#123abc");
}

// 穷举完整接线的全部六位累加值、五位输入及加减控制，共 4096 种组合
function testAllWiredInputs() {
    const project = complementPreset();
    const runtime = createRuntime();
    project.switches[6] = 0;
    simulate(project, runtime);
    project.switches[6] = 1;
    for (let stored = 0; stored < 64; stored = stored + 1) {
        for (let input = -16; input < 16; input = input + 1) {
            for (let subtract = 0; subtract <= 1; subtract = subtract + 1) {
                // 只预置寄存器，运算结果仍必须经过真实连线和完整时钟传播
                const bits = [];
                for (let bit = 0; bit < 8; bit = bit + 1) {
                    bits.push((stored >> bit) & 1);
                }
                runtime.registers.U1.bits = bits;
                runtime.registers.U1.clock = 1;
                setInput(project, input, subtract);
                simulate(project, runtime);
                const result = emitPulse(project, runtime, "P-");
                let expected = stored + input;
                if (subtract === 1) {
                    expected = stored - input;
                }
                expected = expected & 63;
                const binary = readResult(result);
                assert.equal(parseInt(binary, 2), expected, "完整接线结果不一致");
                const highSign = (expected >> 5) & 1;
                const lowSign = (expected >> 4) & 1;
                assert.equal(readEndpoint(result, "L6"), highSign ^ lowSign, "双符号位溢出灯不一致");
                assert.equal(result.issues.length, 0);
            }
        }
    }
}

test("门电路真值与未知传播", testGates);
test("74LS283 全部 512 种输入", testAdder);
test("完整接线两组验收及减负数", testPreset);
test("寄存器异步清零与上升沿时序", testClock);
// 首尾孔对齐面包板的上下母线，两列同行对齐且每列保持 60 孔等距
function testRailAlignment() {
    const firstRow = rowY(0, "X");
    const lastRow = rowY(BOARD.sections - 1, "Y");
    assert.equal(RAIL_LAYOUT.count, 60);
    const pitch = (lastRow - firstRow) / (RAIL_LAYOUT.count - 1);
    for (const rail of ["GND", "VCC"]) {
        assert.equal(endpointPosition("R:" + rail + ":0").y, firstRow);
        assert.equal(endpointPosition("R:" + rail + ":59").y, lastRow);
        for (let index = 1; index < RAIL_LAYOUT.count; index = index + 1) {
            const current = endpointPosition("R:" + rail + ":" + index);
            const previous = endpointPosition("R:" + rail + ":" + (index - 1));
            assert.ok(Math.abs(current.y - previous.y - pitch) < 0.000001);
            assert.equal(current.x, previous.x);
            assert.equal(current.y, endpointPosition("R:GND:" + index).y);
        }
    }
}

test("面包板内部连通与右侧电源短路", testRails);
test("右侧两列60孔等距且首尾对齐面包板", testRailAlignment);
test("X、Y 母线分段和实连传播", testHorizontalBuses);
test("24组输入输出及脉冲端口网格对齐", testPortAlignment);
test("输入输出及脉冲直连真实五孔组，无板载假插孔", testDirectPorts);
test("第四块输入对应列跨沟槽桥接且其余列隔离", testFourthBoardBridges);
test("旧端口迁移和冲突保护", testPortMigration);
test("通用模式、备注和旧文件迁移", testProjectMetadata);
test("断线与导入校验", testBrokenWiring);
test("完整接线全部 4096 种加减组合", testAllWiredInputs);

// 核对接线检查器能分辨正确接法、断线和额外短接
function testWiringAudit() {
    const project = complementPreset();
    assert.equal(auditComplement(project).length, 0);
    project.wires[0].color = "#ff8833";
    assert.equal(auditComplement(project).length, 0);
    project.wires.pop();
    assert.ok(auditComplement(project).length > 0);
    const shorted = complementPreset();
    shorted.wires.push({ id: "W99", from: "B0:A:1", to: "B0:A:2", color: "#1976d2", bends: [] });
    assert.equal(auditComplement(shorted).length, 0);
    shorted.wires.push({ id: "W100", from: "R:GND:0", to: "R:VCC:0", color: "#1976d2", bends: [] });
    assert.ok(auditComplement(shorted).length > 0);
}

// 新建独立实验时保留旧实验的接线和备注
function testWorkspace() {
    const workspace = { version: 1, activeId: "", projects: {} };
    keepExperiment(workspace, "first", complementPreset());
    const blank = emptyProject();
    blank.notes = "# 新实验";
    keepExperiment(workspace, "second", blank);
    const restored = validateWorkspace(JSON.parse(JSON.stringify(workspace)));
    assert.equal(restored.projects.first.wires.length, 61);
    assert.equal(restored.projects.second.wires.length, 0);
    assert.equal(Object.hasOwn(restored.projects.second, "mode"), false);
    assert.equal(restored.projects.second.notes, "# 新实验");
}

test("标准接线核对与差异定位", testWiringAudit);
test("独立实验保存与切换", testWorkspace);

// 首次启动从旧单实验存储恢复时，保留原输入、标题及只读设置
function testLegacyWorkspaceStartup() {
    const project = complementPreset();
    project.name = "旧版实验";
    project.switches[0] = 1;
    const storage = new Map();
    storage.set(STORAGE_KEY, JSON.stringify(project));
    storage.set(READ_ONLY_KEY, "true");
    const storageOwner = { localStorage: { getItem: storage.get.bind(storage) } };
    const restored = loadWorkspace(storageOwner);
    assert.equal(restored.readOnly, true);
    assert.equal(restored.warning, "");
    assert.equal(restored.initializePreset, true);
    assert.deepEqual(restored.project, project);
    assert.equal(Object.keys(restored.workspace.projects).length, 3);
    assert.equal(storage.has(WORKSPACE_KEY), false);
}

// 去重前保留完整工作区，当前实验中的输入不随初始化被改写
function testWorkspaceCleanupBackup() {
    const original = { version: 1, activeId: "first", projects: {} };
    const project = complementPreset();
    project.switches[0] = 1;
    original.projects.first = project;
    original.projects.duplicate = copyProject(project);
    const storage = new Map();
    storage.set(WORKSPACE_KEY, JSON.stringify(original));
    const storageOwner = {
        localStorage: { getItem: storage.get.bind(storage), setItem: storage.set.bind(storage) }
    };
    const restored = loadWorkspace(storageOwner);
    assert.equal(restored.removedCount, 1);
    assert.equal(restored.workspace.activeId, "first");
    assert.equal(restored.project.switches[0], 1);
    const backup = JSON.parse(storage.get(CLEANUP_BACKUP_KEY));
    assert.deepEqual(backup.projects, original.projects);
    const saved = JSON.parse(storage.get(WORKSPACE_KEY));
    assert.deepEqual(Object.keys(saved.projects), ["first"]);
}

// 模拟浏览器禁止访问本地存储，启动时仍可使用默认示例
function testUnavailableWorkspaceStorage() {
    const storageOwner = {};
    // 有些隐私设置会在获取存储对象时就抛错
    function denyStorage() {
        throw new Error("本地存储已禁用");
    }
    Object.defineProperty(storageOwner, "localStorage", { get: denyStorage });
    const restored = loadWorkspace(storageOwner);
    assert.match(restored.warning, /无法恢复/);
    assert.equal(restored.initializePreset, true);
    assert.deepEqual(restored.project, complementPreset());
}

test("启动时恢复旧单实验和只读设置，不主动保存", testLegacyWorkspaceStartup);
test("工作区去重前保留原始备份", testWorkspaceCleanupBackup);
test("本地存储不可用时仍能打开默认实验", testUnavailableWorkspaceStorage);

// 画布高亮只读取实际选择，固定资料面板不作为选中依据
function testSelectionHighlight() {
    const state = { selection: [], selected: null, fixedItems: [{ kind: "chip", id: "U1" }] };
    assert.equal(objectSelected(state, "chip", "U1"), false);
    state.selection.push({ kind: "chip", id: "U1" });
    assert.equal(objectSelected(state, "chip", "U1"), true);
    state.selection = [];
    assert.equal(objectSelected(state, "chip", "U1"), false);
    state.selected = { kind: "wire", id: "W1" };
    assert.equal(objectSelected(state, "wire", "W1"), true);
    state.selected = null;
    assert.equal(objectSelected(state, "wire", "W1"), false);
}

test("取消选择后同步清除画布高亮", testSelectionHighlight);
