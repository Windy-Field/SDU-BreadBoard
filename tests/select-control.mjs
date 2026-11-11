import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { emptyProject } from "../src/board.mjs";

const ROOT = process.cwd();
const SCREENSHOTS = path.join(ROOT, "reports", "screenshots");

// 写入独立测试浏览器的实验列表，不改用户当前浏览器的存储
function seedExperiments(workspace) {
    localStorage.setItem("breadboard-lab-workspace-v1", JSON.stringify(workspace));
}

// 从真实布局检查面板的边界、文字宽度和顶层命中，排除被侧栏遮挡的情况
function inspectDropdown() {
    const panel = document.getElementById("experiment-picker-listbox");
    const bounds = panel.getBoundingClientRect();
    const triggerBounds = document.getElementById("experiment-picker-trigger").getBoundingClientRect();
    const optionBounds = panel.firstElementChild.getBoundingClientRect();
    const textBounds = panel.querySelector(".select-option-label").getBoundingClientRect();
    const center = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + 20);
    return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        leftGap: optionBounds.left - bounds.left,
        rightGap: bounds.right - optionBounds.right,
        textGap: textBounds.left - bounds.left,
        panelPadding: getComputedStyle(panel).paddingLeft,
        optionPadding: getComputedStyle(panel.firstElementChild).paddingLeft,
        widthDifference: Math.abs(bounds.width - triggerBounds.width),
        contentFits: panel.scrollWidth <= panel.clientWidth + 1,
        topLayer: panel.contains(center),
        open: panel.matches(":popover-open")
    };
}

// 记录页面异常，确保下拉操作没有破坏应用
function collectError(errors, error) {
    errors.push(error.message);
}

// 滚动父容器，检查下拉面板会收起而不会遗留在错误位置
function scrollSidebar() {
    const sidebar = document.querySelector(".library");
    sidebar.dispatchEvent(new Event("scroll"));
}

// 读取普通页面文字的选择结果，不读取输入框自己的选择范围
function pageSelection() {
    return window.getSelection().toString();
}

// 返回编辑框当前选中的文字，用于确认全选仍可正常使用
function inputSelection(input) {
    return input.value.slice(input.selectionStart, input.selectionEnd);
}

// 普通文字不可拖选，标题和备注编辑时仍允许选中，只读框不开放选择
async function testTextSelection(page) {
    const heading = page.locator("h1").first();
    await heading.click({ clickCount: 3 });
    assert.equal(await page.evaluate(pageSelection), "");
    const title = page.locator("#project-name");
    await title.focus();
    await page.keyboard.press("Control+a");
    assert.equal(await title.evaluate(inputSelection), await title.inputValue());
    await page.locator("#read-only-toggle").check();
    assert.equal(await title.evaluate(readSelectionStyle), "none");
    await page.locator("#read-only-toggle").uncheck();
    await page.locator("#tab-notes").click();
    await page.locator("#notes-edit-button").click();
    const notes = page.locator("#notes-editor");
    await notes.focus();
    await page.keyboard.press("Control+a");
    assert.equal(await notes.evaluate(inputSelection), await notes.inputValue());
    await page.locator("#notes-preview-button").click();
    assert.equal(await page.locator("#notes-preview").evaluate(readSelectionStyle), "none");
    await page.locator("#tab-inspect").click();
    await page.locator("#help-button").click();
    const paragraph = page.locator("#help-dialog p").first();
    await paragraph.click({ clickCount: 3 });
    assert.equal(await page.evaluate(pageSelection), "");
    await page.locator("#close-help").click();
}

// 读取节点的实际选择样式，包含样式继承和只读状态的影响
function readSelectionStyle(element) {
    return getComputedStyle(element).userSelect;
}

