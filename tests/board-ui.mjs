import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BOARD, endpointPosition, portHole } from "../src/board.mjs";

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

// 检查真实插孔操作、板载非插孔区域和内部电平标识
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    try {
        await page.goto(pathToFileURL(path.join(process.cwd(), "index.html")).href);
        await page.locator("#new-experiment").click();
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
        assert.ok((await page.evaluate(readLabels)).includes("X"), "冲突节点应显示 X");
        console.log("板面验证通过：板载标识不可插线、真实孔连接、直连电平、内部示意和字符电平标签");
    } finally {
        await browser.close();
    }
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
