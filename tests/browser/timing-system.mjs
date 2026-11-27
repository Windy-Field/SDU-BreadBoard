import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { openWorkbench } from "../helpers/announcement.mjs";
import { readImageDownload } from "../helpers/downloads.mjs";
import { TIMING_EXPERIMENT_ID } from "../../src/experiments/timing-preset.mjs";
import { BOARD, PORT_LAYOUT, INPUT_RESET_COLUMN, columnX } from "../../src/board/board.mjs";
import { wirePoints } from "../../src/board/geometry.mjs";

const ADDRESS = pathToFileURL(path.resolve("index.html")).href;
const ONE_HOT_LEVELS = ["0001", "0010", "0100", "1000"];

// 在页面按 45° 整理后导出实际路径，核对第 41 列的线已沿孔心直走
async function testTimingWireAlignment(page) {
    await page.locator("#wire-angle-trigger").click();
    await page.locator("#wire-angle-option-1").click();
    await page.locator("#arrange-wires").click();
    await page.locator("#confirm-accept").click();
    const completed = page.locator("#toast-region .toast").filter({ hasText: "走线已整理" });
    await completed.waitFor();
    const content = await readImageDownload(page, "#export-project", "json", "breadboard-circuit.json");
    const project = JSON.parse(content.toString("utf8"));
    let aligned = false;
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        if (wire.from === "B3:J:41") {
            const points = wirePoints(wire, index);
            assert.equal(wire.angle, 45);
            assert.equal(points[1].x, columnX(41));
            assert.ok(points[0].y - points[1].y > 200);
            aligned = true;
        }
    }
    assert.equal(aligned, true);
}

// 从内置列表打开实验，按备注装载 0001 并核对完整的 16 拍和回环
async function testTimingSystem(page) {
    await page.locator("#experiment-picker-trigger").click();
    await page.getByRole("option", { name: "实验四 时序系统" }).click();
    assert.equal(await page.locator("#experiment-picker").inputValue(), TIMING_EXPERIMENT_ID);
    const positive = page.locator("#pulse-positive");
    const output = page.locator("#binary-result");
    assert.equal(await output.textContent(), "0001 0000");
    await page.getByRole("button", { name: "切换 K4", exact: true }).click();
    await positive.click();
    assert.equal(await output.textContent(), "0001 0001");
    await page.getByRole("button", { name: "切换 K5", exact: true }).click();
    await page.locator("#tab-timing").click();
    const picker = page.getByRole("combobox", { name: "监测信号" });
    await picker.click();
    const menu = page.locator("#timing-signal-listbox");
    for (const name of ["P-", "K0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]) {
        await menu.getByRole("option", { name: name, exact: true }).click();
    }
    await picker.press("Escape");
    const names = await page.locator(".timing-signal-name").allTextContents();
    assert.deepEqual(names, ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]);
    await page.locator("#timing-start").click();
    assert.equal(await picker.isDisabled(), true);
    for (let step = 0; step <= 16; step = step + 1) {
        const beat = step % ONE_HOT_LEVELS.length;
        const pulse = Math.floor(step / 4) % ONE_HOT_LEVELS.length;
        assert.equal(await output.textContent(), ONE_HOT_LEVELS[pulse] + " " + ONE_HOT_LEVELS[beat]);
        if (step < 16) {
            await positive.click();
        }
    }
    await page.locator("#timing-stop").click();
    assert.equal(await page.locator(".timing-event").count(), 17);
    const laneNames = page.locator(".timing-lane-name");
    assert.deepEqual(await laneNames.allTextContents(), names);
    assert.equal(await page.locator("#issue-count").textContent(), "0");
}

// 跨组选信号，检查勾选顺序、取消重选及满八路后的操作状态
async function testOrderedSignals(page) {
    const outputCount = page.locator("#output-count");
    await outputCount.fill("17");
    await outputCount.press("Tab");
    await page.locator("#tab-timing").click();
    const picker = page.getByRole("combobox", { name: "监测信号" });
    await picker.press("Enter");
    const menu = page.locator("#timing-signal-listbox");
    assert.equal(await menu.getAttribute("aria-multiselectable"), "true");
    await picker.press("Home");
    await picker.press("Space");
    await picker.press("Space");
    for (const name of ["L16", "L8", "P+", "K1", "L4", "L16", "L16"]) {
        await menu.getByRole("option", { name: name, exact: true }).click();
    }
    const names = page.locator(".timing-signal-name");
    assert.deepEqual(await names.allTextContents(), ["P-", "K0", "L0", "L8", "P+", "K1", "L4", "L16"]);
    const last = menu.getByRole("option", { name: "L16", exact: true });
    const order = last.locator(".select-order");
    assert.equal(await order.textContent(), "8");
    const unavailable = menu.getByRole("option", { name: "L1", exact: true });
    assert.equal(await unavailable.getAttribute("aria-disabled"), "true");
    await picker.press("Escape");
}

