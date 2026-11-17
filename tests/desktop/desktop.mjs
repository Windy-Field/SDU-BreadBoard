import { _electron as electron } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DESKTOP_SETTINGS } from "../../desktop/settings.mjs";
import { APP_VERSION } from "../../src/version.mjs";
import { plainReleaseNotes } from "../../desktop/release-notes.mjs";

// 每次测试使用独立存档目录，可用环境变量切换为已打包的可执行文件
const ROOT = process.cwd();
const EXECUTABLE = process.env.SDU_DESKTOP_EXECUTABLE;
const START_TIMEOUT = 60000;

// 删除本次桌面测试目录前，确认绝对路径仍在系统临时目录内
function removeTestDirectory(directory) {
    const parent = path.resolve(os.tmpdir());
    const target = path.resolve(directory);
    if (!target.startsWith(parent + path.sep) || !path.basename(target).startsWith("sdu-desktop-test-")) {
        throw new Error("桌面测试临时目录超出清理范围");
    }
    fs.rmSync(target, { recursive: true, force: true });
}

// 启动开发入口或打包后的应用，固定测试存档并隐藏自动化窗口
async function launchDesktop(directory) {
    const argumentsList = [];
    if (!EXECUTABLE) {
        argumentsList.push(ROOT);
    }
    argumentsList.push("--user-data-dir=" + directory, "--test-desktop");
    const options = { args: argumentsList, timeout: START_TIMEOUT };
    if (EXECUTABLE) {
        options.executablePath = path.resolve(EXECUTABLE);
    }
    const environment = Object.assign({}, process.env);
    delete environment.ELECTRON_RUN_AS_NODE;
    options.env = environment;
    return electron.launch(options);
}

// 读取主进程窗口与存档设置，确保页面没有获得系统访问能力
function inspectDesktop(application) {
    const windows = application.BrowserWindow.getAllWindows();
    const preferences = windows[0].webContents.getLastWebPreferences();
    return {
        version: application.app.getVersion(),
        dataPath: application.app.getPath("userData"),
        nodeIntegration: preferences.nodeIntegration,
        contextIsolation: preferences.contextIsolation,
        sandbox: preferences.sandbox,
        url: windows[0].webContents.getURL()
    };
}

// 页面必须只能使用浏览器接口，不能直接读取 Node.js 模块
function inspectRenderer() {
    return { requireType: typeof window.require, processType: typeof window.process, origin: window.location.origin };
}

// 布线库完成初始化后再验证接线功能，避免点击期间仍在载入 WebAssembly
function routingReady() {
    return !document.getElementById("connect-endpoints").disabled;
}

// 图纸生成完成后再检查真实网络与门符号
function diagramReady() {
    return document.getElementById("logic-diagram-dialog").getAttribute("aria-busy") === "false" &&
        document.querySelectorAll("#logic-diagram .logic-edge").length > 0;
}

// 测试下载时直接指定临时保存路径，正式应用仍使用系统保存窗口
function saveNextDownload(application, filename) {
    const window = application.BrowserWindow.getAllWindows()[0];
    // Electron 下载从会话通知完成，不依赖普通网页的下载事件
    function waitDownload(resolve) {
        // 测试监听在下载开始时覆盖路径，不修改页面的导出实现
        function setDownloadPath(event, item) {
            item.setSavePath(filename);
            // 返回实际完成状态，失败或取消都不能当作成功
            function downloadFinished(downloadEvent, state) {
                resolve(state);
            }
            item.once("done", downloadFinished);
        }
        window.webContents.session.once("will-download", setDownloadPath);
    }
    globalThis.desktopDownload = new Promise(waitDownload);
}

// 等待主进程登记的下载结束，成功状态应为 completed
function completedDownload() {
    return globalThis.desktopDownload;
}

// 用浏览器实际看到的文件判断下载是否完成，不能把空文件当作成功
function downloadReady(filename) {
    return fs.existsSync(filename) && fs.statSync(filename).size > 0;
}

// 下载完成事件由主进程提供，文件写入完成后才返回测试结果
async function exportDesktopFile(application, page, button, filename) {
    await application.evaluate(saveNextDownload, filename);
    await page.locator(button).click();
    assert.equal(await application.evaluate(completedDownload), "completed");
    assert.equal(downloadReady(filename), true);
}

// 记录脚本错误，桌面入口与页面错误都必须可见
function collectError(errors, error) {
    errors.push(error.message);
}

// 自动化期间模拟退出确认选择，让测试能检查取消和放弃两种结果
function setExitChoice(application, choice) {
    // 测试用命名函数替换系统对话框，返回指定按钮序号
    function chooseExit() {
        return choice;
    }
    application.dialog.showMessageBoxSync = chooseExit;
}

