import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readImageDownload } from "../helpers/downloads.mjs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { openWorkbench } from "../helpers/announcement.mjs";
import { BOARD, columnX, endpointPosition, portHole, rowY } from "../../src/board/board.mjs";
import { APP_VERSION } from "../../src/version.mjs";

// 板面底图只绘制一次，在应用启动前登记卡槽里的列号绘制位置
function recordTrenchLabels(ranges) {
    const original = CanvasRenderingContext2D.prototype.fillText;
    window.trenchLabels = {};
    window.extraColumnLabels = [];

    // 记录每块板沟槽里的数字和横坐标，其他文字照常绘制
    function recordText(text, horizontal, vertical) {
        // 只记录底图首列及其右侧的数字，排除芯片脚号和左侧板块编号
        if (!this.canvas.isConnected && horizontal >= ranges[0].firstColumn && /^\d+$/.test(text)) {
            let inTrench = false;
            for (const range of ranges) {
                if (vertical > range.top && vertical < range.bottom) {
                    const key = range.section + ":" + text;
                    window.trenchLabels[key] = horizontal;
                    inTrench = true;
                }
            }
            if (!inTrench) {
                window.extraColumnLabels.push(text);
            }
        }
        original.call(this, text, horizontal, vertical);
    }

    CanvasRenderingContext2D.prototype.fillText = recordText;
}

// 返回四块面包板 E、F 两排之间的坐标范围
function trenchRanges() {
    const ranges = [];
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        ranges.push({ section: section, top: rowY(section, "E"), bottom: rowY(section, "F"), firstColumn: columnX(1) });
    }
    return ranges;
}

// 读取底图上实际绘制的列号，而不是读取预设数据
function readTrenchLabels() {
    return { labels: window.trenchLabels, extra: window.extraColumnLabels };
}

// 核对每块板只标奇数列，且编号与对应插孔的横坐标一致
async function testTrenchLabels(page) {
    const recorded = await page.evaluate(readTrenchLabels);
    const labels = recorded.labels;
    assert.deepEqual(recorded.extra, [], "卡槽之外不应绘制列号");
    const oddColumns = Math.ceil(BOARD.columns / 2);
    assert.equal(Object.keys(labels).length, BOARD.sections * oddColumns);
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        for (let column = 1; column <= BOARD.columns; column = column + 2) {
            const key = section + ":" + column;
            assert.equal(labels[key], columnX(column), "卡槽列号位置错误：" + key);
        }
    }
}

// 记录画布真正绘制的文字，检查节点标签而不依赖颜色猜测
function recordLabels() {
    const context = document.getElementById("board-canvas").getContext("2d");
    window.boardLabels = [];
    const original = context.fillText;
    // 保留原始绘图，同时记录每次文字及坐标
    function recordText(text, horizontal, vertical) {
        window.boardLabels.push(String(text));
        original.call(context, text, horizontal, vertical);
    }
    context.fillText = recordText;
}

// 读取测试期间实际绘制过的字符
function readLabels() {
    return window.boardLabels;
}

// 读取输出板下方固定连线上的像素，检查默认可见且内部模式下会加深
function readConnectionPixel(point) {
    const canvas = document.getElementById("board-canvas");
    const context = canvas.getContext("2d");
    const pixel = context.getImageData(point.x * 2, point.y * 2, 1, 1).data;
    return Array.from(pixel);
}

// 将画布逻辑坐标换算到浏览器位置并单击
async function clickPoint(page, point) {
    const bounds = await page.locator("#board-canvas").boundingBox();
    await page.mouse.click(bounds.x + point.x / BOARD.width * bounds.width, bounds.y + point.y / BOARD.height * bounds.height);
}

// 读取平移位置与实际光标，缩放后仍按屏幕像素核对移动距离
function readBoardView() {
    const viewport = document.getElementById("board-viewport");
    const canvas = document.getElementById("board-canvas");
    return {
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        cursor: window.getComputedStyle(canvas).cursor,
        panning: viewport.classList.contains("board-panning")
    };
}

// 等缩放动画到达上限后再拖动，避免动画改变测试时的画布位置
function boardZoomReady() {
    return document.getElementById("zoom-label").textContent === "200%";
}

