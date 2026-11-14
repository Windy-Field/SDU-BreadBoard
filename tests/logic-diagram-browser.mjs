import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildLogicDiagram } from "../src/logic-diagram.mjs";
import { complementPreset } from "../src/presets.mjs";
import { createRuntime, simulate } from "../src/engine.mjs";

// 截图只写入测试报告目录，验证结果不接触用户浏览器的实验数据
const ROOT = process.cwd();
const SCREENSHOTS = path.join(ROOT, "reports", "screenshots");

// 布局返回且已绘制实际元件时才继续检查
function diagramReady() {
    const dialog = document.getElementById("logic-diagram-dialog");
    return dialog.getAttribute("aria-busy") === "false" &&
        document.querySelectorAll("#logic-diagram .logic-component").length > 0;
}

// 图纸和弹窗都应在视口内，超出的图纸只在画布容器里滚动
function readDiagramSize() {
    const dialog = document.getElementById("logic-diagram-dialog").getBoundingClientRect();
    const canvas = document.getElementById("logic-diagram-scroll");
    return {
        left: dialog.left,
        right: dialog.right,
        top: dialog.top,
        bottom: dialog.bottom,
        width: window.innerWidth,
        height: window.innerHeight,
        canvasWidth: canvas.clientWidth,
        canvasHeight: canvas.clientHeight,
        pageWidth: document.documentElement.scrollWidth
    };
}

// 将当前电路导出到浏览器临时下载区，供操作前后比对
async function readProject(page) {
    const waiting = page.waitForEvent("download");
    await page.locator("#export-project").click();
    const download = await waiting;
    const filename = await download.path();
    return fs.readFileSync(filename, "utf8");
}

// 记录脚本错误，错误列表在测试末尾统一核对
function collectError(errors, error) {
    errors.push(error.message);
}

// 用独立模型找到加减控制网络，不在测试中写死网络序号
function controlNetwork() {
    const project = complementPreset();
    const diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    for (const network of diagram.nets) {
        for (const terminal of network.members) {
            if (terminal.owner === "K5") {
                return network.id;
            }
        }
    }
    throw new Error("没有找到加减控制网络");
}

// 检查所有元件框均不重叠，实际图纸包含连线与已编号的芯片门
function inspectDiagramGeometry() {
    const svg = document.getElementById("logic-diagram");
    const blocks = svg.querySelectorAll(".logic-component");
    let overlaps = 0;
    for (let first = 0; first < blocks.length; first = first + 1) {
        const current = blocks[first].getBoundingClientRect();
        for (let second = first + 1; second < blocks.length; second = second + 1) {
            const next = blocks[second].getBoundingClientRect();
            if (current.left < next.right - 1 && current.right > next.left + 1 &&
                current.top < next.bottom - 1 && current.bottom > next.top + 1) {
                overlaps = overlaps + 1;
            }
        }
    }
    return { overlaps: overlaps, paths: svg.querySelectorAll(".logic-wire").length, nodes: blocks.length };
}

// 记录所有线路的几何路径，选中网络只应改变颜色和线宽
function readWirePaths() {
    const paths = [];
    for (const wire of document.querySelectorAll("#logic-diagram .logic-wire")) {
        paths.push(wire.getAttribute("d"));
    }
    return paths;
}

// 分岔点必须是位于独立上层的大实心圆点，相同网络的同一位置只画一次
function inspectJunctions() {
    const svg = document.getElementById("logic-diagram");
    const layer = svg.querySelector(".logic-junction-layer");
    const keys = new Set();
    let minimum = Infinity;
    for (const dot of layer.querySelectorAll(".logic-junction")) {
        const radius = Number(dot.getAttribute("r"));
        minimum = Math.min(minimum, radius);
        keys.add(dot.dataset.net + ":" + dot.getAttribute("cx") + ":" + dot.getAttribute("cy"));
    }
    const previous = layer.previousElementSibling;
    return {
        count: layer.childElementCount,
        unique: keys.size,
        minimum: minimum,
        aboveWires: previous.classList.contains("logic-edge")
    };
}

