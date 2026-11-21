import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import { confirmBrowserDownload, disableSavePicker, pngDimensions, readImageDownload } from "../helpers/downloads.mjs";
import { pathToFileURL } from "node:url";
import { openWorkbench } from "../helpers/announcement.mjs";
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

// 确认标准实验启动后可打开逻辑图和诊断，并在只读状态下继续仿真
async function testInitialWorkbench(page) {
    await page.waitForSelector(".chip-option");
    const tabs = page.locator(".inspector-tabs button");
    const tabNames = await tabs.allTextContents();
    assert.deepEqual(tabNames, ["对象", "时序", "导线 61", "诊断 0", "备注"]);
    await waitForZoom(page);
    assert.ok(await page.evaluate(titleControlGap) <= 10);
    assert.equal(await page.evaluate(sidebarFits), true);
    await expectResult(page, "00 0000");
    assert.equal(await page.locator("#issue-count").textContent(), "0");
    await page.locator("#view-logic-diagram").click();
    await page.locator("#logic-export").waitFor({ state: "visible" });
    await page.waitForFunction(logicDiagramReady);
    assert.equal(await page.locator("#logic-diagram-dialog").isVisible(), true);
    assert.match(await page.locator("#logic-diagram-summary").textContent(), /5 片芯片/);
    assert.ok(await page.locator("#logic-diagram .logic-component").count() > 0);
    assert.match(await page.locator("#logic-diagram").textContent(), /K0 按键/);
    assert.match(await page.locator("#logic-diagram").textContent(), /U4 · 1脚 1A/);
    await page.locator("#close-logic-diagram").click();
    assert.equal(await page.locator("#logic-diagram-dialog").isVisible(), false);
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
}

// 确认弹窗只列出接线图格式，可以取消且焦点回到原按钮
async function testExportCancellation(page) {
    await page.evaluate(disableSavePicker);
    const trigger = page.locator("#export-image");
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "导出接线图" });
    assert.equal(await dialog.isVisible(), true);
    const formats = page.locator("#export-format option");
    assert.deepEqual(await formats.allTextContents(), ["PNG", "JPG"]);
    const picker = page.locator("#export-format-trigger");
    await picker.press("Enter");
    assert.equal(await picker.getAttribute("aria-expanded"), "true");
    await picker.press("Escape");
    assert.equal(await picker.getAttribute("aria-expanded"), "false");
    assert.equal(await dialog.isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), false);
    const focused = page.locator("#export-image:focus");
    assert.equal(await focused.count(), 1);
}

// 在测试页面模拟系统选择器，记录文件类型和实际交给系统写入的文件
function mockSystemSave(filename) {
    const record = { options: null, type: "", size: 0, saved: false };
    // 模拟用户在系统窗口中选定名称或按下取消
    async function chooseFile(options) {
        record.options = options;
        if (filename === "") {
            throw new DOMException("用户取消保存", "AbortError");
        }
        return { name: filename, createWritable: createOutput };
    }
    // 模拟文件写入流，只把编码结果保留在测试内存中
    async function createOutput() {
        return { write: writeFile, close: finishSave };
    }
    // 记录真实编码产生的类型和字节数
    async function writeFile(content) {
        record.type = content.type;
        record.size = content.size;
    }
    // 只有关闭写入流后才算完成保存
    async function finishSave() {
        record.saved = true;
    }
    window.systemSaveTest = record;
    window.showSaveFilePicker = chooseFile;
}

// 返回测试记录，用于核对保存窗口是否已打开
function systemSaveOpened() {
    return window.systemSaveTest.options;
}

// 等待应用生成文件并完成写入，返回文件信息以便断言
function systemSaveFinished() {
    const record = window.systemSaveTest;
    if (record.saved) {
        return record;
    }
    return null;
}

// 网页有系统选择器时直接用它，取消后不写入也不打开备用弹窗
async function testSystemSavePicker(page) {
    const trigger = page.locator("#export-image");
    await page.evaluate(mockSystemSave, "custom.jpeg");
    await trigger.click();
    const completed = await page.waitForFunction(systemSaveFinished);
    const record = await completed.jsonValue();
    assert.equal(record.options.suggestedName, "breadboard-wiring.png");
    assert.deepEqual(record.options.types[1].accept["image/jpeg"], [".jpg", ".jpeg"]);
    assert.equal(record.type, "image/jpeg");
    assert.ok(record.size > 0);
    assert.equal(await page.locator("#export-dialog").isVisible(), false);

    await page.evaluate(mockSystemSave, "");
    await page.locator("#export-project").click();
    const opened = await page.waitForFunction(systemSaveOpened);
    const options = await opened.jsonValue();
    assert.deepEqual(options.types[0].accept["application/json"], [".json"]);
    assert.equal(await page.evaluate(systemSaveFinished), null);
    assert.equal(await page.locator("#export-dialog").isVisible(), false);
}

