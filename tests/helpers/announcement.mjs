// 关闭测试页面的首次公告，让接下来的测试可以操作实验界面
export async function dismissStartupAnnouncement(page) {
    const dialog = page.locator("#announcement-dialog");
    if (await dialog.isVisible()) {
        await dialog.getByRole("checkbox", { name: "不再提醒" }).check();
        await dialog.getByRole("button", { name: "我知道了" }).click();
    }
}

// 打开指定的实验页面，并在测试其他功能前处理首次公告
export async function openWorkbench(page, address) {
    await page.goto(address);
    await dismissStartupAnnouncement(page);
}
