import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { complementPreset } from "../src/presets.mjs";
import { emptyProject, endpointPosition, BOARD } from "../src/board.mjs";
import { CHIP_MODELS } from "../src/chips.mjs";
import originalPreset from "./fixtures/complement-original.json" with { type: "json" };
import { wirePoints } from "../src/geometry.mjs";
import { routeWires } from "../src/routing.mjs";

const ROOT = process.cwd();
const URL = pathToFileURL(path.join(ROOT, "index.html")).href;

// 读取浏览器中的已保存实验，返回序列化对象而不访问应用内部状态
function readSavedWorkspace() {
    const saved = localStorage.getItem("breadboard-lab-workspace-v1");
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
}

// 把测试用旧实验列表写入这个独立浏览器上下文，验证升级清理逻辑
function seedWorkspace(workspace) {
    localStorage.setItem("breadboard-lab-workspace-v1", JSON.stringify(workspace));
}

// 获取测试端点在浏览器窗口里的位置，适用于缩放后的画布
async function screenPoint(page, point) {
    const bounds = await page.locator("#board-canvas").boundingBox();
    return { x: bounds.x + point.x / BOARD.width * bounds.width, y: bounds.y + point.y / BOARD.height * bounds.height };
}

// 在画布逻辑坐标上单击，坐标由端口或芯片布局得出
async function clickPoint(page, point) {
    const position = await screenPoint(page, point);
    await page.mouse.click(position.x, position.y);
}

// 导出当前实验供断言，不依赖编译产物中的私有变量
async function exportedProject(page) {
    const waiting = page.waitForEvent("download");
    await page.locator("#export-project").click();
    const download = await waiting;
    const file = await download.path();
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

// 记录脚本错误，最后一并检查
function collectError(errors, error) {
    errors.push(error.message);
}

// 核对显示出来的每段导线方向，返回斜线数量供界面测试使用
function checkWireAngles(project) {
    let diagonal = 0;
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const points = wirePoints(project.wires[index], index);
        for (let segment = 1; segment < points.length; segment = segment + 1) {
            const horizontal = Math.abs(points[segment].x - points[segment - 1].x);
            const vertical = Math.abs(points[segment].y - points[segment - 1].y);
            assert.ok(horizontal === 0 || vertical === 0 || Math.abs(horizontal - vertical) < 0.000001);
            if (horizontal > 0 && vertical > 0) {
                assert.ok(horizontal <= BOARD.pitch + 0.000001, "页面斜角横向不能超过一个孔距");
                assert.ok(vertical <= BOARD.pitch + 0.000001, "页面斜角纵向不能超过一个孔距");
                diagonal = diagonal + 1;
            }
        }
    }
    return diagonal;
}

