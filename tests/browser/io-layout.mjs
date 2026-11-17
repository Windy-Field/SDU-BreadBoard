import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// 覆盖常见桌面、平板与手机尺寸，并检查少量及完整24位端口
const VIEWPORTS = [1920, 1700, 1600, 1280, 1050, 768, 375, 320];
const PORT_COUNTS = [
    { input: 7, output: 7 },
    { input: 16, output: 8 },
    { input: 24, output: 24 }
];
const REPORT_DIRECTORY = path.join(process.cwd(), "reports", "screenshots");

// 检查同排功能组居中、数值位于开关右侧，脉冲按钮按实际空间自动排列
function inspectIoLayout() {
    const failures = [];
    const strip = document.querySelector(".io-strip").getBoundingClientRect();
    const workbench = document.querySelector(".workbench").getBoundingClientRect();
    const groups = [];
    for (const selector of [".io-settings", ".result-block", ".input-block", ".operation-block"]) {
        const bounds = document.querySelector(selector).getBoundingClientRect();
        if (bounds.left < strip.left || bounds.right > strip.right + 1 || bounds.top < strip.top || bounds.bottom > strip.bottom + 1) {
            failures.push(selector + " 超出操作栏");
        }
        groups.push(bounds);
    }
    for (let first = 0; first < groups.length; first = first + 1) {
        for (let second = first + 1; second < groups.length; second = second + 1) {
            const left = groups[first];
            const right = groups[second];
            if (left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top) {
                failures.push("功能组重叠");
            }
        }
    }
    if (workbench.width > 1000) {
        const center = (groups[0].top + groups[0].bottom) / 2;
        for (const bounds of groups) {
            const groupCenter = (bounds.top + bounds.bottom) / 2;
            if (Math.abs(groupCenter - center) > 1) {
                failures.push("桌面功能组被挤到下一排或未居中");
            }
        }
    }
    const switches = document.getElementById("quick-switches").getBoundingClientRect();
    const number = document.getElementById("input-decimal").getBoundingClientRect();
    const switchesCenter = (switches.top + switches.bottom) / 2;
    const numberCenter = (number.top + number.bottom) / 2;
    if (number.left < switches.right || Math.abs(switchesCenter - numberCenter) > 1) {
        failures.push("输入十进制数未在开关右侧居中");
    }
    const positive = document.getElementById("pulse-positive").getBoundingClientRect();
    const negative = document.getElementById("pulse-negative").getBoundingClientRect();
    const pulseGroup = document.querySelector(".operation-block");
    const pulseWidth = pulseGroup.getBoundingClientRect().width;
    const pulseGap = Number.parseFloat(getComputedStyle(pulseGroup).columnGap);
    const sameRow = Math.abs(positive.top - negative.top) <= 1;
    if (positive.width + negative.width + pulseGap <= pulseWidth + 1) {
        if (!sameRow) {
            failures.push("空间足够时脉冲按钮未并排");
        }
    } else if (sameRow || Math.abs(positive.right - negative.right) > 1) {
        failures.push("空间不足时脉冲按钮未上下对齐");
    }
    const input = groups[2];
    const buttons = document.querySelectorAll("#quick-switches button");
    const firstRow = buttons[0].getBoundingClientRect().top;
    const lastRow = buttons[buttons.length - 1].getBoundingClientRect().top;
    if (workbench.width > 1000 && lastRow > firstRow + 1 && sameRow) {
        failures.push("开关过长时脉冲按钮没有先上下排列让出空间");
    }
    for (const button of buttons) {
        const bounds = button.getBoundingClientRect();
        if (bounds.left < input.left || bounds.right > input.right + 1 || bounds.bottom > input.bottom + 1) {
            failures.push("输入按钮越界");
        }
        const outputCount = document.querySelectorAll("#output-leds .output-port").length;
        if (workbench.width > 1000 && outputCount <= 8 && buttons.length <= 16 && Math.abs(bounds.top - firstRow) > 1) {
            failures.push("宽屏16位以内输入不应换行");
        }
    }
    if (document.documentElement.scrollWidth > window.innerWidth) {
        failures.push("页面横向溢出");
    }
    return failures;
}

// 在实际开关可见时检查点击命中，不用强制点击绕开遮挡
async function toggleInput(page) {
    const button = page.getByRole("button", { name: "切换 K0", exact: true });
    const previous = await button.getAttribute("aria-pressed");
    await button.click();
    assert.notEqual(await button.getAttribute("aria-pressed"), previous);
    await button.click();
    assert.equal(await button.getAttribute("aria-pressed"), previous);
}

// 验证操作栏排列与输入操作，截图仅放入测试报告目录
async function main() {
    fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    try {
        const url = pathToFileURL(path.join(process.cwd(), "index.html"));
        await page.goto(url.href);
        await page.waitForSelector("#quick-switches button");
        for (const width of VIEWPORTS) {
            await page.setViewportSize({ width: width, height: 1080 });
            for (const counts of PORT_COUNTS) {
                await page.locator("#input-count").fill(String(counts.input));
                await page.locator("#input-count").press("Tab");
                await page.locator("#output-count").fill(String(counts.output));
                await page.locator("#output-count").press("Tab");
                assert.deepEqual(await page.evaluate(inspectIoLayout), [], "操作栏布局：" + width + "px，输入" + counts.input + "位，输出" + counts.output + "位");
                await toggleInput(page);
                if (counts.input >= 16 && (width === 1600 || width === 1700 || width === 1920 || width === 375)) {
                    const filename = path.join(REPORT_DIRECTORY, "io-strip-" + width + "-" + counts.input + ".png");
                    await page.locator(".io-strip").screenshot({ path: filename });
                }
            }
        }
        await page.locator("#save-project").click();
        console.log("操作栏验证通过：八种视口、7/16/24位输入输出、长输入保持分栏且脉冲先叠放");
    } finally {
        await browser.close();
    }
}

await main();
