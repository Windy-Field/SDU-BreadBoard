import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { complementPreset } from "../src/presets.mjs";
import { emptyProject, endpointPosition, BOARD } from "../src/board.mjs";

const ROOT = process.cwd();
const URL = pathToFileURL(path.join(ROOT, "index.html")).href;

// 读取浏览器中的已保存实验，返回序列化对象而不访问应用内部状态。
function readSavedWorkspace() {
    const saved = localStorage.getItem("breadboard-lab-workspace-v1");
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
}

// 把测试用旧实验列表写入这个独立浏览器上下文，验证升级清理逻辑。
function seedWorkspace(workspace) {
    localStorage.setItem("breadboard-lab-workspace-v1", JSON.stringify(workspace));
}

// 获取测试端点在浏览器窗口里的位置，适用于缩放后的画布。
async function screenPoint(page, point) {
    const bounds = await page.locator("#board-canvas").boundingBox();
    return { x: bounds.x + point.x / BOARD.width * bounds.width, y: bounds.y + point.y / BOARD.height * bounds.height };
}

// 在画布逻辑坐标上单击，坐标由端口或芯片布局得出。
async function clickPoint(page, point) {
    const position = await screenPoint(page, point);
    await page.mouse.click(position.x, position.y);
}

// 导出当前实验供断言，不依赖编译产物中的私有变量。
async function exportedProject(page) {
    const waiting = page.waitForEvent("download");
    await page.locator("#export-project").click();
    const download = await waiting;
    const file = await download.path();
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

// 记录脚本错误，最后一并检查。
function collectError(errors, error) {
    errors.push(error.message);
}

// 从导线列表选择两根导线，使用真实的 Ctrl 点击保留多选。
async function selectTwoWires(page) {
    await page.locator("#tab-wires").click();
    await page.locator("#wires-panel button[data-wire='W1']").first().click();
    await page.locator("#tab-wires").click();
    await page.keyboard.down("Control");
    await page.locator("#wires-panel button[data-wire='W2']").first().click();
    await page.keyboard.up("Control");
    assert.equal(await page.locator("#inspect-panel .selection-item[data-kind='wire']").count(), 2);
}

// 验证预设色、自选色、只读保护及一次撤销恢复整批导线。
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

// 核对保存隔离、草稿限制、选择切换、多选删除与导线端点拖动。
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on("pageerror", collectError.bind(null, errors));
    try {
        await page.goto(URL);
        await page.waitForSelector(".chip-option");
        await page.waitForTimeout(250);
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
        await page.locator("#experiment-picker").selectOption(presetId);
        assert.equal(await page.getByRole("button", { name: "切换 K0", exact: true }).getAttribute("aria-pressed"), "true");
        await page.keyboard.press("Control+s");
        assert.equal((await page.evaluate(readSavedWorkspace)).projects[presetId].switches[0], 1);
        await page.locator("#experiment-picker").selectOption(blankId);
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
        await page.locator("#place-catalog-chip").click();
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
        }
        await page.locator("#read-only-toggle").uncheck();
        assert.deepEqual(errors, []);
        console.log("交互验证通过：当前实验独立保存、空白去重、重复点击、Ctrl多选、批量改色、删除确认、拖动端点与旧列表整理。");
        await page.locator("#save-project").click();
    } finally {
        await browser.close();
    }
}

await main();
