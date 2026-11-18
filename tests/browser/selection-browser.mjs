import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readImageDownload } from "../helpers/downloads.mjs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BOARD, emptyProject } from "../../src/board/board.mjs";

// 测试入口和截图只指向本地项目与测试报告，不更新产品的最新页面图片
const ROOT = process.cwd();
const URL = pathToFileURL(path.join(ROOT, "index.html")).href;

// 在屏幕坐标中按住右键拖动，过程中检查选框可见，松开后检查已清理
async function dragBox(page, viewport, first, last, multiple = false) {
    if (multiple) {
        await page.keyboard.down("Control");
    }
    await page.mouse.move(first.x, first.y);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(last.x, last.y, { steps: 6 });
    assert.equal(await viewport.locator(".viewport-selection-box").isVisible(), true);
    await page.screenshot({ path: path.join(ROOT, "reports", "screenshots", "selection-box.png"), fullPage: true });
    await page.mouse.up({ button: "right" });
    if (multiple) {
        await page.keyboard.up("Control");
    }
    assert.equal(await viewport.locator(".viewport-selection-box").isVisible(), false);
}

// 将面包板坐标转换为屏幕位置，适用于缩放和滚动后的选框
async function boardPoint(page, horizontal, vertical) {
    const bounds = await page.locator("#board-canvas").boundingBox();
    return { x: bounds.x + horizontal / BOARD.width * bounds.width, y: bounds.y + vertical / BOARD.height * bounds.height };
}

// 读取导出内容，检查选择操作没有改动电路或输入状态
async function exportedProject(page) {
    const content = await readImageDownload(page, "#export-project", "json", "breadboard-circuit.json");
    return JSON.parse(content.toString("utf8"));
}

// 使用简单的两芯片一导线电路验证替换、追加、只读、空框与取消
async function testBoardSelection(browser) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        await page.goto(URL);
        const project = emptyProject();
        project.chips = [
            { id: "U1", model: "74LS08", section: 0, column: 10 },
            { id: "U2", model: "74LS86", section: 0, column: 25 }
        ];
        project.wires = [{ id: "W1", from: "B0:A:1", to: "B0:A:8", color: "#1976d2", bends: [{ x: 90, y: 90 }, { x: 216, y: 90 }] }];
        await page.locator("#import-file").setInputFiles({ name: "selection.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project)) });
        await page.waitForFunction(twoChipsReady);
        const before = await exportedProject(page);
        const viewport = page.locator("#board-viewport");
        await dragBox(page, viewport, await boardPoint(page, 230, 175), await boardPoint(page, 390, 235));
        assert.match(await page.locator("#pinned-chip h2").textContent(), /U1/);
        await dragBox(page, viewport, await boardPoint(page, 660, 235), await boardPoint(page, 500, 175), true);
        assert.equal(await page.locator(".selection-item[data-kind='chip']").count(), 2);
        await page.locator("#tool-select").click();
        const firstChip = await boardPoint(page, 300, 205);
        const secondChip = await boardPoint(page, 570, 205);
        await page.mouse.click(firstChip.x, firstChip.y);
        assert.match(await page.locator("#pinned-chip h2").textContent(), /U2/);
        await page.keyboard.down("Control");
        await page.mouse.click(firstChip.x, firstChip.y);
        await page.keyboard.up("Control");
        assert.equal(await page.locator(".selection-item[data-kind='chip']").count(), 2);
        await page.keyboard.down("Control");
        await page.mouse.click(secondChip.x, secondChip.y);
        await page.keyboard.up("Control");
        assert.match(await page.locator("#pinned-chip h2").textContent(), /U1/);
        await page.locator("#read-only-toggle").check();
        await dragBox(page, viewport, await boardPoint(page, 80, 80), await boardPoint(page, 225, 130));
        assert.equal(await page.locator("#inspect-panel h2").textContent(), "W1");
        assert.equal(await page.locator(".selection-item[data-kind='chip']").count(), 0);
        const first = await boardPoint(page, 700, 330);
        const last = await boardPoint(page, 760, 360);
        await page.mouse.move(first.x, first.y);
        await page.mouse.down({ button: "right" });
        await page.mouse.move(last.x, last.y, { steps: 3 });
        await page.keyboard.press("Escape");
        await page.mouse.up({ button: "right" });
        assert.equal(await viewport.locator(".viewport-selection-box").isVisible(), false);
        assert.equal(await page.locator("#inspect-panel h2").textContent(), "W1");
        await dragBox(page, viewport, first, last);
        assert.equal(await page.locator(".selection-item").count(), 0);
        assert.deepEqual(await exportedProject(page), before);
    } finally {
        await page.close();
    }
}