// 用真实点击完成斜线接线、拖拽、整理、撤销和导入，保持原有端点
async function testAngleWiring(browser) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        await page.goto(URL);
        await page.locator("#new-experiment").click();
        assert.equal(await page.locator("#wire-angle").inputValue(), "45");
        assert.match(await page.locator("#wire-angle-trigger").textContent(), /45°/);
        const angleBounds = await page.locator(".wire-angle-control").boundingBox();
        const paletteBounds = await page.locator("#wire-palette").boundingBox();
        assert.ok(angleBounds.x + angleBounds.width <= paletteBounds.x, "走线选择框应排在颜色选择区前面");
        await page.locator("#tool-wire").click();
        const first = endpointPosition("B0:A:1");
        const last = endpointPosition("B0:J:15");
        await clickPoint(page, first);
        const preview = await screenPoint(page, last);
        await page.mouse.move(preview.x, preview.y);
        await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "wire-angle-preview.png"), fullPage: true });
        await clickPoint(page, last);
        const connected = await exportedProject(page);
        assert.equal(connected.wires[0].angle, 45);
        assert.ok(checkWireAngles(connected) > 0);
        await page.locator("#tool-select").click();
        await page.locator("#tab-wires").click();
        await page.locator("#wires-panel button[data-wire='W1']").first().click();
        const points = wirePoints(connected.wires[0], 0);
        const start = await screenPoint(page, points[1]);
        const target = await screenPoint(page, { x: points[1].x + 24, y: points[1].y - 12 });
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        await page.mouse.move(target.x, target.y, { steps: 5 });
        await page.mouse.up();
        const dragged = await exportedProject(page);
        assert.notDeepEqual(dragged.wires[0].bends, connected.wires[0].bends);
        assert.equal(dragged.wires[0].from, connected.wires[0].from);
        assert.equal(dragged.wires[0].to, connected.wires[0].to);
        checkWireAngles(dragged);
        await page.locator("#undo").click();
        assert.deepEqual((await exportedProject(page)).wires, connected.wires);
        await page.locator("#redo").click();
        assert.deepEqual((await exportedProject(page)).wires, dragged.wires);
        await page.locator("#arrange-wires").click();
        await page.locator("#confirm-accept").click();
        await page.waitForFunction(routingFinished);
        const arranged = await exportedProject(page);
        assert.ok(checkWireAngles(arranged) > 0);
        assert.equal(arranged.wires[0].from, connected.wires[0].from);
        assert.equal(arranged.wires[0].to, connected.wires[0].to);
        await page.locator("#wire-angle-trigger").click();
        await page.locator("#wire-angle-option-0").click();
        assert.deepEqual((await exportedProject(page)).wires, arranged.wires);
        const payload = Buffer.from(JSON.stringify(arranged));
        await page.locator("#import-file").setInputFiles({ name: "angled.json", mimeType: "application/json", buffer: payload });
        assert.deepEqual((await exportedProject(page)).wires, arranged.wires);
        await page.locator("#wire-angle-trigger").click();
        await page.locator("#wire-angle-option-1").click();
        for (const width of [1600, 375]) {
            await page.setViewportSize({ width: width, height: 1000 });
            const size = await page.evaluate(readDocumentWidth);
            assert.ok(size.document <= size.viewport);
            await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "wire-angle-" + width + ".png"), fullPage: true });
        }
    } finally {
        await page.close();
    }
}

// 返回页面实际宽度和窗口宽度，用于检查工具栏换行后是否横向溢出
function readDocumentWidth() {
    return { document: document.documentElement.scrollWidth, viewport: window.innerWidth };
}

// 在真实插孔上逐个放置所有型号，确认放置优先于接口选择且可撤销
async function testDirectPlacement(page) {
    const hole = endpointPosition("B0:A:20");
    for (const model of Object.keys(CHIP_MODELS)) {
        await page.locator(".chip-option[data-model='" + model + "']").click();
        assert.equal(await page.locator("#tool-place").getAttribute("aria-pressed"), "true");
        assert.equal(await page.locator("#tool-select").getAttribute("aria-pressed"), "false");
        assert.equal(await page.locator("#simulation-status").textContent(), "待放置 " + model);
        await clickPoint(page, hole);
        const project = await exportedProject(page);
        assert.equal(project.chips.length, 1);
        assert.equal(project.chips[0].model, model);
        assert.equal(project.chips[0].column, 20);
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        assert.equal(await page.locator("#tool-select").getAttribute("aria-pressed"), "true");
        await page.locator("#undo").click();
        assert.equal((await exportedProject(page)).chips.length, 0);
    }
    const option = page.locator(".chip-option[data-model='74LS86']");
    await option.click();
    await option.click();
    assert.equal(await page.locator("#tool-place").getAttribute("aria-pressed"), "false");
    assert.equal(await page.locator("#tool-select").getAttribute("aria-pressed"), "true");
    await option.click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#tool-place").getAttribute("aria-pressed"), "false");
    await option.click();
    await page.locator("#tool-select").click();
    await page.locator("#tool-place").click();
    assert.equal(await page.locator("#tool-place").getAttribute("aria-pressed"), "true");
    await page.keyboard.press("Escape");
}

// 从导线列表选择两根导线，使用真实的 Ctrl 点击保留多选
async function selectTwoWires(page) {
    await page.locator("#tab-wires").click();
    await page.locator("#wires-panel button[data-wire='W1']").first().click();
    await page.locator("#tab-wires").click();
    await page.keyboard.down("Control");
    await page.locator("#wires-panel button[data-wire='W2']").first().click();
    await page.keyboard.up("Control");
    assert.equal(await page.locator("#inspect-panel .selection-item[data-kind='wire']").count(), 2);
}

