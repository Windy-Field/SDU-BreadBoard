import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { WORKSPACE_KEY } from "../../src/storage/workspace.mjs";

const ADDRESS = pathToFileURL(path.resolve("index.html")).href;
const VIEWPORTS = [
    { width: 1600, height: 900 },
    { width: 375, height: 800 },
    { width: 667, height: 375 }
];

// 核对公告和确认按钮在指定窗口内完整显示，不遮挡操作
async function checkAnnouncementLayout(page, dialog, confirmButton) {
    for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        const panel = await dialog.boundingBox();
        const button = await confirmButton.boundingBox();
        assert.ok(panel.x >= 0 && panel.x + panel.width <= viewport.width);
        assert.ok(panel.y >= 0 && panel.y + panel.height <= viewport.height);
        assert.ok(button.y >= panel.y && button.y + button.height <= panel.y + panel.height);
    }
}

// 查询实验存档，确认公告打开时按保存快捷键不会修改电路
function readWorkspace(key) {
    return localStorage.getItem(key);
}

// 验证离线公告的 Markdown、关闭行为和本地提醒设置
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    try {
        const page = await browser.newPage({ reducedMotion: "reduce" });
        const context = page.context();
        await context.setOffline(true);
        await page.goto(ADDRESS);
        const dialog = page.getByRole("dialog", { name: "实验接线提醒" });
        const trigger = page.getByRole("button", { name: "项目公告" });
        const confirmButton = dialog.getByRole("button", { name: "我知道了" });
        const checkbox = dialog.getByRole("checkbox", { name: "不再提醒" });
        await dialog.waitFor();
        const emphasis = dialog.locator("p > strong");
        assert.equal(await emphasis.first().textContent(), "仅供参考");
        assert.match(await dialog.locator("blockquote").textContent(), /实际接线以课程要求和实物实验板为准/);
        assert.equal(await dialog.locator("svg.lucide-megaphone").count(), 1);
        assert.equal(await checkbox.isChecked(), false);
        await checkAnnouncementLayout(page, dialog, confirmButton);
        await page.keyboard.press("Control+s");
        assert.equal(await page.evaluate(readWorkspace, WORKSPACE_KEY), null);

        // 普通确认和按 Esc 都不会关闭下次提醒
        await confirmButton.click();
        await dialog.waitFor({ state: "hidden" });
        await page.reload();
        await checkbox.check();
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        await page.reload();
        await dialog.waitFor();
        assert.equal(await checkbox.isChecked(), false);

        // 关闭提醒后仍可手动打开，取消勾选并确认会恢复提醒
        await checkbox.check();
        await confirmButton.click();
        await page.reload();
        assert.equal(await dialog.isVisible(), false);
        await trigger.click();
        assert.equal(await checkbox.isChecked(), true);
        await checkbox.uncheck();
        await confirmButton.click();
        await page.reload();
        await dialog.waitFor();
        assert.equal(await checkbox.isChecked(), false);
        console.log("公告验证通过：离线 Markdown、窄屏布局、快捷键隔离、关闭与恢复提醒");
    } finally {
        await browser.close();
    }
}

await main();
