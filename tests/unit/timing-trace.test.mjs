import assert from "node:assert/strict";
import test from "node:test";
import { emptyProject, pinHole } from "../../src/board/board.mjs";
import { complementPreset } from "../../src/experiments/presets.mjs";
import { createRuntime, simulate } from "../../src/simulation/engine.mjs";
import {
    TRACE_LIMITS, addTimingSignal, availableTimingSignals, captureTimingTrace, clearTimingTrace,
    createTimingTrace, removeTimingSignal, resetTimingCircuit, startTimingTrace, stopTimingTrace, timingEdge
} from "../../src/simulation/timing-trace.mjs";

// 从项目提供的选项中找到一个物理脚，交给正常的添加入口
function watchPin(trace, project, chip, pin) {
    const endpoint = pinHole(chip, pin);
    for (const signal of availableTimingSignals(project)) {
        if (signal.endpoint === endpoint) {
            assert.equal(addTimingSignal(trace, signal), true);
            return endpoint;
        }
    }
    assert.fail("要测试的芯片引脚没有出现在监测菜单中");
}

// 从真实补码电路记录时钟与数据，核对寄存器只在松开 P- 时更新
function testComplementTiming() {
    const project = complementPreset();
    const runtime = createRuntime();
    const trace = createTimingTrace();
    const register = project.chips[0];
    assert.equal(register.model, "74LS273");
    const clock = watchPin(trace, project, register, 11);
    const input = watchPin(trace, project, register, 3);
    const output = watchPin(trace, project, register, 2);

    project.switches[6] = 0;
    simulate(project, runtime);
    project.switches[6] = 1;
    let result = simulate(project, runtime);
    assert.equal(startTimingTrace(trace, result), true);
    captureTimingTrace(trace, result, "无变化");
    assert.equal(trace.samples.length, 1);

    project.switches[0] = 1;
    result = simulate(project, runtime);
    captureTimingTrace(trace, result, "切换 K0");
    runtime.pulses.negative = 0;
    result = simulate(project, runtime);
    captureTimingTrace(trace, result, "按下 P-");
    runtime.pulses.negative = 1;
    result = simulate(project, runtime);
    captureTimingTrace(trace, result, "松开 P-");

    assert.equal(trace.samples.length, 4);
    const pressed = trace.samples[2].values;
    const released = trace.samples[3].values;
    assert.equal(pressed[input], 1);
    assert.equal(pressed[output], 0);
    assert.equal(released[output], pressed[input]);
    assert.equal(timingEdge(pressed[clock], released[clock]), "↑");
    assert.equal(timingEdge(trace.samples[1].values[clock], pressed[clock]), "↓");
    assert.equal(released.L0, 1);
    stopTimingTrace(trace);
    project.power = false;
    result = simulate(project, runtime);
    captureTimingTrace(trace, result, "关闭电源");
    assert.equal(trace.samples.length, 4);
}

// 未知或高阻值能进入记录，但不能被当成确定的时钟边沿
function testUnknownTiming() {
    const project = complementPreset();
    const runtime = createRuntime();
    const trace = createTimingTrace();
    let result = simulate(project, runtime);
    startTimingTrace(trace, result);
    assert.equal(trace.samples[0].values.L0, "X");
    project.power = false;
    result = simulate(project, runtime);
    captureTimingTrace(trace, result, "关闭电源");
    assert.equal(trace.samples[1].values.L0, "Z");
    assert.equal(timingEdge(1, "Z"), "");
    assert.equal(timingEdge("X", 1), "");
}

// 核对录制上限、重复信号、录制期间锁定和清除行为
function testTraceLimits() {
    const project = emptyProject();
    const runtime = createRuntime();
    const trace = createTimingTrace();
    const available = availableTimingSignals(project);
    assert.equal(addTimingSignal(trace, available[1]), false);
    for (const signal of available) {
        addTimingSignal(trace, signal);
    }
    assert.equal(trace.signals.length, TRACE_LIMITS.signals);
    let result = simulate(project, runtime);
    startTimingTrace(trace, result);
    assert.equal(removeTimingSignal(trace, "K0"), false);
    for (let index = 0; index < TRACE_LIMITS.changes + 2; index = index + 1) {
        project.switches[0] = 1 - project.switches[0];
        result = simulate(project, runtime);
        captureTimingTrace(trace, result, "切换 K0");
    }
    assert.equal(trace.recording, false);
    assert.equal(trace.samples.length, TRACE_LIMITS.changes + 1);
    assert.match(trace.notice, /200/);
    clearTimingTrace(trace);
    assert.equal(trace.samples.length, 0);
    assert.equal(trace.signals.length, TRACE_LIMITS.signals);
}

// 改线时保留板载探针，但不能沿用已移动或删除的芯片脚
function testCircuitReset() {
    const project = complementPreset();
    const trace = createTimingTrace();
    const register = project.chips[0];
    watchPin(trace, project, register, 11);
    startTimingTrace(trace, simulate(project, createRuntime()));
    register.column = register.column + 1;
    resetTimingCircuit(trace, project, "接线已更改");
    assert.equal(trace.recording, false);
    assert.equal(trace.samples.length, 0);
    assert.equal(trace.signals.length, 3);
    assert.equal(trace.notice, "接线已更改");
}

test("补码电路记录 P- 松开时的采样与输出", testComplementTiming);
test("时序记录区分未知与高阻且不产生假边沿", testUnknownTiming);
test("时序记录和通道数量有上限", testTraceLimits);
test("改动芯片位置后清除旧时序并移除失效探针", testCircuitReset);