// 导入旧示例后验证通用整理的确认、取消、撤销、只读保护和端点不变
async function testPresetRouting(page) {
    await page.locator("#wire-angle-trigger").click();
    await page.locator("#wire-angle-option-1").click();
    const imported = structuredClone(originalPreset);
    imported.name = "旧版走线测试";
    const payload = Buffer.from(JSON.stringify(imported));
    await page.locator("#import-file").setInputFiles({ name: "original.json", mimeType: "application/json", buffer: payload });
    await page.waitForFunction(importedPresetReady);
    const before = await exportedProject(page);
    await page.locator("#arrange-wires").click();
    assert.equal(await page.locator("#confirm-dialog").isVisible(), true);
    assert.equal(await page.locator("#confirm-accept").textContent(), "确认整理");
    assert.equal(await page.locator("#confirm-accept").getAttribute("class"), "button primary");
    await page.locator("#confirm-cancel").click();
    assert.deepEqual((await exportedProject(page)).wires, before.wires);
    await page.locator("#arrange-wires").click();
    await page.locator("#confirm-accept").click();
    await page.waitForFunction(routingFinished);
    const updated = await exportedProject(page);
    const expectedRoutes = await routeWires(before, 45);
    for (const wire of updated.wires) {
        assert.deepEqual(wire.bends, expectedRoutes[wire.id]);
        assert.equal(wire.angle, 45);
    }
    assert.ok(checkWireAngles(updated) > 0);
    await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "preset-fewer-corners.png"), fullPage: true });
    assert.equal(updated.notes, before.notes);
    assert.deepEqual(updated.chips, before.chips);
    await page.locator("#undo").click();
    assert.deepEqual((await exportedProject(page)).wires, before.wires);
    await page.locator("#redo").click();
    assert.deepEqual((await exportedProject(page)).wires, updated.wires);
    await page.locator("#read-only-toggle").check();
    assert.equal(await page.locator("#arrange-wires").isDisabled(), true);
    await page.locator("#read-only-toggle").uncheck();
}

// 导入成功后通过实验标题确认页面已切换，不依赖不存在的提示文字
function importedPresetReady() {
    return document.getElementById("project-name").value === "旧版走线测试";
}

// 用普通电路在页面中整理路径，核对两端与颜色保留，并可撤销
async function testGeneralWireRouting(page) {
    await page.locator("#new-experiment").click();
    await page.locator("#from-endpoint").fill("B0:A:1");
    await page.locator("#to-endpoint").fill("B0:J:20");
    await page.locator("#connect-endpoints").click();
    const before = await exportedProject(page);
    await page.locator("#arrange-wires").click();
    await page.locator("#confirm-accept").click();
    await page.waitForFunction(routingFinished);
    const after = await exportedProject(page);
    assert.equal(after.wires.length, before.wires.length);
    assert.equal(after.wires[0].from, before.wires[0].from);
    assert.equal(after.wires[0].to, before.wires[0].to);
    assert.equal(after.wires[0].color, before.wires[0].color);
    assert.ok(after.wires[0].bends.length > 0);
    await page.locator("#undo").click();
    assert.deepEqual((await exportedProject(page)).wires, before.wires);
}

// 等待异步整理结束后再读取导线，避免断言执行在计算中途
function routingFinished() {
    return document.getElementById("arrange-wires").getAttribute("aria-busy") === "false";
}

// 读取按钮当前显示颜色，在悬停后的真实绘制状态下核对对比度
function buttonColors(button) {
    const style = getComputedStyle(button);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    context.fillStyle = style.color;
    context.fillRect(0, 0, 1, 1);
    const foreground = context.getImageData(0, 0, 1, 1).data;
    context.fillStyle = style.backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const background = context.getImageData(0, 0, 1, 1).data;
    return { foreground: Array.from(foreground), background: Array.from(background) };
}

// 从浏览器读到的前景和背景颜色计算对比度
function colorContrast(colors) {
    const first = relativeLuminance(colors.foreground);
    const second = relativeLuminance(colors.background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// 按 WCAG 的 sRGB 公式计算亮度，参数为画布读出的 RGB 分量
function relativeLuminance(channels) {
    const weights = [0.2126, 0.7152, 0.0722];
    let luminance = 0;
    for (let index = 0; index < 3; index = index + 1) {
        const channel = channels[index] / 255;
        let linear = channel / 12.92;
        if (channel > 0.04045) {
            linear = ((channel + 0.055) / 1.055) ** 2.4;
        }
        luminance = luminance + linear * weights[index];
    }
    return luminance;
}

// 核对整理和删除确认按钮的文字、语义颜色及悬停对比度
async function testConfirmationHover(page) {
    await page.locator("#arrange-wires").click();
    const accept = page.locator("#confirm-accept");
    assert.equal(await accept.textContent(), "确认整理");
    await accept.hover();
    await page.waitForTimeout(180);
    assert.ok(colorContrast(await accept.evaluate(buttonColors)) >= 4.5);
    await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "routing-hover.png"), fullPage: true });
    await page.locator("#confirm-cancel").click();
    await page.locator("#quick-delete").click();
    assert.equal(await accept.textContent(), "确认删除");
    await accept.hover();
    await page.waitForTimeout(180);
    assert.ok(colorContrast(await accept.evaluate(buttonColors)) >= 4.5);
    await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "delete-hover.png"), fullPage: true });
    await page.locator("#confirm-cancel").click();
}