// 连续派发鼠标移动，记录两帧内实画的次数并恢复画布原有方法
async function countHoverPaints(point) {
    const canvas = document.getElementById("board-canvas");
    const bounds = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    const clear = context.clearRect;
    let paints = 0;
    // 只记录清屏次数，不改变清屏参数或绘制结果
    function countClear(left, top, width, height) {
        paints = paints + 1;
        clear.call(context, left, top, width, height);
    }
    context.clearRect = countClear;
    try {
        const clientX = bounds.left + point.x / canvas.clientWidth * bounds.width;
        const clientY = bounds.top + point.y / canvas.clientHeight * bounds.height;
        for (let index = 40; index >= 0; index = index - 1) {
            const location = { clientX: clientX + index, clientY: clientY };
            canvas.dispatchEvent(new PointerEvent("pointermove", location));
        }
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        return paints;
    } finally {
        context.clearRect = clear;
    }
}

// 导出当前实验核对平移前后结构不变，不读取应用内部状态
async function readProject(page) {
    const content = await readImageDownload(page, "#export-project", "json", "breadboard-circuit.json");
    return content.toString("utf8");
}

// 在各工具模式下按住左键平移，松开后不能新增接线、放置芯片或发起删除
async function dragBoardView(page) {
    const viewport = page.locator("#board-viewport");
    const bounds = await viewport.boundingBox();
    const startX = bounds.x + bounds.width * 0.6;
    const startY = bounds.y + bounds.height * 0.5;
    const before = await page.evaluate(readBoardView);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 70, startY - 50, { steps: 6 });
    const moving = await page.evaluate(readBoardView);
    assert.equal(moving.cursor, "grabbing");
    assert.equal(moving.panning, true);
    await page.mouse.up();
    const after = await page.evaluate(readBoardView);
    assert.equal(after.panning, false);
    assert.equal(after.cursor, "grab");
    assert.ok(Math.abs(after.scrollLeft - before.scrollLeft - 70) <= 1);
    assert.ok(Math.abs(after.scrollTop - before.scrollTop - 50) <= 1);
    assert.equal(await page.locator("#confirm-dialog").isVisible(), false);
}

// 检查左键平移、只读操作和鼠标移出画布时的释放，随后恢复原测试的缩放位置
async function testBoardPan(page) {
    const before = await readProject(page);
    const viewport = page.locator("#board-viewport");
    const bounds = await viewport.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -5000);
    await page.keyboard.up("Control");
    await page.waitForFunction(boardZoomReady);
    for (const tool of ["#tool-wire", "#tool-select", "#tool-delete"]) {
        await page.locator(tool).click();
        await dragBoardView(page);
    }
    const chipOption = page.locator(".chip-option[data-model='74LS86']");
    await chipOption.click();
    await dragBoardView(page);
    await page.keyboard.press("Escape");
    assert.equal(await readProject(page), before);
    await page.locator("#read-only-toggle").check();
    await dragBoardView(page);
    assert.equal(await readProject(page), before);
    await page.locator("#read-only-toggle").uncheck();

    // 捕获鼠标后，即使松开位置在侧栏上，也必须释放小手拖动状态
    const startX = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 20, startY, { steps: 2 });
    await page.mouse.move(bounds.x - 20, startY, { steps: 5 });
    await page.mouse.up();
    assert.equal((await page.evaluate(readBoardView)).panning, false);
    assert.equal(await readProject(page), before);
    await page.locator("#fit-board").click();
    await viewport.evaluate(scrollToTop);
}