// 在窄屏应用两种模式，检查补出的 K8、频率锁定和停止后的输出
async function testPulseSettings(page) {
    await page.setViewportSize({ width: 375, height: 800 });
    const settings = page.locator("#pulse-options");
    const dialog = page.getByRole("dialog", { name: "脉冲设置" });
    const frequency = dialog.getByRole("spinbutton", { name: /频率/ });
    const apply = dialog.getByRole("button", { name: "应用" });
    await settings.click();
    const help = dialog.getByRole("button", { name: "实物实验板开启方式" });
    await help.hover();
    const tooltip = page.getByRole("tooltip");
    await tooltip.waitFor();
    const instructions = await tooltip.textContent();
    assert.match(instructions, /CLK.*K4～K0.*复位/);
    assert.match(instructions, /按住 K8.*复位/);
    await page.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), true);
    assert.equal(await tooltip.isVisible(), false);
    await help.click();
    await tooltip.waitFor();
    await dialog.getByRole("checkbox", { name: "连续脉冲" }).check();
    for (const invalid of ["", "0", "33", "1.5"]) {
        await frequency.fill(invalid);
        await apply.click();
        assert.equal(await dialog.isVisible(), true);
        assert.equal(await frequency.evaluate(validFrequency), false);
    }
    for (const boundary of ["1", "32"]) {
        await frequency.fill(boundary);
        assert.equal(await frequency.evaluate(validFrequency), true);
    }
    await frequency.fill("2");
    await dialog.getByRole("checkbox", { name: "三态模式" }).check();
    await apply.click();
    assert.equal(await page.locator("#quick-switches button").count(), 9);
    const led = page.locator('[data-input-led="0"]');
    assert.equal(await led.evaluate(isWeakLed), true);
    await page.getByRole("button", { name: "切换 K8", exact: true }).click();
    assert.equal(await led.evaluate(isWeakLed), false);

    const positive = page.locator("#pulse-positive");
    await positive.click();
    await page.waitForFunction(changedBeat);
    await settings.click();
    assert.equal(await frequency.isDisabled(), true);
    await dialog.getByRole("button", { name: "取消" }).click();
    assert.match(await positive.getAttribute("aria-label"), /停止连续脉冲/);
    await positive.click();
    assert.match(await positive.getAttribute("aria-label"), /启动连续脉冲/);
    const stopped = await page.locator("#binary-result").textContent();
    await page.clock.runFor(800);
    assert.equal(await page.locator("#binary-result").textContent(), stopped);
    await positive.click();
    await page.getByRole("button", { name: "复位", exact: true }).press("Enter");
    assert.match(await positive.getAttribute("aria-label"), /启动连续脉冲/);
    assert.equal(await led.evaluate(isWeakLed), true);
    const resetOutput = await page.locator("#binary-result").textContent();
    await page.clock.runFor(800);
    assert.equal(await page.locator("#binary-result").textContent(), resetOutput);
}

// 读取数字输入的原生校验结果
function validFrequency(input) {
    return input.validity.valid;
}

// 滚动到画布的输入板，确保实际鼠标点击落在复位键上
function showInputBoard(viewport) {
    viewport.scrollTop = viewport.scrollHeight;
    viewport.scrollLeft = viewport.scrollWidth;
}

// 用画布复位键清除可见和隐藏开关，再用一次撤销恢复两者
async function testInputReset(page) {
    const count = page.locator("#input-count");
    await count.fill("24");
    await count.press("Tab");
    const lastSwitch = page.getByRole("button", { name: "切换 K23", exact: true });
    const firstSwitch = page.getByRole("button", { name: "切换 K0", exact: true });
    await lastSwitch.click();
    await firstSwitch.click();
    await count.fill("8");
    await count.press("Tab");
    await page.locator("#fit-board").click();
    const viewport = page.locator("#board-viewport");
    await viewport.evaluate(showInputBoard);
    const canvas = page.locator("#board-canvas");
    const bounds = await canvas.boundingBox();
    const resetX = bounds.x + columnX(INPUT_RESET_COLUMN) / BOARD.width * bounds.width;
    const resetY = bounds.y + (PORT_LAYOUT.inputY + 38) / BOARD.height * bounds.height;
    await page.mouse.click(resetX, resetY);
    assert.equal(await firstSwitch.textContent(), "0");
    await page.locator("#undo").click();
    assert.equal(await firstSwitch.textContent(), "1");
    await page.locator("#redo").click();
    assert.equal(await firstSwitch.textContent(), "0");
    await count.fill("24");
    await count.press("Tab");
    assert.equal(await lastSwitch.textContent(), "0");
}

// 返回输入灯是否使用弱驱动的显示样式
function isWeakLed(led) {
    return led.classList.contains("weak");
}

// 等到连续时钟实际推进多个节拍，而不是仅检查按钮文字
function changedBeat() {
    const output = document.getElementById("binary-result");
    return output.textContent === "0001 0100";
}

// 在真实离线页面检查电路及脉冲入口
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: "reduce" });
        await page.clock.install();
        await openWorkbench(page, ADDRESS);
        await testTimingSystem(page);
        await testTimingWireAlignment(page);
        await testPulseSettings(page);
        const otherPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
        await openWorkbench(otherPage, ADDRESS);
        await testOrderedSignals(otherPage);
        await testInputReset(otherPage);
        console.log("实验四、频率校验、连续脉冲、复位和有序多选验证通过");
    } finally {
        await browser.close();
    }
}

await main();