// 验证预设色、自选色、只读保护及一次撤销恢复整批导线
async function testBatchColors(page) {
    const before = await exportedProject(page);
    await selectTwoWires(page);
    await page.locator("#wire-palette button[data-color='#d44f93']").click();
    const preset = await exportedProject(page);
    assert.equal(preset.wires[0].color, "#d44f93");
    assert.equal(preset.wires[1].color, "#d44f93");
    assert.equal(preset.wires[2].color, before.wires[2].color);
    await page.locator("#undo").click();
    assert.deepEqual((await exportedProject(page)).wires, before.wires);
    await selectTwoWires(page);
    await page.locator("#custom-color").fill("#123abc");
    await page.locator("#custom-color").dispatchEvent("input");
    const custom = await exportedProject(page);
    assert.equal(custom.wires[0].color, "#123abc");
    assert.equal(custom.wires[1].color, "#123abc");
    await page.locator("#read-only-toggle").check();
    await page.locator("#wire-palette button[data-color='#dc3545']").click();
    assert.deepEqual((await exportedProject(page)).wires, custom.wires);
    await page.locator("#read-only-toggle").uncheck();
    await page.locator("#undo").click();
    assert.deepEqual((await exportedProject(page)).wires, before.wires);
}

// 固定状态独立于选择，查看其他芯片、资料和备注后仍保留原芯片
async function testPinnedInformation(browser) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        await page.goto(URL);
        await page.locator("#inspect-panel [data-chip='U1']").click();
        await page.locator("#pin-chip-info").click();
        assert.equal(await page.locator("#pin-chip-info").getAttribute("aria-pressed"), "true");
        await page.locator(".chip-option[data-model='74LS138']").click();
        assert.match(await page.locator("#pinned-chip h2").textContent(), /U1/);
        assert.equal(await page.locator("#inspect-panel h2").textContent(), "74LS138");
        await page.keyboard.press("Escape");
        await page.locator("#tab-notes").click();
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        await page.locator("#read-only-toggle").check();
        assert.equal(await page.locator("#pin-chip-info").isEnabled(), true);
        assert.equal(await page.locator("#pin-chip-info").getAttribute("aria-pressed"), "true");
        await page.locator("#pin-chip-info").click();
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
        await page.locator("#read-only-toggle").uncheck();
        await page.locator("#tab-inspect").click();
        await page.locator("#inspect-panel [data-chip='U1']").click();
        await page.locator("#pin-chip-info").click();
        await page.locator("#tool-select").click();
        await clickPoint(page, { x: 420, y: 706 });
        assert.match(await page.locator("#pinned-chip h2").textContent(), /U1/);
        await page.locator("#pin-chip-info").click();
        assert.equal(await page.locator("#pin-chip-info").getAttribute("aria-pressed"), "false");
        await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "pin-toggle.png"), fullPage: true });
        await page.locator("#new-experiment").click();
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
    } finally {
        await page.close();
    }
}

// 逐项检查材料差异在介绍前部可见，并核对 NC 和双向引脚的文字
async function testChipReferenceWarnings(page) {
    for (const model of ["74LS20", "74LS85", "74LS112", "74LS194"]) {
        await page.locator(".chip-option[data-model='" + model + "']").click();
        assert.match(await page.locator("#inspect-panel .pin-warning").textContent(), /材料版脚号/);
    }
    await page.locator(".chip-option[data-model='74LS20']").click();
    assert.match(await page.locator(".catalog-pin-table tr").nth(3).textContent(), /空脚 NC/);
    await page.locator(".chip-option[data-model='74LS48']").click();
    assert.match(await page.locator(".catalog-pin-table tr").nth(4).textContent(), /输入\/输出/);
    await page.keyboard.press("Escape");
}

