import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { confirmBrowserDownload } from "../helpers/downloads.mjs";
import { pathToFileURL } from "node:url";
import { openWorkbench } from "../helpers/announcement.mjs";
import { RAM_INPUTS, RAM_EXPERIMENT_ID } from "../../src/experiments/ram-preset.mjs";
import { APP_VERSION } from "../../src/version.mjs";

// 测试截图只写入报告目录，不替换用户的最新页面图片
const REPORT_DIRECTORY = path.join(process.cwd(), "reports", "screenshots");
const VIEWPORTS = [1600, 1280, 768, 375];

// 记录浏览器运行错误，测试结束统一核对
function collectError(errors, error) {
    errors.push(error.message);
}

// 按需点击真实开关，不使用强制点击绕过遮挡
async function setControl(page, bit, value) {
    const button = page.getByRole("button", { name: "切换 K" + bit, exact: true });
    const pressed = await button.getAttribute("aria-pressed");
    const expected = String(value === 1);
    if (pressed !== expected) {
        await button.click();
    }
}

// 使用实际界面依次设置低四位地址、芯片选择和八位数据
async function setAddress(page, address, number) {
    for (let bit = 0; bit < 4; bit = bit + 1) {
        const value = (address >> bit) & 1;
        await setControl(page, RAM_INPUTS.addressStart + bit, value);
    }
    await setControl(page, RAM_INPUTS.bank, (address >> 11) & 1);
    for (let bit = 0; bit < 8; bit = bit + 1) {
        const value = (number >> bit) & 1;
        await setControl(page, RAM_INPUTS.dataStart + bit, value);
    }
}

// 按备注中的顺序写入一个地址，结束写入后才隔离缓冲器
async function writeByte(page, address, number) {
    await setControl(page, RAM_INPUTS.read, 1);
    await setControl(page, RAM_INPUTS.write, 1);
    await setAddress(page, address, number);
    await setControl(page, RAM_INPUTS.isolate, 0);
    await setControl(page, RAM_INPUTS.write, 0);
    await setControl(page, RAM_INPUTS.write, 1);
    await setControl(page, RAM_INPUTS.isolate, 1);
}

// 生成八位预期显示，左侧为最高位
function expectedBits(number) {
    const binary = number.toString(2);
    return binary.padStart(8, "0");
}

// 检查每个按钮中心都能接收点击，按钮和文字不能超出输入区域
function inspectInputLayout() {
    const failures = [];
    const input = document.querySelector(".input-block").getBoundingClientRect();
    for (const button of document.querySelectorAll("#quick-switches button")) {
        const bounds = button.getBoundingClientRect();
        const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        if (hit !== button || bounds.left < input.left || bounds.right > input.right || bounds.bottom > input.bottom) {
            failures.push({ button: button.getAttribute("aria-label"), hit: hit.outerHTML.slice(0, 160), right: bounds.right, inputRight: input.right, bottom: bounds.bottom, inputBottom: input.bottom });
        }
    }
    return failures;
}

// 读取主画布像素差异，确认实验接线实际绘制而非空白画布
function canvasHasContent() {
    const canvas = document.getElementById("board-canvas");
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let colored = 0;
    for (let index = 0; index < pixels.length; index = index + 16) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        if (Math.max(red, green, blue) - Math.min(red, green, blue) > 40) {
            colored = colored + 1;
        }
    }
    return colored > 1000;
}

// 仅在图纸完成真实布局后继续，生成过程不得改变RAM内容
function logicReady() {
    return document.getElementById("logic-diagram-dialog").getAttribute("aria-busy") === "false";
}