// 检查焦点呈现在原线路上，不用线路外接矩形制造出额外的假连线
function readFocusedWire() {
    const group = document.activeElement;
    const path = group.querySelector(".logic-wire");
    const outline = window.getComputedStyle(group).outlineStyle;
    const width = window.getComputedStyle(path).strokeWidth;
    return { outline: outline, width: Number.parseFloat(width) };
}

// 读取鼠标所指的图纸坐标和滚动位置，用来核对缩放是否保持观察点
function readDiagramPosition(point) {
    const viewport = document.getElementById("logic-diagram-scroll");
    const svg = document.getElementById("logic-diagram");
    const bounds = svg.getBoundingClientRect();
    const scale = bounds.width / svg.viewBox.baseVal.width;
    return {
        diagramX: (point.x - bounds.left) / scale,
        diagramY: (point.y - bounds.top) / scale,
        scale: scale,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        cursor: window.getComputedStyle(viewport).cursor
    };
}

// 等待浏览器真正应用滚轮滚动，而不是依靠固定延时猜测完成时间
function diagramScrolled(previous) {
    const viewport = document.getElementById("logic-diagram-scroll");
    return viewport.scrollLeft !== previous.scrollLeft || viewport.scrollTop !== previous.scrollTop;
}

// 滚轮事件异步到达浏览器，缩放标签变化后再读取位置
function diagramZoomChanged(previous) {
    return document.getElementById("logic-zoom-label").textContent !== previous;
}

// 在画布内部找到可拖动的真实分岔点，避免测试点落在线路外
function visibleJunction() {
    const viewport = document.getElementById("logic-diagram-scroll");
    const bounds = viewport.getBoundingClientRect();
    for (const dot of document.querySelectorAll("#logic-diagram .logic-junction")) {
        const point = dot.getBoundingClientRect();
        const centerX = point.left + point.width / 2;
        const centerY = point.top + point.height / 2;
        if (centerX > bounds.left + 100 && centerX < bounds.right - 100 &&
            centerY > bounds.top + 100 && centerY < bounds.bottom - 100) {
            return { x: centerX, y: centerY, netId: dot.dataset.net };
        }
    }
    throw new Error("画布内没有找到可拖动的分岔点");
}

// 将指定分岔点移到画布中央，放大后也能从真实线路开始拖动
function centerDiagramJunction(dot) {
    const viewport = document.getElementById("logic-diagram-scroll");
    const bounds = viewport.getBoundingClientRect();
    const point = dot.getBoundingClientRect();
    const offsetX = point.left + point.width / 2 - bounds.left - viewport.clientLeft;
    const offsetY = point.top + point.height / 2 - bounds.top - viewport.clientTop;
    viewport.scrollLeft = viewport.scrollLeft + offsetX - viewport.clientWidth / 2;
    viewport.scrollTop = viewport.scrollTop + offsetY - viewport.clientHeight / 2;
}

