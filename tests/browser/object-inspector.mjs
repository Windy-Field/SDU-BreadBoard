import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { openWorkbench } from "../helpers/announcement.mjs";

const ADDRESS = pathToFileURL(path.resolve("index.html")).href;
const SCREENSHOTS = path.resolve("reports", "screenshots");
const WIDTHS = [1600, 768, 414, 375, 320];

// 验证芯片摘要随供电变化，实时引脚排在参考资料之前
async function checkChip(page) {
    await page.locator("#inspect-panel [data-chip='U1']").click();
    const pane = page.locator("#pane-chip-U1");
    const supply = pane.locator(".chip-supply");
    assert.equal(await supply.textContent(), "供电正常");
    const sections = pane.locator(".object-section-title");
    assert.equal(await sections.first().textContent(), "实时引脚");
    const power = page.locator("#power-toggle");
    await power.uncheck();
    assert.equal(await supply.textContent(), "电源关闭");
    await power.check();
    assert.equal(await supply.textContent(), "供电正常");
    await pane.getByRole("button", { name: "定位芯片" }).click();
    await pane.screenshot({ path: path.join(SCREENSHOTS, "object-inspector-chip.png") });
}

// 检查面板没有横向溢出，内容较多时仍可纵向滚动
function fitsPanel(panel) {
    return panel.scrollWidth <= panel.clientWidth + 1;
}

// 从导线跳到孔位，再沿同网连接选中另一根线；查看过程不改动电路
async function checkNetwork(page) {
    await page.locator("#tab-wires").click();
    const wireButtons = page.locator("#wires-panel button[data-wire='W1']");
    await wireButtons.first().click();
    const panel = page.locator("#inspect-panel");
    const endpoints = panel.locator(".wire-endpoints button");
    assert.equal(await endpoints.count(), 2);
    assert.match(await panel.textContent(), /驱动来源.*\+5V/);
    assert.match(await panel.textContent(), /U1-20/);
    const title = panel.locator("h2");
    await endpoints.last().click();
    assert.match(await title.textContent(), /D25/);
    assert.match(await panel.textContent(), /孔位编号.*B1:D:25/);
    const related = panel.getByRole("button", { name: /^W3\s/ });
    await related.click();
    assert.equal(await title.textContent(), "W3");
    for (const width of WIDTHS) {
        await page.setViewportSize({ width: width, height: 900 });
        assert.equal(await panel.evaluate(fitsPanel), true, "对象面板溢出：" + width);
        if (width === 1600 || width === 375) {
            const filename = "object-inspector-wire-" + width + ".png";
            await panel.screenshot({ path: path.join(SCREENSHOTS, filename) });
        }
    }
    await page.locator("#read-only-toggle").check();
    assert.equal(await panel.getByRole("button", { name: "删除导线" }).isDisabled(), true);
    await panel.getByRole("button", { name: "隐藏导线", exact: true }).click();
    assert.equal(await page.locator("#hidden-object-count").textContent(), "1");
}

// 在独立浏览器中检查对象面板的内容、交互和窄屏显示
async function main() {
    await fs.mkdir(SCREENSHOTS, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: "reduce" });
        await openWorkbench(page, ADDRESS);
        await checkChip(page);
        await checkNetwork(page);
        console.log("对象面板验证通过：供电刷新、实时引脚、同网跳转、只读与五种宽度");
    } finally {
        await browser.close();
    }
}

await main();