// 请求关闭主窗口，实际是否关闭仍由页面未保存检查决定
function closeMainWindow(application) {
    const windows = application.BrowserWindow.getAllWindows();
    for (const window of windows) {
        if (window.webContents.getURL().endsWith("/index.html")) {
            window.close();
            return;
        }
    }
}

// 统计桌面窗口数量，取消退出时主窗口应继续存在
function windowCount(application) {
    return application.BrowserWindow.getAllWindows().length;
}

// 异常时销毁测试窗口，避免未保存确认阻塞测试清理
function destroyTestWindows(application) {
    for (const window of application.BrowserWindow.getAllWindows()) {
        window.destroy();
    }
}

// 验证真实桌面进程的计算、持久存档、下载、资料窗口及未保存退出保护
async function main() {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "sdu-desktop-test-"));
    let application = null;
    try {
        application = await launchDesktop(temporary);
        const page = await application.firstWindow();
        const errors = [];
        page.on("pageerror", collectError.bind(null, errors));
        await page.waitForSelector(".chip-option");
        await page.context().setOffline(true);
        const desktop = await application.evaluate(inspectDesktop);
        assert.equal(desktop.version, APP_VERSION);
        assert.equal(desktop.dataPath, temporary);
        assert.equal(desktop.nodeIntegration, false);
        assert.equal(desktop.contextIsolation, true);
        assert.equal(desktop.sandbox, true);
        const renderer = await page.evaluate(inspectRenderer);
        assert.equal(renderer.requireType, "undefined");
        assert.equal(renderer.processType, "undefined");
        assert.equal(renderer.origin, DESKTOP_SETTINGS.scheme + "://" + DESKTOP_SETTINGS.host);
        const releaseHtml = "<h2>更新内容</h2><ul><li>新增 <strong>RAM</strong></li><li>修复 &amp; 优化</li></ul><script>window.releaseExecuted = true</script><img src='https://example.invalid/image.png'>";
        const releaseText = await page.evaluate(plainReleaseNotes, releaseHtml);
        assert.equal(releaseText, "更新内容\n新增 RAM\n修复 & 优化");
        assert.equal(await page.evaluate(releaseScriptExecuted), false);
        assert.equal(await page.locator("#binary-result").textContent(), "000 0000");
        await page.locator("[data-bit='0']").click();
        await page.locator("#pulse-negative").click();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0001");
        await page.locator("#save-project").click();
        const exported = path.join(temporary, "desktop-circuit.json");
        await exportDesktopFile(application, page, "#export-project", exported);
        const project = JSON.parse(fs.readFileSync(exported, "utf8"));
        assert.equal(project.switches[0], 1);
        assert.equal(project.chips.length, 5);

        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramReady);
        assert.ok(await page.locator(".logic-wire").count() > 30);
        const diagram = path.join(temporary, "desktop-logic.svg");
        await exportDesktopFile(application, page, "#logic-export", diagram);
        assert.match(fs.readFileSync(diagram, "utf8"), /viewBox=/);
        await page.locator("#close-logic-diagram").click();

        const referenceWaiting = application.waitForEvent("window");
        await page.locator(".library-footer a").click();
        const reference = await referenceWaiting;
        await reference.waitForLoadState("load");
        assert.match(reference.url(), /assets\/reference-board\.jpg$/);
        await reference.close();
        assert.equal(await application.evaluate(windowCount), 1);
        await page.locator("#save-project").click();
        await application.close();
        application = null;

        // 重新启动同一存档目录，输入保留，标准示例自动清零而非恢复未知状态
        application = await launchDesktop(temporary);
        const restored = await application.firstWindow();
        await restored.waitForSelector(".chip-option");
        assert.equal(await restored.locator("[data-bit='0']").getAttribute("aria-pressed"), "true");
        assert.equal(await restored.locator("#binary-result").textContent(), "000 0000");
        await restored.waitForFunction(routingReady);
        await restored.locator("#pulse-negative").click();
        assert.equal(await restored.locator("#binary-result").textContent(), "000 0001");
        await application.evaluate(setExitChoice, 0);
        await application.evaluate(closeMainWindow);
        assert.equal(await application.evaluate(windowCount), 1);
        await application.evaluate(setExitChoice, 1);
        const closed = application.waitForEvent("close");
        await application.evaluate(closeMainWindow);
        await closed;
        application = null;
        assert.deepEqual(errors, []);
        console.log("桌面验证通过：独立窗口、隔离权限、断网计算、跨启动存档、JSON及SVG导出、资料窗口、未保存退出确认");
    } finally {
        if (application) {
            await application.evaluate(destroyTestWindows);
            await application.close();
        }
        removeTestDirectory(temporary);
    }
}

// 发布说明只转为文本，不允许其中的脚本进入实验页面执行
function releaseScriptExecuted() {
    return window.releaseExecuted === true;
}

await main();