// 验证鼠标中心缩放、普通滚动、左键和中键平移，所有操作都不能改变线路路径
async function verifyDiagramNavigation(page) {
    const viewport = page.locator("#logic-diagram-scroll");
    const bounds = await viewport.boundingBox();
    const point = { x: bounds.x + bounds.width * 0.4, y: bounds.y + bounds.height * 0.4 };
    const paths = await page.evaluate(readWirePaths);
    const before = await page.evaluate(readDiagramPosition, point);
    const label = await page.locator("#logic-zoom-label").textContent();
    await page.mouse.move(point.x, point.y);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -600);
    await page.keyboard.up("Control");
    await page.waitForFunction(diagramZoomChanged, label);
    const after = await page.evaluate(readDiagramPosition, point);
    assert.ok(after.scale > before.scale);
    assert.ok(Math.abs(after.diagramX - before.diagramX) < 2);
    assert.ok(Math.abs(after.diagramY - before.diagramY) < 2);
    await page.mouse.wheel(100, 120);
    await page.waitForFunction(diagramScrolled, after);
    const scrolled = await page.evaluate(readDiagramPosition, point);
    assert.equal(scrolled.scale, after.scale);
    assert.ok(scrolled.scrollTop > after.scrollTop);
    assert.ok(scrolled.scrollLeft > after.scrollLeft);

    const junctions = page.locator(".logic-junction");
    const firstJunction = junctions.first();
    await firstJunction.evaluate(centerDiagramJunction);
    const junction = await page.evaluate(visibleJunction);
    const selected = await page.locator("#logic-network").inputValue();
    const start = await page.evaluate(readDiagramPosition, junction);
    await page.mouse.move(junction.x, junction.y);
    await page.mouse.down();
    await page.mouse.move(junction.x - 80, junction.y - 60, { steps: 8 });
    const dragging = await page.evaluate(readDiagramPosition, junction);
    assert.equal(dragging.cursor, "grabbing");
    await page.screenshot({ path: path.join(SCREENSHOTS, "logic-diagram-drag.png"), fullPage: true });
    await page.mouse.up();
    const dragged = await page.evaluate(readDiagramPosition, junction);
    assert.equal(dragged.cursor, "grab");
    assert.ok(Math.abs(dragged.scrollLeft - start.scrollLeft - 80) <= 1);
    assert.ok(Math.abs(dragged.scrollTop - start.scrollTop - 60) <= 1);
    assert.equal(await page.locator("#logic-network").inputValue(), selected);

    await page.mouse.move(point.x, point.y);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(point.x + 40, point.y + 30, { steps: 4 });
    await page.mouse.up({ button: "middle" });
    const middle = await page.evaluate(readDiagramPosition, point);
    assert.ok(Math.abs(middle.scrollLeft - dragged.scrollLeft + 40) <= 1);
    assert.ok(Math.abs(middle.scrollTop - dragged.scrollTop + 30) <= 1);
    assert.equal(await page.locator("#logic-network").inputValue(), selected);
    assert.deepEqual(await page.evaluate(readWirePaths), paths);

    // 到达缩放边界后仍保持正常比例，不允许滚轮把图纸缩成零或无限放大
    await viewport.dispatchEvent("wheel", { ctrlKey: true, deltaY: -100000, clientX: point.x, clientY: point.y });
    assert.equal(await page.locator("#logic-zoom-label").textContent(), "250%");
    await viewport.dispatchEvent("wheel", { ctrlKey: true, deltaY: 100000, clientX: point.x, clientY: point.y });
    assert.equal(await page.locator("#logic-zoom-label").textContent(), "15%");
    await page.locator("#logic-fit").click();
    const fitted = await page.evaluate(readDiagramPosition, point);
    assert.equal(fitted.scrollLeft, 0);
    assert.equal(fitted.scrollTop, 0);
    const target = await page.evaluate(visibleJunction);
    await page.mouse.click(target.x, target.y);
    assert.equal(await page.locator("#logic-network").inputValue(), target.netId);
    await page.locator("#logic-network").selectOption("");
}

