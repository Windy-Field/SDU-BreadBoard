import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = process.cwd();
const POWERSHELL = "powershell.exe";
// 大型图片资料压缩较慢，快捷打包测试最多等待两分钟
const LAUNCHER_TIMEOUT = 120000;
// 使用含中文和空格的目录验证双击入口，打包文件与实际发布脚本保持一致
const LAUNCHER_FILES = ["package.cmd", "package.json", "scripts/package.ps1", "index.html", "application.js", "styles", "vendor", "assets", "examples", "docs", "README.md", "LICENSE"];

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

// 检查批处理换行，并从项目外启动真实入口，返回生成离线包的目录
function testPackageLauncher(temporaryRoot) {
    const launcherText = fs.readFileSync(path.join(ROOT, "package.cmd"), "utf8");
    assert.equal(launcherText.replaceAll("\r\n", "").includes("\n"), false, "批处理必须使用 CRLF 换行，避免 Windows 截断指令");
    const projectRoot = path.join(temporaryRoot, "中文 打包测试");
    for (const name of LAUNCHER_FILES) {
        const destination = path.join(projectRoot, name);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.cpSync(path.join(ROOT, name), destination, { recursive: true });
    }
    const environment = Object.assign({}, process.env);
    environment.SDU_PACKAGE_LAUNCHER = path.join(projectRoot, "package.cmd");
    const options = { cwd: temporaryRoot, env: environment, input: "\r\n", encoding: "utf8", timeout: LAUNCHER_TIMEOUT, windowsVerbatimArguments: true };
    const success = spawnSync("cmd.exe", ["/d", "/c", "call \"%SDU_PACKAGE_LAUNCHER%\""], options);
    assert.ifError(success.error);
    assert.equal(success.status, 0, success.stdout + success.stderr);
    assert.match(success.stdout, /打包完成/);
    assert.match(success.stdout, /Press any key|请按任意键/i, "成功后应保留暂停提示");

    // 缺少运行文件时也要显示失败信息并暂停，让用户能看清错误
    fs.unlinkSync(path.join(projectRoot, "application.js"));
    const failure = spawnSync("cmd.exe", ["/d", "/c", "call \"%SDU_PACKAGE_LAUNCHER%\""], options);
    assert.ifError(failure.error);
    assert.equal(failure.status, 1);
    assert.match(failure.stdout, /打包未完成/);
    assert.match(failure.stdout + failure.stderr, /application\.js/);
    assert.match(failure.stdout, /Press any key|请按任意键/i, "失败后应保留暂停提示");
    return path.join(projectRoot, "releases");
}

// 用游客实际拿到的 ZIP 验证解压后直接运行，结束时关闭浏览器并清理测试目录
async function testOfflinePackage() {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdu-package-test-"));
    let browser = null;
    try {
        const output = testPackageLauncher(temporaryRoot);
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
