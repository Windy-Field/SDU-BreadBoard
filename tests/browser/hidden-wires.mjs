import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { BOARD, emptyProject } from "../../src/board/board.mjs";
import { openWorkbench } from "../helpers/announcement.mjs";
import { readImageDownload } from "../helpers/downloads.mjs";

const ADDRESS = pathToFileURL(path.resolve("index.html")).href;
const TRACE = { left: 250, right: 350, y: 92 };
const NEARBY_TRACE_OFFSET = 4;
const NARROW_VIEWPORTS = [{ width: 375, height: 800 }, { width: 667, height: 375 }];

// 导入两根近邻导线和一片芯片，核对混合选择时只隐藏导线
async function loadExample(page) {
    await openWorkbench(page, ADDRESS);
    const project = emptyProject();
    project.name = "隐藏导线测试";
    project.switches[0] = 1;
    project.chips.push({ id: "U1", model: "74LS08", section: 0, column: 10 });
    const bends = [{ x: 220, y: TRACE.y }, { x: 1000, y: TRACE.y }];
    project.wires.push({ id: "W1", from: "B3:J:49", to: "B0:A:49", color: "#ff0000", bends: bends });
    const nearbyY = TRACE.y + NEARBY_TRACE_OFFSET;
    const nearbyBends = [{ x: 220, y: nearbyY }, { x: 360, y: nearbyY }];
    project.wires.push({ id: "W10", from: "B0:A:1", to: "B0:A:8", color: "#1976d2", bends: nearbyBends });
    const file = { name: "visibility.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project)) };
    await page.locator("#import-file").setInputFiles(file);
    await page.locator("#inspect-panel [data-chip='U1']").waitFor();
    await page.locator("#save-project").click();
    await page.locator("#tool-select").click();
}

// 截取导线中段，统计未经变色的红色像素，虚线间隔不计入
function inspectTrace(canvas, trace) {
    const context = canvas.getContext("2d");
    const scale = canvas.width / trace.boardWidth;
    const width = (trace.right - trace.left) * scale;
    const pixels = context.getImageData(trace.left * scale, trace.y * scale, width, 1).data;
    let red = 0;
    for (let index = 0; index < pixels.length; index = index + 4) {
        if (pixels[index] === 255 && pixels[index + 1] === 0 && pixels[index + 2] === 0) {
            red = red + 1;
        }
    }
    return { width: width, red: red };
}

// 返回两根近邻导线在同一横坐标上的屏幕位置，避开端点和芯片
async function tracePoint(canvas, offset = 0) {
    const bounds = await canvas.boundingBox();
    const left = bounds.x + TRACE.left / BOARD.width * bounds.width;
    const top = bounds.y + (TRACE.y + offset) / BOARD.height * bounds.height;
    return { x: left, y: top };
}

// 验证最近导线优先，单击只选中，双击可以恢复和再次隐藏
async function testWireClicks(page, canvas, count, points) {
    const first = await tracePoint(canvas);
    const nearby = await tracePoint(canvas, NEARBY_TRACE_OFFSET);
    const selected = page.locator("#inspect-panel h2");
    await page.mouse.click(nearby.x, nearby.y);
    assert.equal(await selected.textContent(), "W10");
    await page.mouse.click(first.x, first.y);
    assert.equal(await selected.textContent(), "W1");
    assert.equal(await count.textContent(), "2");
    const selectedTrace = await canvas.evaluate(inspectTrace, points);
    assert.ok(selectedTrace.red > 0 && selectedTrace.red < selectedTrace.width);
    await page.mouse.dblclick(first.x, first.y);
    assert.equal(await selected.textContent(), "W1");
    assert.equal(await count.textContent(), "1");
    await page.mouse.dblclick(first.x, first.y);
    assert.equal(await count.textContent(), "2");

    // 只读模式也可撤销显示操作，且只改变刚才那根线
    await page.locator("#read-only-toggle").check();
    await page.locator("#undo").click();
    assert.equal(await count.textContent(), "1");
    await page.keyboard.press("Control+Shift+z");
    assert.equal(await count.textContent(), "2");
    await page.locator("#read-only-toggle").uncheck();
}

// 只选芯片时不能隐藏，再加入两根线验证混合选择
async function selectChipAndWires(page, count) {
    await page.locator("#inspect-panel [data-chip='U1']").click();
    assert.equal(await page.locator("#hide-selected").isDisabled(), true);
    const chipPanel = page.locator("#pinned-chip h2");
    await page.keyboard.press("Control+h");
    assert.equal(await count.textContent(), "0");
    assert.match(await chipPanel.textContent(), /U1/);
    assert.equal(await page.locator("#undo").isDisabled(), true);
    await page.locator("#tab-wires").click();
    const secondWireButtons = page.locator("button[data-wire='W10']");
    await secondWireButtons.first().click({ modifiers: ["Control"] });
    await page.locator("#tab-wires").click();
    const firstWireButtons = page.locator("button[data-wire='W1']");
    await firstWireButtons.first().click({ modifiers: ["Control"] });
}

// 检查窄屏上的搜索框、结果和恢复按钮都在弹窗内
async function checkNarrowLayout(page, dialog, search) {
    for (const viewport of NARROW_VIEWPORTS) {
        await page.setViewportSize(viewport);
        const panel = await dialog.boundingBox();
        const input = await search.boundingBox();
        const restore = await page.locator("#restore-all-objects").boundingBox();
        assert.ok(panel.x >= 0 && panel.x + panel.width <= viewport.width);
        assert.ok(input.y >= panel.y && restore.y + restore.height <= panel.y + panel.height);
    }
}

// 验证隐藏、搜索恢复、虚线点击和批量恢复，电路数据不受视图操作影响
async function testVisibility(page) {
    const count = page.locator("#hidden-object-count");
    const canvas = page.locator("#board-canvas");
    const result = page.locator("[data-output-led='0']");
    const points = { left: TRACE.left, right: TRACE.right, y: TRACE.y, boardWidth: BOARD.width };
    const before = await readImageDownload(page, "#export-project", "json", "breadboard-circuit.json");
    const output = await result.getAttribute("data-value");
    assert.equal(output, "1");
    const original = await canvas.evaluate(inspectTrace, points);
    assert.equal(original.red, original.width);
    await selectChipAndWires(page, count);
    await page.keyboard.press("Control+h");
    assert.equal(await count.textContent(), "2");
    assert.match(await page.locator("#pinned-chip h2").textContent(), /U1/);
    assert.equal(await result.getAttribute("data-value"), output);
    assert.equal(await page.locator("#save-status").textContent(), "无未保存更改");
    const hidden = await canvas.evaluate(inspectTrace, points);
    assert.ok(hidden.red > 0 && hidden.red < hidden.width);
    const exported = await readImageDownload(page, "#export-project", "json", "breadboard-circuit.json");
    assert.deepEqual(exported, before);

    await testWireClicks(page, canvas, count, points);
    await canvas.focus();
    await page.keyboard.press("Control+Shift+h");
    const dialog = page.getByRole("dialog", { name: "已隐藏导线" });
    const search = dialog.getByRole("searchbox");
    await dialog.waitFor();
    assert.equal(await dialog.getByRole("listitem").count(), 2);
    await search.fill("W1");
    assert.equal(await dialog.getByRole("listitem").count(), 1);
    await search.fill("K0 L0");
    assert.equal(await dialog.getByRole("listitem").count(), 1);
    await search.press("Enter");
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await count.textContent(), "1");

    await page.locator("#hidden-objects").click();
    await search.fill("W10");
    assert.equal(await dialog.getByRole("listitem").count(), 1);
    await checkNarrowLayout(page, dialog, search);
    await page.locator("#restore-all-objects").click();
    assert.equal(await count.textContent(), "0");
    await page.keyboard.press("Control+z");
    assert.equal(await count.textContent(), "1");
    await page.keyboard.press("Control+z");
    assert.equal(await count.textContent(), "2");
    assert.equal(await result.getAttribute("data-value"), output);
    assert.equal(await page.locator("#save-status").textContent(), "无未保存更改");
}

// 使用隔离的浏览器页面运行视图测试，不碰用户实验或浏览器设置
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, reducedMotion: "reduce" });
        await loadExample(page);
        await testVisibility(page);
        console.log("隐藏导线验证通过：芯片保持可见、彩色虚线、双击切换、撤销重做和存档隔离");
    } finally {
        await browser.close();
    }
}

await main();