// 诊断任意电路并保持原输入、寄存器输出和接线，不按加法器示例判错
async function testGeneralDiagnostics(page) {
    const before = await exportedProject(page);
    const output = await page.locator("#binary-result").textContent();
    await page.locator("#diagnose-circuit").click();
    assert.equal(await page.locator("#audit-preset").count(), 0);
    assert.equal(await page.locator("#diagnostics-panel h2").textContent(), "当前电路诊断");
    assert.equal(await page.locator("#diagnostics-panel .diagnostic-chip").count(), before.chips.length);
    assert.equal(await page.locator("#binary-result").textContent(), output);
    assert.deepEqual(await exportedProject(page), before);
    await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "general-diagnostics.png"), fullPage: true });
    await page.locator("#read-only-toggle").check();
    assert.equal(await page.locator("#diagnose-circuit").isEnabled(), true);
    await page.locator("#diagnose-circuit").click();
    await page.locator("#read-only-toggle").uncheck();
    await page.locator("#tab-inspect").click();
}

// 核对保存隔离、草稿限制、选择切换、多选删除与导线端点拖动
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on("pageerror", collectError.bind(null, errors));
    try {
        await page.goto(URL);
        await page.waitForSelector(".chip-option");
        await page.waitForTimeout(250);
        await testAngleWiring(browser);
        await testGeneralDiagnostics(page);
        assert.equal(await page.locator("h1").first().textContent(), "SDU 面包板");
        assert.equal(await page.locator("#autosave-toggle").isChecked(), false);
        assert.equal(await page.evaluate(readSavedWorkspace), null);
        await page.keyboard.press("Control+s");
        const savedInitial = await page.evaluate(readSavedWorkspace);
        const presetId = savedInitial.activeId;
        await page.getByRole("button", { name: "切换 K0", exact: true }).click();
        assert.equal((await page.evaluate(readSavedWorkspace)).projects[presetId].switches[0], 0);
        await page.locator("#new-experiment").click();
        const blankId = await page.locator("#experiment-picker").inputValue();
        const count = await page.locator("#experiment-picker option").count();
        await page.locator("#new-experiment").click();
        assert.equal(await page.locator("#experiment-picker").inputValue(), blankId);
        assert.equal(await page.locator("#experiment-picker option").count(), count);
        await page.locator("#project-name").fill("空白实验手动保存");
        await page.locator("#project-name").press("Tab");
        await page.keyboard.press("Control+s");
        const savedBlank = await page.evaluate(readSavedWorkspace);
        assert.equal(savedBlank.projects[presetId].switches[0], 0);
        assert.equal(savedBlank.projects[blankId].name, "空白实验手动保存");
        await page.locator("#experiment-picker").selectOption(presetId, { force: true });
        assert.equal(await page.getByRole("button", { name: "切换 K0", exact: true }).getAttribute("aria-pressed"), "true");
        await page.keyboard.press("Control+s");
        assert.equal((await page.evaluate(readSavedWorkspace)).projects[presetId].switches[0], 1);
        await page.locator("#experiment-picker").selectOption(blankId, { force: true });
        await testDirectPlacement(page);
        await page.locator("#from-endpoint").fill("B0:A:1");
        await page.locator("#to-endpoint").fill("B0:A:5");
        await page.locator("#connect-endpoints").click();
        await page.locator("#tool-select").click();
        const first = endpointPosition("B0:A:1");
        await clickPoint(page, first);
        assert.equal(await page.locator("#inspect-panel h2").textContent(), "W1");
        await clickPoint(page, first);
        assert.match(await page.locator("#inspect-panel h2").textContent(), /A1/);
        await page.locator("#tab-wires").click();
        await page.locator("#wires-panel .wire-row button").first().click();
        const last = endpointPosition("B0:A:5");
        const next = endpointPosition("B0:A:7");
        const from = await screenPoint(page, last);
        const to = await screenPoint(page, next);
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(to.x, to.y, { steps: 5 });
        await page.mouse.up();
        assert.equal((await exportedProject(page)).wires[0].to, "B0:A:7");
        await page.getByRole("button", { name: "查看 74LS86 四路异或门", exact: true }).click();
        assert.match(await page.locator("#inspect-panel .chip-summary").textContent(), /异或门/);
        assert.equal(await page.locator("#inspect-panel .catalog-pin-table tr").count(), 15);
        assert.equal((await exportedProject(page)).chips.length, 0);
        assert.equal(await page.locator("#tool-place").getAttribute("aria-pressed"), "true");
        await clickPoint(page, { x: 250, y: 207 });
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        assert.match(await page.locator("#pinned-chip .chip-summary").textContent(), /异或门/);
        const chip = (await exportedProject(page)).chips[0];
        const chipPoint = { x: 90 + (chip.column - 1) * 18 + 50, y: 207 };
        await clickPoint(page, chipPoint);
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
        await clickPoint(page, chipPoint);
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        await page.keyboard.down("Control");
        await clickPoint(page, chipPoint);
        await page.keyboard.up("Control");
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
        await clickPoint(page, chipPoint);
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        await page.locator("#tab-wires").click();
        await page.keyboard.down("Control");
        await page.locator("#wires-panel .wire-row button").first().click();
        await page.keyboard.up("Control");
        assert.equal(await page.locator("#inspect-panel .selection-item").count(), 2);
        assert.equal(await page.locator("#inspect-panel .selection-item[data-kind='chip']").count(), 1);
        assert.equal(await page.locator("#inspect-panel .selection-item[data-kind='wire']").count(), 1);
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
        const selectedChip = page.locator("#inspect-panel .selection-item[data-kind='chip']");
        await selectedChip.locator("summary").click();
        assert.equal(await selectedChip.locator("details").getAttribute("open"), "");
        assert.equal(await selectedChip.locator(".pin-table tr").count(), 15);
        assert.equal(await page.locator("#inspect-panel .selection-item[data-kind='wire'] .selection-endpoint").count(), 2);
        await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "multi-selection.png"), fullPage: true });
        await page.getByRole("button", { name: "取消选择 W1", exact: true }).click();
        assert.equal(await page.locator("#inspect-panel .selection-item").count(), 0);
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        await page.locator("#tab-wires").click();
        await page.keyboard.down("Control");
        await page.locator("#wires-panel .wire-row button").first().click();
        await page.keyboard.up("Control");
        assert.equal(await page.locator("#inspect-panel .selection-item").count(), 2);
        await page.locator("#quick-delete").click();
        assert.match(await page.locator("#confirm-message").textContent(), /2 个对象/);
        await page.locator("#confirm-cancel").click();
        assert.equal((await exportedProject(page)).wires.length, 1);
        await page.locator("#quick-delete").click();
        await page.locator("#confirm-accept").click();
        const removed = await exportedProject(page);
        assert.equal(removed.wires.length, 0);
        assert.equal(removed.chips.length, 0);
        await page.keyboard.press("Control+s");
        const old = { version: 1, activeId: "preset1", projects: { preset1: complementPreset(), preset2: complementPreset(), blank1: emptyProject(), blank2: emptyProject() } };
        await page.evaluate(seedWorkspace, old);
        await page.reload();
        await page.waitForSelector(".chip-option");
        assert.equal(await page.locator("#experiment-picker option").count(), 2);
        await testBatchColors(page);
        await page.locator("#read-only-toggle").check();
        for (const model of ["74LS273", "74LS283", "74LS86", "74LS00", "74LS08", "74LS32", "74LS04"]) {
            await page.locator(".chip-option[data-model='" + model + "']").click();
            assert.equal(await page.locator("#inspect-panel h2").textContent(), model);
            assert.equal(await page.locator("#inspect-panel .chip-reference img").count(), 1);
            assert.equal(await page.locator("#place-catalog-chip").isDisabled(), true);
            assert.equal(await page.locator("#tool-place").isDisabled(), true);
            assert.equal(await page.locator("#tool-select").getAttribute("aria-pressed"), "true");
        }
        await page.locator("#read-only-toggle").uncheck();
        await testPresetRouting(page);
        await testConfirmationHover(page);
        await testGeneralWireRouting(page);
        await testPinnedInformation(browser);
        await testChipReferenceWarnings(page);
        assert.deepEqual(errors, []);
        console.log("交互验证通过：23种芯片放置、独立保存、多选改色、拖动端点、通用走线整理与撤销、确认按钮悬停对比度、只读保护");
        await page.locator("#save-project").click();
    } finally {
        await browser.close();
    }
}

await main();
