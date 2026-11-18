import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { pngDimensions, readImageDownload } from "../helpers/downloads.mjs";

// 按用户看到的引脚名在菜单中选中信号，再点击添加按钮
async function addPin(page, label) {
    const picker = page.locator("#timing-signal");
    await picker.selectOption({ label: label });
    await page.locator("#timing-add").click();
}

// 从事件详情读取一个信号的前值、后值和边沿
async function readSignal(page, label) {
    const name = page.getByRole("rowheader", { name: label, exact: true });
    const table = page.locator("#timing-values");
    const row = table.locator("tr").filter({ has: name });
    return row.locator("td").allTextContents();
}

// 检查波形可在自身区域滚动，面板和页面不会被长记录撑宽
function inspectChart() {
    const panel = document.getElementById("timing-panel");
    const chart = document.getElementById("timing-chart");
    const bounds = chart.getBoundingClientRect();
    return {
        panelFits: panel.scrollWidth <= panel.clientWidth + 1,
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
        chartFits: bounds.left >= 0 && bounds.right <= window.innerWidth + 1,
        scrolls: chart.scrollWidth > chart.clientWidth,
        visibleLines: chart.querySelectorAll(".timing-wave-line[d^='M']").length
    };
}

// 解读独立 SVG，检查图纸完整度而不依赖原网页存在
function inspectExportedSvg(markup) {
    const parser = new DOMParser();
    const drawing = parser.parseFromString(markup, "image/svg+xml");
    const root = drawing.documentElement;
    return {
        valid: root.localName === "svg",
        width: Number(root.getAttribute("width")),
        height: Number(root.getAttribute("height")),
        scales: root.querySelectorAll(".timing-level-scale").length,
        text: root.textContent,
        lines: root.querySelectorAll(".timing-wave-line[d^='M']").length
    };
}

// 用实际文字范围检查提示是否横排，不把窄而未溢出的多行框算作通过
function inspectTooltip(tip) {
    const bounds = tip.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(tip);
    let paintable = true;
    for (const point of [bounds.left + 3, bounds.right - 3]) {
        const visible = document.elementFromPoint(point, bounds.top + bounds.height / 2);
        if (visible !== tip) {
            paintable = false;
        }
    }
    return {
        lines: text.getClientRects().length,
        fits: bounds.left >= 0 && bounds.right <= document.documentElement.clientWidth,
        paintable: paintable
    };
}

// 检查截图中的侧栏和逻辑图右边缘，并覆盖键盘打开和关闭提示
async function testTooltips(page) {
    const tip = page.locator("#workbench-tooltip:popover-open");
    await page.locator("#timing-add").hover();
    await tip.waitFor();
    assert.equal(await tip.textContent(), "添加信号");
    assert.deepEqual(await tip.evaluate(inspectTooltip), { lines: 1, fits: true, paintable: true });
    await page.locator("#view-logic-diagram").click();
    const button = page.locator("#logic-export:enabled");
    await button.hover();
    await tip.waitFor();
    assert.equal(await tip.textContent(), "导出逻辑图");
    assert.deepEqual(await tip.evaluate(inspectTooltip), { lines: 1, fits: true, paintable: true });
    await page.keyboard.press("Escape");
    assert.equal(await tip.count(), 0);
    assert.equal(await page.locator("#logic-diagram-dialog").isVisible(), true);
    await page.locator("#logic-fit").focus();
    await page.keyboard.press("Tab");
    await tip.waitFor();
    assert.equal(await tip.textContent(), "导出逻辑图");
    assert.equal(await button.getAttribute("aria-describedby"), "workbench-tooltip");
    await page.keyboard.press("Escape");
    assert.equal(await button.getAttribute("aria-describedby"), null);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#logic-diagram-dialog").isVisible(), false);
}

// 在横向滚动后的长波形上验证 SVG、PNG、CSV 都包含完整的事件记录
async function testTimingDownloads(page, chartWidth) {
    const count = await page.locator(".timing-event").count();
    const selected = await page.locator("#timing-event-title").textContent();
    const svg = await readImageDownload(page, "#timing-export", "svg", "breadboard-timing.svg");
    const markup = svg.toString("utf8");
    const drawing = await page.evaluate(inspectExportedSvg, markup);
    assert.equal(drawing.valid, true);
    assert.ok(drawing.width > chartWidth);
    assert.equal(drawing.scales, 6);
    assert.ok(drawing.lines >= 6);
    assert.match(drawing.text, /U1 · 11脚 CLK/);
    assert.match(drawing.text, /事件序号（非实物时间）/);

    const png = await readImageDownload(page, "#timing-export", "png", "breadboard-timing.png");
    assert.deepEqual(pngDimensions(png), { width: drawing.width * 2, height: drawing.height * 2 });

    const csv = await readImageDownload(page, "#timing-export", "csv", "breadboard-timing.csv");
    const text = csv.toString("utf8");
    assert.equal(text.charCodeAt(0), 0xFEFF);
    const rows = text.trim().split("\r\n");
    assert.match(rows[0], /^事件序号,操作,P-,K0,L0,U1 · 11脚 CLK,/);
    assert.match(rows[1], /^0,初始电平,/);
    assert.equal(rows.length, count + 1);
    const last = rows[count].split(",");
    assert.equal(last[0], String(count - 1));
    assert.equal(last[1], "松开 P-");
    assert.equal(await page.locator(".timing-event").count(), count);
    assert.equal(await page.locator("#timing-event-title").textContent(), selected);
    assert.equal(await page.locator("#timing-stop").isEnabled(), true);
}

