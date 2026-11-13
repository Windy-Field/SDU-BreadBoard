import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

const ROOT = process.cwd();
const SCREENSHOTS = path.join(ROOT, "reports", "screenshots");

// 读取页面宽度是否超出窗口，返回页面宽度和窗口宽度
function readPageSize() {
    return { document: document.documentElement.scrollWidth, viewport: window.innerWidth };
}

// 核对左侧栏内容宽度，确保所有入口都能显示，不依赖隐藏水平滚动条
function sidebarFits() {
    const sidebar = document.querySelector(".library");
    return sidebar.scrollWidth <= sidebar.clientWidth + 1;
}

// 核对只读开关紧跟实验标题，避免固定宽度输入框留下大块空白
function titleControlGap() {
    const title = document.getElementById("project-name").getBoundingClientRect();
    const control = document.querySelector(".read-only-control").getBoundingClientRect();
    return control.left - title.right;
}

// 返回画布的像素变化数量，避免只检查画布元素存在而没有实际绘制
function inspectCanvasPixels() {
    const canvas = document.getElementById("board-canvas");
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let dark = 0;
    let green = 0;
    for (let index = 0; index < pixels.length; index = index + 16) {
        const red = pixels[index];
        const value = pixels[index + 1];
        const blue = pixels[index + 2];
        if (red < 100 && value < 110 && blue < 110) {
            dark = dark + 1;
        }
        if (value > red * 1.3 && value > blue * 1.1) {
            green = green + 1;
        }
    }
    return { dark: dark, green: green };
}

// 清除测试期间的 Toast，截图保留应用主体状态
function clearVisibleToasts() {
    document.getElementById("toast-region").replaceChildren();
}

// 记录浏览器脚本错误，供最后统一检查
function recordPageError(errors, error) {
    errors.push(error.message);
}

// 设置快速输入的五个按键，参数为页面和带符号整数
async function setUiInput(page, number) {
    let encoded = number;
    if (encoded < 0) {
        encoded = encoded + 32;
    }
    for (let bit = 0; bit < 5; bit = bit + 1) {
        const button = page.getByRole("button", { name: "切换 K" + bit, exact: true });
        const pressed = await button.getAttribute("aria-pressed");
        const target = (encoded >> bit) & 1;
        if ((target === 1 && pressed !== "true") || (target === 0 && pressed !== "false")) {
            await button.click();
        }
    }
}

// 核对界面结果文字
async function expectResult(page, expected) {
    const actual = await page.locator("#binary-result").textContent();
    let bits = expected.replaceAll(" ", "");
    let overflow = "X";
    if (bits[0] !== "X" && bits[1] !== "X") {
        overflow = String(Number(bits[0]) ^ Number(bits[1]));
    }
    bits = overflow + bits;
    assert.equal(actual.replaceAll(" ", ""), bits);
}

// 通过页面上的 K6 输入清零，随后恢复正常工作电平
async function clearRegisters(page) {
    await setControl(page, 6, 0);
    await setControl(page, 6, 1);
}

// 把指定输入按钮切换到目标值，避免依赖已移除的模式控件
async function setControl(page, bit, value) {
    const button = page.getByRole("button", { name: "切换 K" + bit, exact: true });
    const pressed = await button.getAttribute("aria-pressed");
    if ((value === 1 && pressed !== "true") || (value === 0 && pressed !== "false")) {
        await button.click();
    }
}

// 通过页面坐标按住脉冲按钮，读取按下期间的输出并在松开后检查更新
async function testPulseControls(page) {
    await page.evaluate(clearVisibleToasts);
    await clearRegisters(page);
    await setUiInput(page, 1);
    await page.locator("#pulse-negative").scrollIntoViewIfNeeded();
    const button = await page.locator("#pulse-negative").boundingBox();
    await page.mouse.move(button.x + button.width / 2, button.y + button.height / 2);
    await page.mouse.down();
    assert.equal(await page.locator("#pulse-negative").getAttribute("aria-pressed"), "true");
    await expectResult(page, "00 0000");
    await page.mouse.up();
    await expectResult(page, "00 0001");
    await clearRegisters(page);
    const viewport = page.locator("#board-viewport");
    await viewport.evaluate(scrollToBottom);
    const bounds = await page.locator("#board-canvas").boundingBox();
    const horizontal = bounds.x + bounds.width * 1098 / 1300;
    const vertical = bounds.y + bounds.height * 1143 / 1215;
    await page.mouse.move(horizontal, vertical);
    await page.mouse.down();
    assert.equal(await page.locator("#pulse-negative").getAttribute("aria-pressed"), "true");
    await expectResult(page, "00 0000");
    await page.mouse.up();
    await expectResult(page, "00 0001");
    await viewport.evaluate(scrollToTop);
    await setUiInput(page, 0);
    await clearRegisters(page);
}