// 验证第二份实验入口、课件读写、不同视口按钮命中及导入导出
async function main() {
    fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on("pageerror", collectError.bind(null, errors));
    try {
        const url = pathToFileURL(path.join(process.cwd(), "index.html"));
        await openWorkbench(page, url.href);
        await page.waitForSelector("#experiment-picker-trigger");
        const options = await page.locator("#experiment-picker option").allTextContents();
        assert.deepEqual(options, ["双符号位补码运算器", "实验三 RAM字扩展", "实验四 时序系统"]);
        await page.locator("#experiment-picker-trigger").click();
        await page.locator("#experiment-picker-option-1").click();
        assert.equal(await page.locator("#experiment-picker").inputValue(), RAM_EXPERIMENT_ID);
        assert.equal(await page.locator("#app-version").textContent(), "Version: " + APP_VERSION);
        assert.equal(await page.locator("#quick-switches button").count(), 16);
        assert.equal(await page.locator("#binary-result").textContent(), "ZZZZ ZZZZ");
        assert.equal(await page.locator("#issue-count").textContent(), "0");
        await page.locator("#tab-notes").click();
        assert.match(await page.locator("#notes-preview").textContent(), /K13 拨到 0，再拨回 1/);
        await page.locator("#tab-inspect").click();
        const samples = [[10, 85], [5, 170], [2058, 255], [2053, 0]];
        for (const sample of samples) {
            await writeByte(page, sample[0], sample[1]);
        }
        await setControl(page, RAM_INPUTS.read, 0);
        for (const sample of samples) {
            await setAddress(page, sample[0], 0);
            const actual = await page.locator("#binary-result").textContent();
            assert.equal(actual.replaceAll(" ", ""), expectedBits(sample[1]));
            assert.equal(await page.locator("#issue-count").textContent(), "0");
        }
        await setAddress(page, 10, 0);
        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(logicReady);
        assert.match(await page.locator("#logic-diagram").textContent(), /6116/);
        assert.match(await page.locator("#logic-diagram-summary").textContent(), /4 片芯片/);
        await page.screenshot({ path: path.join(REPORT_DIRECTORY, "ram-logic.png"), fullPage: true });
        await page.locator("#close-logic-diagram").click();
        assert.equal(await page.locator("#binary-result").textContent(), "0101 0101");
        for (const width of VIEWPORTS) {
            await page.setViewportSize({ width: width, height: 1000 });
            await page.locator("#fit-board").click();
            await page.locator("#quick-switches").scrollIntoViewIfNeeded();
            assert.deepEqual(await page.evaluate(inspectInputLayout), [], "输入开关被遮挡，宽度 " + width);
            await setControl(page, 0, 1);
            await setControl(page, 0, 0);
            assert.equal(await page.evaluate(canvasHasContent), true);
            await page.screenshot({ path: path.join(REPORT_DIRECTORY, "ram-" + width + ".png"), fullPage: true });
        }
        await page.setViewportSize({ width: 1600, height: 1000 });
        await page.locator("#save-project").click();
        const download = await confirmBrowserDownload(page, "#export-project", "json");
        const exportedPath = path.join(REPORT_DIRECTORY, "ram-roundtrip.json");
        await download.saveAs(exportedPath);
        const project = JSON.parse(fs.readFileSync(exportedPath, "utf8"));
        assert.equal(project.chips.length, 4);
        assert.equal(Object.hasOwn(project, "devices"), false);
        await page.reload();
        await page.waitForSelector("#experiment-picker-trigger");
        assert.equal(await page.locator("#experiment-picker option").count(), 3);
        assert.equal(await page.locator("#project-name").inputValue(), "实验三 RAM字扩展");
        assert.equal(await page.locator("#binary-result").textContent(), "XXXX XXXX");
        await page.locator("#new-project").click();
        await page.locator("#import-file").setInputFiles(exportedPath);
        await page.locator("#switch-without-saving").click();
        await page.getByRole("button", { name: "切换 K15", exact: true }).waitFor();
        assert.equal(await page.locator("#binary-result").textContent(), "XXXX XXXX");
        await writeByte(page, 10, 85);
        await setControl(page, RAM_INPUTS.read, 0);
        assert.equal(await page.locator("#binary-result").textContent(), "0101 0101");
        await page.locator("#save-project").click();
        assert.deepEqual(errors, []);
        console.log("RAM界面通过：第二份存档、四组课件数据、逻辑图、四种视口输入点击、画布像素与存档恢复");
    } finally {
        await browser.close();
    }
}

await main();