// 检查真实插孔操作、板载非插孔区域和内部电平标识
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        const address = pathToFileURL(path.join(process.cwd(), "index.html"));
        await page.addInitScript(recordTrenchLabels, trenchRanges());
        await openWorkbench(page, address.href);
        assert.equal(await page.locator("#app-version").textContent(), "Version: " + APP_VERSION);
        await testTrenchLabels(page);
        await page.locator("#new-experiment").click();
        const hoverHole = endpointPosition("B0:A:4");
        assert.equal(await page.evaluate(countHoverPaints, hoverHole), 1);
        assert.match(await page.locator("#pointer-status").textContent(), /A4/);
        await testBoardPan(page);
        const linePoint = { x: endpointPosition("L0").x, y: 83 };
        const defaultPixel = await page.evaluate(readConnectionPixel, linePoint);
        const besidePixel = await page.evaluate(readConnectionPixel, { x: linePoint.x + 4, y: linePoint.y });
        assert.notDeepEqual(defaultPixel, besidePixel, "固定细线应在默认状态下可见");
        const bridgePoint = { x: endpointPosition("K0").x, y: 950 };
        const bridgePixel = await page.evaluate(readConnectionPixel, bridgePoint);
        const besideBridge = await page.evaluate(readConnectionPixel, { x: bridgePoint.x + 4, y: bridgePoint.y });
        assert.notDeepEqual(bridgePixel, besideBridge, "第四块输入对应列应有常显桥接细线");
        await page.locator("#show-internals").check();
        await page.waitForTimeout(240);
        const emphasizedPixel = await page.evaluate(readConnectionPixel, linePoint);
        assert.notDeepEqual(defaultPixel, emphasizedPixel, "内部连通模式应加深固定细线");
        await page.locator("#show-internals").uncheck();
        await page.locator("#tool-wire").click();
        await page.locator("#board-viewport").evaluate(scrollToBottom);
        await clickPoint(page, endpointPosition("K0"));
        assert.equal(await page.locator("#cancel-wire").isDisabled(), true);
        await clickPoint(page, endpointPosition(portHole("K0")));
        assert.equal(await page.locator("#cancel-wire").isDisabled(), false);
        await page.keyboard.press("Escape");
        await page.locator("#from-endpoint").fill("K0");
        await page.locator("#to-endpoint").fill("B0:A:1");
        await page.locator("#connect-endpoints").click();
        assert.equal(await page.locator("#wire-count").textContent(), "0");
        await page.locator("#tool-select").click();
        await clickPoint(page, endpointPosition("B3:H:49"));
        assert.equal(await page.locator(".node-value").textContent(), "0 · 低电平");
        await page.getByRole("button", { name: "切换 K0", exact: true }).click();
        assert.equal(await page.locator(".node-value").textContent(), "1 · 高电平");
        await clickPoint(page, endpointPosition("B3:B:49"));
        assert.equal(await page.locator(".node-value").textContent(), "1 · 高电平");
        await clickPoint(page, endpointPosition("B3:B:48"));
        assert.equal(await page.locator(".node-value").textContent(), "Z · 悬空");
        await page.evaluate(recordLabels);
        await page.locator("#show-levels").check();
        await page.locator("#show-internals").check();
        await page.waitForTimeout(240);
        const labels = await page.evaluate(readLabels);
        assert.ok(labels.includes("Z"));
        assert.ok(labels.includes("0"));
        assert.ok(labels.includes("1"));
        await page.screenshot({ path: path.join(process.cwd(), "reports", "screenshots", "fourth-board-bridges.png"), fullPage: true });
        await page.locator("#board-viewport").evaluate(scrollToTop);
        await page.screenshot({ path: path.join(process.cwd(), "reports", "screenshots", "board-internals-levels.png"), fullPage: true });
        await page.locator("#from-endpoint").fill("R:GND:0");
        await page.locator("#to-endpoint").fill("R:VCC:0");
        await page.locator("#connect-endpoints").click();
        await page.waitForFunction(conflictLabelDrawn);
        console.log("板面验证通过：版本号、卡槽列号、左键平移、工具与只读兼容、真实孔连接、内部示意和电平标签");
    } finally {
        await browser.close();
    }
}

// 等待异步布线成功后画出冲突电平，不把一次点击等同于接线完成
function conflictLabelDrawn() {
    return window.boardLabels.includes("X");
}

// 滚动画布到输入板附近，不影响左侧或整个页面
function scrollToBottom(viewport) {
    viewport.scrollTop = viewport.scrollHeight;
}

// 恢复画布顶部，便于核对输出板和电源轨
function scrollToTop(viewport) {
    viewport.scrollTop = 0;
}

await main();