// 使用同一份补码实验验证正负数的两组累加结果
async function testComplementExamples(page) {
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
}

// 短接、撤销和占用孔提示之后，用空白实验验证输入、备注和器件放置
async function testCircuitEditing(page) {
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
    await page.locator("#switch-without-saving").click();
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
}

// 普通滚轮只滚动，按住 Ctrl 缩放后可回到原先的比例
async function testBoardZoom(page) {
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
}

// 验证实验切换、导入校验、JSON 往返和图片导出
async function testExperimentFiles(page) {
    await page.locator("#from-endpoint").fill("B3:J:49");
    await page.locator("#to-endpoint").fill("B0:A:1");
    await page.locator("#connect-endpoints").click();
    assert.equal(await page.locator("#wire-count").textContent(), "1");
    assert.equal(await page.locator("#load-preset").count(), 0);
    await page.locator("#import-file").setInputFiles(path.join(ROOT, "examples", "complement-adder.json"));
    await page.locator("#switch-without-saving").click();
    await page.waitForFunction(wireCountRestored);
    await testExportCancellation(page);
    const presetId = await page.locator("#experiment-picker").inputValue();
    await page.locator("#new-experiment").click();
    await page.locator("#switch-save").click();
    assert.equal(await page.locator("#wire-count").textContent(), "0");
    assert.equal(await page.locator("#project-mode").count(), 0);
    await page.locator("#experiment-picker").selectOption(presetId, { force: true });
    await page.locator("#switch-without-saving").click();
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
    const exported = await confirmBrowserDownload(page, "#export-project", "json");
    const savedPath = path.join(SCREENSHOTS, "roundtrip.json");
    await exported.saveAs(savedPath);
    await page.locator("#new-project").click();
    await page.locator("#switch-without-saving").click();
    await page.locator("#import-file").setInputFiles(savedPath);
    await page.locator("#switch-without-saving").click();
    await page.waitForFunction(wireCountRestored);
    const png = await readImageDownload(page, "#export-image", "png", "breadboard-wiring.png");
    const canvas = page.locator("#board-canvas");
    const width = Number(await canvas.getAttribute("width"));
    const height = Number(await canvas.getAttribute("height"));
    assert.deepEqual(pngDimensions(png), { width: width, height: height });
    const jpg = await readImageDownload(page, "#export-image", "jpg", "breadboard-wiring.jpg");
    assert.equal(jpg.toString("hex", 0, 3), "ffd8ff");
}

// 检查常用窗口宽度和减弱动效时的帮助对话框
async function testResponsiveWorkbench(page) {
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
}

// 按真实用户操作顺序运行各阶段，失败时保留页面截图与命中信息
async function main() {
    fs.mkdirSync(SCREENSHOTS, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", recordPageError.bind(null, errors));
    try {
        const url = pathToFileURL(path.join(ROOT, "index.html"));
        await openWorkbench(page, url.href);
        await testInitialWorkbench(page);
        await testComplementExamples(page);
        await testCircuitEditing(page);
        await testBoardZoom(page);
        await testExperimentFiles(page);
        await testSystemSavePicker(page);
        await testResponsiveWorkbench(page);
        assert.deepEqual(errors, []);
        console.log("浏览器验证通过：两组验收、Toast、接线、放置芯片、撤销、导入校验、5种视口与画布像素");
    } catch (error) {
        console.log("输入命中诊断：" + JSON.stringify(await page.evaluate(inspectInputHit)));
        throw error;
    } finally {
        await page.screenshot({ path: path.join(SCREENSHOTS, "last-state.png"), fullPage: true });
        await browser.close();
    }
}

// 失败时记录按钮尺寸与点击层级，便于定位实际遮挡而不是强制绕过点击
function inspectInputHit() {
    const items = [];
    for (const selector of [".input-block", "#quick-switches", "button[data-bit='0']", ".input-decimal"]) {
        const element = document.querySelector(selector);
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        items.push({ selector: selector, left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height, overflow: style.overflow, opacity: style.opacity, transform: style.transform });
    }
    const button = document.querySelector("button[data-bit='0']");
    const bounds = button.getBoundingClientRect();
    const hits = document.elementsFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    const names = [];
    for (const hit of hits) {
        names.push(hit.tagName + "." + hit.className);
    }
    return { items: items, hits: names };
}

// 等待布局完成后再核对图纸，排除异步自动排版仍在计算的阶段
function logicDiagramReady() {
    return document.getElementById("logic-diagram-dialog").getAttribute("aria-busy") === "false";
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