// 将独立画布滚动到输入按钮处
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// 恢复画布顶部位置，不影响其他滚动区域
function scrollToTop(element) {
    element.scrollTop = 0;
}

// 检查左右两个外部脉冲按钮使用相同尺寸与样式
function pulseStylesMatch() {
    const first = document.getElementById("pulse-positive");
    const second = document.getElementById("pulse-negative");
    const firstStyle = getComputedStyle(first);
    const secondStyle = getComputedStyle(second);
    return firstStyle.backgroundColor === secondStyle.backgroundColor && firstStyle.width === secondStyle.width && firstStyle.height === secondStyle.height;
}

// 通过可见界面运行实验、接线、撤销、导入及窄屏检查
async function main() {
    fs.mkdirSync(SCREENSHOTS, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", recordPageError.bind(null, errors));
    try {
        await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href);
        await page.waitForSelector(".chip-option");
        await waitForZoom(page);
        assert.ok(await page.evaluate(titleControlGap) <= 10);
        assert.equal(await page.evaluate(sidebarFits), true);
        await expectResult(page, "XX XXXX");
        assert.equal(await page.evaluate(inspectPalette), true);
        await page.locator("#diagnose-circuit").click();
        assert.equal(await page.locator("#diagnostics-panel .diagnostic-chip").count(), 5);
        await page.locator("#tab-inspect").click();
        await page.locator("#read-only-toggle").check();
        assert.equal(await page.locator("#tool-wire").isDisabled(), true);
        assert.equal(await page.locator("#connect-endpoints").isDisabled(), true);
        assert.equal(await page.locator("#notes-edit-button").isDisabled(), true);
        await clearRegisters(page);
        await expectResult(page, "00 0000");
        await page.locator("#read-only-toggle").uncheck();
        const pixels = await page.evaluate(inspectCanvasPixels);
        assert.ok(pixels.dark > 10000);
        assert.ok(pixels.green > 10000);
        assert.equal(await page.evaluate(pulseStylesMatch), true);
        await testPulseControls(page);
        await clearRegisters(page);
        await expectResult(page, "00 0000");
        await setUiInput(page, 7);
        await expectResult(page, "00 0000");
        await page.locator("#pulse-negative").click();
        await expectResult(page, "00 0111");
        await setUiInput(page, 5);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "00 1100");
        await setUiInput(page, 6);
        await setControl(page, 5, 1);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "00 0110");
        await setUiInput(page, 12);
        await setControl(page, 5, 0);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "01 0010");
        assert.equal(await page.locator("[data-output-led='6']").getAttribute("data-value"), "1");
        await page.evaluate(clearVisibleToasts);
        await page.screenshot({ path: path.join(SCREENSHOTS, "desktop.png"), fullPage: true });
        fs.mkdirSync(path.join(ROOT, "assets", "screenshots"), { recursive: true });
        await page.screenshot({ path: path.join(ROOT, "assets", "screenshots", "latest.png"), fullPage: true });
        await clearRegisters(page);
        await setUiInput(page, -12);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "11 0100");
        await setUiInput(page, -2);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "11 0010");
        await setUiInput(page, 6);
        await setControl(page, 5, 1);
        await page.locator("#pulse-negative").click();
        await expectResult(page, "10 1100");
        await page.locator("#from-endpoint").fill("R:GND:0");
        await page.locator("#to-endpoint").fill("R:VCC:0");
        await page.locator("#connect-endpoints").click();
        const shortMessages = page.getByText("+5V 与 GND 被导线短接", { exact: false });
        await shortMessages.first().waitFor();
        assert.equal(await page.locator("#wire-count").textContent(), "62");
        await page.locator("#undo").click();
        assert.equal(await page.locator("#wire-count").textContent(), "61");
        await clearRegisters(page);
        assert.equal(await page.locator("#issue-count").textContent(), "0");
        await page.locator("#from-endpoint").fill("B3:J:49");
        await page.locator("#to-endpoint").fill("B0:A:1");
        await page.locator("#connect-endpoints").click();
        const occupiedMessages = page.getByText("这个孔已被占用", { exact: false });
        await occupiedMessages.first().waitFor();
        assert.equal(await page.locator("#wire-count").textContent(), "61");
        await page.locator("#new-project").click();
        assert.equal(await page.locator("#wire-count").textContent(), "0");
        assert.equal(await page.locator("#project-mode").count(), 0);
        assert.equal(await page.locator("#clear-register").count(), 0);
        await page.locator("#input-count").fill("12");
        await page.locator("#input-count").press("Tab");
        assert.equal(await page.locator("#quick-switches button").count(), 12);
        await page.getByRole("button", { name: "切换 K0", exact: true }).click();
        assert.equal(await page.locator("[data-input-led='0']").getAttribute("data-value"), "1");
        await page.locator("#tab-notes").click();
        await page.locator("#notes-edit-button").click();
        const markdown = "# 测试电路\n\n**输入 K0** → 输出 L0\n\n| 端口 | 作用 |\n| --- | --- |\n| K0 | 输入 |\n\n<script>alert(1)</script><img src=x onerror=alert(1)>[危险](javascript:alert(1))";
        await page.locator("#notes-editor").fill(markdown);
        await page.locator("#notes-preview-button").click();
        assert.equal(await page.locator("#notes-preview h1").textContent(), "测试电路");
        assert.equal(await page.locator("#notes-preview table").count(), 1);
        assert.equal(await page.evaluate(inspectMarkdownSafety), true);
        await page.locator("#tab-inspect").click();
        await page.getByRole("button", { name: "查看 74LS86 四路异或门", exact: true }).click();
        const bounds = await page.locator("#board-canvas").boundingBox();
        await page.mouse.click(bounds.x + bounds.width * 0.25, bounds.y + bounds.height * 0.18);
        assert.match(await page.locator("#circuit-count").textContent(), /1 片芯片/);
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        assert.equal(await page.locator("#pinned-chip [data-pin]").count(), 14);
        await page.waitForFunction(pinoutLoaded);
        await page.screenshot({ path: path.join(SCREENSHOTS, "pinout-panel.png"), fullPage: true });
        await page.locator("#tab-notes").click();
        assert.equal(await page.locator("#pinned-chip").isVisible(), false);
        await page.locator("#tab-inspect").click();
        assert.equal(await page.locator("#pinned-chip").isVisible(), true);
        const initialZoom = await zoomPercent(page);
        const viewport = await page.locator("#board-viewport").boundingBox();
        await page.mouse.move(viewport.x + 100, viewport.y + 100);
        const scrollBefore = await page.evaluate(readBoardScroll);
        await page.mouse.wheel(0, 150);
        await waitForZoom(page);
        assert.equal(await zoomPercent(page), initialZoom);
        assert.ok(await page.evaluate(readBoardScroll) > scrollBefore);
        await page.keyboard.down("Control");
        await page.mouse.wheel(0, -100);
        await page.keyboard.up("Control");
        await waitForZoom(page);
        assert.ok(await zoomPercent(page) > initialZoom);
        await page.keyboard.down("Control");
        await page.mouse.wheel(0, 100);
        await page.keyboard.up("Control");
        await waitForZoom(page);
        assert.ok(Math.abs(await zoomPercent(page) - initialZoom) <= 1);
        await page.locator("#from-endpoint").fill("B3:J:49");
        await page.locator("#to-endpoint").fill("B0:A:1");
        await page.locator("#connect-endpoints").click();
        assert.equal(await page.locator("#wire-count").textContent(), "1");
        assert.equal(await page.locator("#load-preset").count(), 0);
        await page.locator("#import-file").setInputFiles(path.join(ROOT, "examples", "complement-adder.json"));
        await page.waitForFunction(wireCountRestored);
        const presetId = await page.locator("#experiment-picker").inputValue();
        await page.locator("#new-experiment").click();
        assert.equal(await page.locator("#wire-count").textContent(), "0");
        assert.equal(await page.locator("#project-mode").count(), 0);
        await page.locator("#experiment-picker").selectOption(presetId, { force: true });
        assert.equal(await page.locator("#wire-count").textContent(), "61");
        await page.locator("#tab-notes").click();
        assert.match(await page.locator("#notes-preview").textContent(), /低电平|异步清零/);
        await page.locator("#tab-inspect").click();
        await clearRegisters(page);
        await page.locator("#read-only-toggle").check();
        const readOnlyCount = await page.locator("#wire-count").textContent();
        await page.keyboard.press("Delete");
        assert.equal(await page.locator("#wire-count").textContent(), readOnlyCount);
        await page.screenshot({ path: path.join(SCREENSHOTS, "read-only.png"), fullPage: true });
        await page.locator("#read-only-toggle").uncheck();
        await page.locator("#import-file").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{wrong") });
        const invalidMessages = page.getByText("电路文件无法解析", { exact: false });
        await invalidMessages.first().waitFor();
        assert.equal(await page.locator("#wire-count").textContent(), "61");
        const downloadEvent = page.waitForEvent("download");
        await page.locator("#export-project").click();
        const exported = await downloadEvent;
        const savedPath = path.join(SCREENSHOTS, "roundtrip.json");
        await exported.saveAs(savedPath);
        await page.locator("#new-project").click();
        await page.locator("#import-file").setInputFiles(savedPath);
        await page.waitForFunction(wireCountRestored);
        const imageEvent = page.waitForEvent("download");
        await page.locator("#export-image").click();
        const exportedImage = await imageEvent;
        assert.equal(exportedImage.suggestedFilename(), "breadboard-wiring.png");
        await page.evaluate(clearVisibleToasts);
        for (const width of [320, 375, 414, 768, 1280]) {
            await page.setViewportSize({ width: width, height: 900 });
            await page.locator("#fit-board").click();
            await waitForZoom(page);
            const size = await page.evaluate(readPageSize);
            assert.ok(size.document <= size.viewport, "页面存在横向溢出：" + width);
            assert.equal(await page.evaluate(sidebarFits), true, "左侧栏内容超宽：" + width);
            await page.screenshot({ path: path.join(SCREENSHOTS, "viewport-" + width + ".png"), fullPage: true });
        }
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.locator("#help-button").click();
        assert.ok(await page.locator("#help-dialog").isVisible());
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#help-dialog").isVisible(), false);
        assert.deepEqual(errors, []);
        console.log("浏览器验证通过：两组验收、Toast、接线、放置芯片、撤销、导入校验、5种视口与画布像素");
    } finally {
        await page.screenshot({ path: path.join(SCREENSHOTS, "last-state.png"), fullPage: true });
        await browser.close();
    }
}