// 导入完成后再框选，避免页面仍显示默认示例
function twoChipsReady() {
    return document.getElementById("circuit-count").textContent.includes("2 片芯片");
}

// 等待自动布局和图纸绘制完成
function diagramReady() {
    return document.getElementById("logic-diagram-dialog").getAttribute("aria-busy") === "false" &&
        document.querySelectorAll("#logic-diagram .logic-edge").length > 0;
}

// 收集屏幕内不同网络的可见分岔点，真实点击用于验证 Ctrl 多选
function visibleNetworkPoints() {
    const viewport = document.getElementById("logic-diagram-scroll").getBoundingClientRect();
    const points = [];
    const seen = new Set();
    for (const dot of document.querySelectorAll("#logic-diagram .logic-junction")) {
        const bounds = dot.getBoundingClientRect();
        const horizontal = bounds.left + bounds.width / 2;
        const vertical = bounds.top + bounds.height / 2;
        if (horizontal > viewport.left + 12 && horizontal < viewport.right - 12 &&
            vertical > viewport.top + 12 && vertical < viewport.bottom - 12 && !seen.has(dot.dataset.net)) {
            seen.add(dot.dataset.net);
            points.push({ x: horizontal, y: vertical, id: dot.dataset.net });
        }
    }
    return points;
}

// 读取高亮网络编号，同一网络的多个分支只记录一次
function selectedNetworkIds() {
    const ids = new Set();
    for (const shape of document.querySelectorAll("#logic-diagram .logic-active-net")) {
        ids.add(shape.dataset.net);
    }
    return Array.from(ids);
}

// 验证逻辑图 Ctrl 增减、批量端点、缩放后框选和空框取消
async function testLogicSelection(browser) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        await page.goto(URL);
        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramReady);
        const points = await page.evaluate(visibleNetworkPoints);
        assert.ok(points.length >= 2);
        await page.mouse.click(points[0].x, points[0].y);
        await page.keyboard.down("Control");
        await page.mouse.click(points[1].x, points[1].y);
        await page.keyboard.up("Control");
        assert.equal((await page.evaluate(selectedNetworkIds)).length, 2);
        assert.equal(await page.locator("#logic-network-members strong").count(), 2);
        await page.keyboard.down("Control");
        await page.mouse.click(points[0].x, points[0].y);
        await page.keyboard.up("Control");
        assert.deepEqual(await page.evaluate(selectedNetworkIds), [points[1].id]);
        const viewport = page.locator("#logic-diagram-scroll");
        await page.locator("#logic-zoom-in").click();
        const bounds = await viewport.boundingBox();
        await dragBox(page, viewport, { x: bounds.x + 5, y: bounds.y + 5 }, { x: bounds.x + bounds.width - 20, y: bounds.y + bounds.height - 20 });
        assert.ok((await page.evaluate(selectedNetworkIds)).length >= 2);
        const previous = await page.evaluate(selectedNetworkIds);
        await page.locator("#logic-fit").click();
        const selectedPoints = await page.evaluate(visibleNetworkPoints);
        const removed = new Set();
        for (let index = 0; index < 2; index = index + 1) {
            const point = selectedPoints[index];
            assert.ok(previous.includes(point.id));
            if (index === 1) {
                await page.keyboard.down("Control");
            }
            await page.mouse.click(point.x, point.y);
            if (index === 1) {
                await page.keyboard.up("Control");
            }
            removed.add(point.id);
            const remaining = await page.evaluate(selectedNetworkIds);
            assert.equal(remaining.length, previous.length - removed.size);
            for (const id of previous) {
                assert.equal(remaining.includes(id), !removed.has(id));
            }
        }
        const retained = await page.evaluate(selectedNetworkIds);
        const svgBounds = await page.locator("#logic-diagram").boundingBox();
        const first = { x: svgBounds.x + 5, y: svgBounds.y + 5 };
        const last = { x: svgBounds.x + 20, y: svgBounds.y + 20 };
        await dragBox(page, viewport, first, last, true);
        assert.deepEqual(await page.evaluate(selectedNetworkIds), retained);
        await dragBox(page, viewport, first, last);
        assert.deepEqual(await page.evaluate(selectedNetworkIds), []);
        assert.equal(await page.locator("#logic-network-members").textContent(), "");
    } finally {
        await page.close();
    }
}

// 用独立浏览器上下文检查两种画布，不修改用户的存档
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        await testBoardSelection(browser);
        await testLogicSelection(browser);
        console.log("框选验证通过：面包板芯片及导线、反向框选、Ctrl追加、只读、Escape取消、逻辑图多网络及Ctrl增减");
    } finally {
        await browser.close();
    }
}

await main();
