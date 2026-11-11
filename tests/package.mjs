import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = process.cwd();
const POWERSHELL = "powershell.exe";

// 记录离线包页面的脚本错误，便于测试结束时统一断言
function collectError(errors, error) {
    errors.push(error.message);
}

// 确认临时目录位于系统临时文件夹内，再清理本次测试产生的文件
function cleanTemporaryDirectory(directory) {
    const temporaryRoot = path.resolve(os.tmpdir());
    const target = path.resolve(directory);
    if (!target.startsWith(temporaryRoot + path.sep) || !path.basename(target).startsWith("sdu-package-test-")) {
        throw new Error("临时目录路径不正确，已停止清理");
    }
    fs.rmSync(target, { recursive: true, force: true });
}

// 用游客实际拿到的 ZIP 验证解压后直接运行，结束时关闭浏览器并清理测试目录
async function testOfflinePackage() {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdu-package-test-"));
    let browser = null;
    try {
        const output = path.join(temporaryRoot, "output");
        execFileSync(POWERSHELL, ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(ROOT, "scripts", "package.ps1"), "-OutputDirectory", output], { stdio: "pipe" });
        const archives = fs.readdirSync(output);
        assert.equal(archives.length, 1);
        const archive = path.join(output, archives[0]);
        assert.ok(archive.endsWith("-offline.zip"));
        const expanded = path.join(temporaryRoot, "unpacked");
        // 参数通过环境变量传递，文件路径不拼进 PowerShell 命令字符串
        const environment = Object.assign({}, process.env);
        environment.SDU_TEST_ARCHIVE = archive;
        environment.SDU_TEST_EXPANDED = expanded;
        execFileSync(POWERSHELL, ["-NoLogo", "-NoProfile", "-Command", "Expand-Archive -LiteralPath $env:SDU_TEST_ARCHIVE -DestinationPath $env:SDU_TEST_EXPANDED"], { env: environment, stdio: "pipe" });
        const folders = fs.readdirSync(expanded);
        assert.equal(folders.length, 1);
        const packageRoot = path.join(expanded, folders[0]);
        for (const required of ["index.html", "application.js", "assets/favicon.png", "assets/favicon.ico", "assets/pinouts/sn74ls273.png", "vendor/lucide.min.js", "styles/app.css", "LICENSE", "START-HERE.md"]) {
            assert.ok(fs.existsSync(path.join(packageRoot, required)), "离线包缺少文件：" + required);
        }
        for (const excluded of ["node_modules", ".git", "reports", "src", "tests"]) {
            assert.equal(fs.existsSync(path.join(packageRoot, excluded)), false);
        }
        browser = await chromium.launch({ headless: true, channel: "msedge" });
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", collectError.bind(null, errors));
        await page.goto(pathToFileURL(path.join(packageRoot, "index.html")).href);
        await page.waitForSelector(".chip-option");
        assert.match(await page.locator("head link[rel='icon']").getAttribute("href"), /^assets\/favicon\.png/);
        assert.equal(await page.locator("head link[rel='shortcut icon']").count(), 1);
        await page.getByRole("button", { name: "切换 K6", exact: true }).click();
        await page.getByRole("button", { name: "切换 K6", exact: true }).click();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0000");
        await page.getByRole("button", { name: "切换 K0", exact: true }).click();
        await page.locator("#pulse-negative").click();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0001");
        await page.locator(".chip-option[data-model='74LS273']").click();
        const image = page.locator("#inspect-panel .chip-reference img");
        await image.waitFor();
        await page.waitForFunction(pinoutReady);
        assert.ok(await image.evaluate(imageWidth) > 100);
        const downloadEvent = page.waitForEvent("download");
        await page.locator("#export-project").click();
        const download = await downloadEvent;
        assert.equal(download.suggestedFilename(), "breadboard-circuit.json");
        assert.deepEqual(errors, []);
        console.log("离线包验证通过：解压后直接打开、favicon、芯片引脚图、清零、脉冲运算和电路导出");
    } finally {
        if (browser) {
            await browser.close();
        }
        cleanTemporaryDirectory(temporaryRoot);
    }
}

// 读取已加载图片的原始宽度，确认离线包引用到真实图片
function imageWidth(image) {
    return image.naturalWidth;
}

// 等待图片解码结束，再检查实际宽度，避免把加载中误判为资源缺失
function pinoutReady() {
    const image = document.querySelector("#inspect-panel .chip-reference img");
    return image && image.complete && image.naturalWidth > 100;
}

await testOfflinePackage();