// 验证真实浏览器中的生成、缩放、高亮、导出、键盘和桌面手机布局
async function main() {
    fs.mkdirSync(SCREENSHOTS, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
        await page.context().setOffline(true);
        const errors = [];
        page.on("pageerror", collectError.bind(null, errors));
        await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href);
        await page.waitForSelector(".chip-option");
        assert.equal(await page.locator("#export-workspace").count(), 0);
        assert.equal(await page.locator(".library-footer #view-logic-diagram").count(), 1);
        assert.equal(await page.getByRole("button", { name: "显示逻辑电路图", exact: true }).count(), 1);
        const before = await readProject(page);
        const resultBefore = await page.locator("#binary-result").textContent();
        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramReady);
        assert.match(await page.locator("#logic-diagram-summary").textContent(), /5 片芯片/);
        assert.equal(await page.locator("[data-component='U4-gate-1']").count(), 1);
        const geometry = await page.evaluate(inspectDiagramGeometry);
        assert.equal(geometry.overlaps, 0);
        assert.ok(geometry.paths > 30);
        const junctions = await page.evaluate(inspectJunctions);
        assert.ok(junctions.count > 0);
        assert.equal(junctions.count, junctions.unique);
        assert.ok(junctions.minimum >= 4.5);
        assert.equal(junctions.aboveWires, true);
        const zoomBefore = await page.locator("#logic-zoom-label").textContent();
        await page.locator("#logic-zoom-in").click();
        assert.notEqual(await page.locator("#logic-zoom-label").textContent(), zoomBefore);
        await page.locator("#logic-fit").click();
        await verifyDiagramNavigation(page);
        const pathsBefore = await page.evaluate(readWirePaths);
        await page.locator("#logic-network").selectOption(controlNetwork());
        assert.ok(await page.locator(".logic-edge.logic-active-net").count() >= 5);
        assert.match(await page.locator("#logic-network-members").textContent(), /U2 · 7脚 C0/);
        const networkEdges = page.locator(".logic-edge.logic-active-net");
        const focusEdge = networkEdges.first();
        await focusEdge.focus();
        await page.keyboard.press("Enter");
        const focused = await page.evaluate(readFocusedWire);
        assert.equal(focused.outline, "none");
        assert.ok(focused.width >= 3);
        assert.deepEqual(await page.evaluate(readWirePaths), pathsBefore);
        const gateSymbols = page.locator(".logic-gate-symbol");
        assert.equal(await gateSymbols.first().textContent(), "=1");
        await page.screenshot({ path: path.join(SCREENSHOTS, "logic-diagram-desktop.png"), fullPage: true });
        const waiting = page.waitForEvent("download");
        await page.locator("#logic-export").click();
        const download = await waiting;
        const filename = await download.path();
        const exported = fs.readFileSync(filename, "utf8");
        assert.equal(download.suggestedFilename(), "breadboard-logic.svg");
        assert.match(exported, /viewBox=/);
        assert.match(exported, /U4\.1/);
        assert.equal(exported.includes("var(--"), false);
        await page.locator("#logic-show-power").check();
        await page.waitForFunction(diagramReady);
        assert.ok(await page.locator("[data-component='U1-power']").count() > 0);
        await page.locator("#logic-show-power").uncheck();
        await page.waitForFunction(diagramReady);
        for (const size of [{ width: 1600, height: 720 }, { width: 375, height: 812 }, { width: 812, height: 375 }]) {
            await page.setViewportSize(size);
            await page.locator("#logic-fit").click();
            const bounds = await page.evaluate(readDiagramSize);
            assert.ok(bounds.left >= 0 && bounds.right <= bounds.width + 1);
            assert.ok(bounds.top >= 0 && bounds.bottom <= bounds.height + 1);
            assert.ok(bounds.canvasWidth > 0 && bounds.canvasHeight > 0);
            assert.ok(bounds.pageWidth <= bounds.width + 1);
            await page.screenshot({ path: path.join(SCREENSHOTS, "logic-diagram-" + size.width + "-" + size.height + ".png"), fullPage: true });
        }
        await page.keyboard.press("Delete");
        assert.equal(await page.locator("#confirm-dialog").isVisible(), false);
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#logic-diagram-dialog").isVisible(), false);
        await page.setViewportSize({ width: 1600, height: 1000 });
        assert.equal(await readProject(page), before);
        assert.equal(await page.locator("#binary-result").textContent(), resultBefore);
        assert.deepEqual(errors, []);
        console.log("逻辑图界面通过：断网生成、元件布局、分支高亮、鼠标中心缩放、滚动、左键及中键拖动、SVG导出、键盘和三种视口");
    } finally {
        await browser.close();
    }
}

await main();