// 读取搜索框、图标和实验选择框的位置，用于检查边缘对齐及焦点样式
function inspectSearchField() {
    const field = document.querySelector(".search-field");
    const input = document.getElementById("chip-search");
    const fieldBounds = field.getBoundingClientRect();
    const inputBounds = input.getBoundingClientRect();
    const iconBounds = field.querySelector("svg").getBoundingClientRect();
    const pickerBounds = document.getElementById("experiment-picker-trigger").getBoundingClientRect();
    const fieldStyle = getComputedStyle(field);
    return {
        left: fieldBounds.left,
        right: fieldBounds.right,
        height: fieldBounds.height,
        leftDifference: Math.abs(fieldBounds.left - pickerBounds.left),
        rightDifference: Math.abs(fieldBounds.right - pickerBounds.right),
        centerDifference: Math.abs(iconBounds.top + iconBounds.height / 2 - inputBounds.top - inputBounds.height / 2),
        inputFits: inputBounds.left >= fieldBounds.left && inputBounds.right <= fieldBounds.right,
        outline: getComputedStyle(input).outlineStyle,
        shadow: fieldStyle.boxShadow
    };
}

// 搜索前后边框不移动，图标和输入区居中，型号筛选和清空保持正常
async function testSearchField(page) {
    const input = page.locator("#chip-search");
    await page.locator("h1").click();
    const before = await page.evaluate(inspectSearchField);
    const originalCount = await page.locator(".chip-option").count();
    await input.focus();
    await input.fill("74LS139");
    assert.equal(await page.locator(".chip-option").count(), 1);
    await input.fill("");
    assert.equal(await page.locator(".chip-option").count(), originalCount);
    const focused = await page.evaluate(inspectSearchField);
    assert.equal(focused.left, before.left);
    assert.equal(focused.right, before.right);
    assert.equal(focused.height, before.height);
    assert.ok(focused.leftDifference <= 1 && focused.rightDifference <= 1, "搜索框应与实验选择框左右对齐");
    assert.ok(focused.centerDifference <= 1, "搜索图标与输入区应垂直居中");
    assert.equal(focused.inputFits, true);
    assert.equal(focused.outline, "none");
    assert.notEqual(focused.shadow, "none");
    await page.screenshot({ path: path.join(SCREENSHOTS, "search-focused.png"), fullPage: true });
}

// 核对左侧栏自身不滚动，器件与实验区域独立容纳内容，底部入口留在栏内
function inspectSidebarScroll() {
    const sidebar = document.querySelector(".library");
    const experiments = document.querySelector(".library-section");
    const chips = document.querySelector(".chip-library");
    const footer = document.querySelector(".library-footer");
    const sidebarBounds = sidebar.getBoundingClientRect();
    const footerBounds = footer.getBoundingClientRect();
    return getComputedStyle(sidebar).overflowY === "hidden"
        && sidebar.scrollHeight <= sidebar.clientHeight + 1
        && getComputedStyle(experiments).overflowY === "auto"
        && getComputedStyle(chips).overflowY === "auto"
        && footerBounds.bottom <= sidebarBounds.bottom + 1;
}

