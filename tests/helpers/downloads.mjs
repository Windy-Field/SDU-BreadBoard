import assert from "node:assert/strict";
import fs from "node:fs/promises";

// 在自动化浏览器中关闭系统选择器，验证不支持它时仍能下载
export function disableSavePicker() {
    window.showSaveFilePicker = undefined;
}

// 打开网页版备用弹窗、选择格式并返回浏览器收到的下载对象
export async function confirmBrowserDownload(page, selector, format) {
    await page.evaluate(disableSavePicker);
    await page.locator(selector).click();
    await page.locator("#export-format").selectOption(format);
    const waiting = page.waitForEvent("download");
    await page.locator("#export-confirm").click();
    return waiting;
}

// 下载所选格式并读取文件内容，同时核对实际保存的文件名
export async function readImageDownload(page, selector, format, expectedName) {
    const download = await confirmBrowserDownload(page, selector, format);
    assert.equal(download.suggestedFilename(), expectedName);
    const filename = await download.path();
    return fs.readFile(filename);
}

// 读取 PNG 文件头中的原始像素尺寸，排除只改扩展名的情况
export function pngDimensions(content) {
    assert.equal(content.toString("hex", 0, 8), "89504e470d0a1a0a");
    return { width: content.readUInt32BE(16), height: content.readUInt32BE(20) };
}