// 等待异步导入结束，避免读取文件尚未完成时检查数量
function wireCountRestored() {
    return document.getElementById("wire-count").textContent === "61";
}

// 等待缩放显示连续两帧不再变化，测试不依赖固定动画时长
async function waitForZoom(page) {
    await page.waitForTimeout(240);
}

// 读取正在显示的缩放百分比，返回数字
async function zoomPercent(page) {
    const text = await page.locator("#zoom-label").textContent();
    return Number(text.replace("%", ""));
}

// 检查 Markdown 安全预览，不允许脚本、事件属性或危险链接残留
function inspectMarkdownSafety() {
    const preview = document.getElementById("notes-preview");
    for (const entry of preview.querySelectorAll("*")) {
        for (const attribute of entry.attributes) {
            if (attribute.name.startsWith("on")) {
                return false;
            }
        }
    }
    return preview.querySelector("script, img, iframe, a[href^='javascript:']") === null;
}

// 检查调色板每行正好六个，第二行与第一行各列对齐
function inspectPalette() {
    const buttons = document.querySelectorAll("#wire-palette button");
    for (let index = 0; index < 6; index = index + 1) {
        const first = buttons[index].getBoundingClientRect();
        const second = buttons[index + 6].getBoundingClientRect();
        if (Math.abs(first.left - second.left) > 1 || first.top >= second.top) {
            return false;
        }
    }
    return buttons.length === 12;
}

// 读取当前滚动位置，核对普通滚轮只滚动而不缩放
function readBoardScroll() {
    return document.getElementById("board-viewport").scrollTop;
}

// 返回原厂引脚图片是否已成功加载
function pinoutLoaded() {
    const image = document.querySelector("#pinned-chip img");
    return image && image.complete && image.naturalWidth > 100;
}

await main();