// 验证长名称、多选项、真实点击、键盘、边界定位和移动视口
async function main() {
    fs.mkdirSync(SCREENSHOTS, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on("pageerror", collectError.bind(null, errors));
    try {
        await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href);
        await page.waitForSelector("#experiment-picker-trigger");
        await testSearchField(page);
        await testTextSelection(page);
        const workspace = { version: 1, activeId: "sample-0", projects: {} };
        for (let index = 0; index < 14; index = index + 1) {
            const project = emptyProject();
            project.notes = "测试实验 " + index;
            project.name = "实验 " + index + " · 逻辑电路";
            workspace.projects["sample-" + index] = project;
        }
        workspace.projects["sample-1"].name = "带有完整长名称的多级组合逻辑与寄存器联合实验，用于检查选项自动换行和边缘显示";
        await page.evaluate(seedExperiments, workspace);
        await page.reload();
        const trigger = page.locator("#experiment-picker-trigger");
        assert.equal(await page.evaluate(inspectSidebarScroll), true);
        await trigger.click();
        let size = await page.evaluate(inspectDropdown);
        assert.equal(size.open, true);
        assert.equal(size.topLayer, true);
        assert.equal(size.contentFits, true);
        assert.ok(size.widthDifference <= 1, "下拉列表应与选择框等宽");
        assert.equal(size.panelPadding, "2px", "列表左右内边距应为2px");
        assert.equal(size.optionPadding, "2px", "选项左右内边距应为2px");
        assert.ok(size.textGap <= 7, "选项文字不应叠加宽滚动条留白");
        assert.ok(Math.abs(size.leftGap - size.rightGap) <= 1, "下拉选项左右留白不对称");
        assert.ok(size.left >= 0 && size.right <= size.viewportWidth);
        assert.ok(size.top >= 0 && size.bottom <= size.viewportHeight);
        assert.equal(await page.locator("#experiment-picker-listbox [aria-selected='true']").count(), 1);
        assert.equal(await page.locator("#experiment-picker-option-0").evaluate(readSelectionStyle), "none");
        await page.waitForTimeout(180);
        await page.screenshot({ path: path.join(SCREENSHOTS, "dropdown-desktop.png"), fullPage: true });
        await page.locator("#experiment-picker-option-1").click();
        assert.equal(await page.locator("#experiment-picker").inputValue(), "sample-1");
        assert.match(await trigger.textContent(), /完整长名称/);
        await trigger.focus();
        await page.keyboard.press("Enter");
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#experiment-picker").inputValue(), "sample-13");
        await page.keyboard.press("Enter");
        await page.keyboard.press("Home");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#experiment-picker").inputValue(), "sample-13");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await trigger.click();
        await page.keyboard.press("Tab");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await trigger.click();
        await page.locator("h1").click();
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await trigger.click();
        await page.evaluate(scrollSidebar);
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await page.locator("#read-only-toggle").check();
        await trigger.click();
        await page.locator("#experiment-picker-option-0").click();
        assert.equal(await page.locator("#experiment-picker").inputValue(), "sample-0");
        for (const width of [320, 375, 768]) {
            await page.setViewportSize({ width: width, height: 900 });
            assert.equal(await page.evaluate(inspectSidebarScroll), true, "左侧栏出现总滚动或底部被裁切");
            await trigger.click();
            size = await page.evaluate(inspectDropdown);
            assert.equal(size.open, true);
            assert.equal(size.topLayer, true);
            assert.equal(size.contentFits, true);
            assert.ok(size.widthDifference <= 1, "窄屏下拉列表应与选择框等宽");
            assert.ok(size.textGap <= 7, "窄屏选项文字不应叠加宽滚动条留白");
            assert.ok(Math.abs(size.leftGap - size.rightGap) <= 1, "窄屏下拉选项左右留白不对称");
            assert.ok(size.left >= 0 && size.right <= size.viewportWidth);
            assert.ok(size.top >= 0 && size.bottom <= size.viewportHeight);
            await page.waitForTimeout(180);
            await page.screenshot({ path: path.join(SCREENSHOTS, "dropdown-" + width + ".png"), fullPage: true });
            await page.keyboard.press("Escape");
        }
        await page.emulateMedia({ reducedMotion: "reduce" });
        await trigger.click();
        await page.keyboard.press("Home");
        await page.keyboard.press("Enter");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await page.setViewportSize({ width: 1600, height: 1000 });
        await page.locator("#read-only-toggle").uncheck();
        assert.equal(await page.locator("#load-preset").count(), 0);
        await page.locator("#import-file").setInputFiles(path.join(ROOT, "examples", "complement-adder.json"));
        await page.locator("#inspect-panel [data-chip='U1']").waitFor();
        await page.locator("#inspect-panel [data-chip='U1']").click();
        const section = page.locator("#move-section-trigger");
        await section.click();
        await page.locator("#move-section-option-0").click();
        assert.equal(await page.locator("#move-section").inputValue(), "0");
        await page.locator("#read-only-toggle").check();
        assert.equal(await section.isDisabled(), true);
        await trigger.click();
        assert.equal(await page.locator(".select-panel:popover-open").count(), 1);
        await page.keyboard.press("Escape");
        assert.deepEqual(errors, []);
        console.log("下拉及文本选择验证通过：普通文字禁止选择、编辑框全选、只读保护、选项切换、键盘和四种视口");
    } finally {
        await browser.close();
    }
}

await main();