// 运行补码示例并核对记录、鼠标选择、键盘选择、停止与实验切换
async function testTimingPanel() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, reducedMotion: "reduce" });
        await page.context().setOffline(true);
        const url = pathToFileURL(path.resolve("index.html"));
        await page.goto(url.href);
        await page.locator("#tab-timing").click();
        const panel = page.locator("#timing-panel");
        assert.equal(await panel.isVisible(), true);
        assert.equal(await page.locator("#timing-export").isDisabled(), true);
        await testTooltips(page);
        await addPin(page, "U1 · 11脚 CLK");
        await addPin(page, "U1 · 3脚 D0");
        await addPin(page, "U1 · 2脚 Q0");
        await page.locator("#timing-start").click();
        assert.equal(await page.locator("#timing-signal").isDisabled(), true);

        // 记录不依赖当前打开的标签，也不依赖动画是否正在播放
        await page.locator("#tab-notes").click();
        await page.getByRole("button", { name: "切换 K0", exact: true }).click();
        await page.locator("#pulse-negative").hover();
        await page.mouse.down();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0000");
        await page.mouse.up();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0001");
        await page.locator("#tab-timing").click();
        assert.equal(await page.locator(".timing-event").count(), 4);
        assert.match(await page.locator("#timing-event-title").textContent(), /松开 P-/);
        assert.deepEqual(await readSignal(page, "U1 · 11脚 CLK"), ["0", "1", "↑"]);
        assert.deepEqual(await readSignal(page, "U1 · 3脚 D0"), ["1", "0", "↓"]);
        assert.deepEqual(await readSignal(page, "U1 · 2脚 Q0"), ["0", "1", "↑"]);

        const clockWave = page.locator(".timing-lane", { hasText: "U1 · 11脚 CLK" });
        const levels = clockWave.locator(".timing-level-scale text");
        assert.deepEqual(await levels.allTextContents(), ["1", "0"]);
        const wave = clockWave.locator(":scope > svg");
        await wave.click({ position: { x: 110, y: 16 } });
        assert.match(await page.locator("#timing-event-title").textContent(), /按下 P-/);
        await page.locator(".timing-event[data-event='2']").click();
        assert.match(await page.locator("#timing-event-title").textContent(), /按下 P-/);
        assert.deepEqual(await readSignal(page, "U1 · 2脚 Q0"), ["0", "0", "—"]);
        await page.keyboard.press("ArrowRight");
        assert.match(await page.locator("#timing-event-title").textContent(), /松开 P-/);
        await page.locator("#timing-stop").click();
        await page.locator("#pulse-negative").click();
        assert.equal(await page.locator(".timing-event").count(), 4);

        for (const viewport of [{ width: 1600, height: 1000 }, { width: 375, height: 900 }, { width: 844, height: 390 }]) {
            await page.setViewportSize(viewport);
            const layout = await page.evaluate(inspectChart);
            assert.equal(layout.pageFits, true);
            assert.equal(layout.panelFits, true);
            assert.equal(layout.chartFits, true);
            assert.ok(layout.visibleLines >= 6);
        }

        await page.setViewportSize({ width: 1600, height: 1000 });
        await page.locator("#timing-clear").click();
        assert.equal(await page.locator(".timing-event").count(), 0);
        assert.equal(await page.locator("#timing-signals li").count(), 6);
        await page.locator("#timing-start").click();
        for (let count = 0; count < 4; count = count + 1) {
            await page.locator("#pulse-negative").click();
        }
        const longChart = await page.evaluate(inspectChart);
        assert.equal(longChart.scrolls, true);
        const chart = page.locator("#timing-chart");
        await chart.evaluate(scrollToLastEvent);
        const chartBounds = await chart.boundingBox();
        const labelBounds = await levels.first().boundingBox();
        assert.ok(labelBounds.x >= chartBounds.x);
        assert.ok(labelBounds.x + labelBounds.width <= chartBounds.x + chartBounds.width);
        await testTimingDownloads(page, chartBounds.width);
        await page.locator("#save-project").click();
        const project = await page.evaluate(readSavedProject);
        assert.equal(Object.hasOwn(project, "timing"), false);
        await page.locator("#new-experiment").click();
        assert.equal(await page.locator(".timing-event").count(), 0);
        assert.equal(await page.locator("#timing-signals li").count(), 3);
        assert.equal(await page.locator("#timing-stop").isDisabled(), true);
        console.log("时序验证通过：实际脉冲、采样前后、键盘、窄屏、实验隔离和三种导出格式");
    } finally {
        await browser.close();
    }
}

// 滚动到末尾，确认电平刻度不会随波形移出图框
function scrollToLastEvent(chart) {
    chart.scrollLeft = chart.scrollWidth;
}

// 读取通过界面保存的实验，验证采样只存在于页面内存中
function readSavedProject() {
    const text = localStorage.getItem("breadboard-lab-workspace-v1");
    const saved = JSON.parse(text);
    return saved.projects[saved.activeId];
}

await testTimingPanel();
