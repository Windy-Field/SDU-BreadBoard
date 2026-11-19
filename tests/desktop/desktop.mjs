import { _electron as electron } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import os from "node:os";
import path from "node:path";
import { DESKTOP_SETTINGS } from "../../desktop/settings.mjs";
import { APP_VERSION } from "../../src/version.mjs";
import { plainReleaseNotes } from "../../desktop/release-notes.mjs";
import { pngDimensions } from "../helpers/downloads.mjs";
import { dismissStartupAnnouncement } from "../helpers/announcement.mjs";

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

// 在主进程替换系统窗口的人工选择，记录真实调用使用的标题与格式
function setSaveChoice(application, filename) {
    globalThis.desktopSaveOptions = null;
    // 空路径模拟取消，其他路径模拟系统返回的完整文件名
    function selectPath(window, options) {
        globalThis.desktopSaveOptions = options;
        globalThis.desktopSaveOwner = window.id;
        return { canceled: filename === "", filePath: filename };
    }
    application.dialog.showSaveDialog = selectPath;
}

// 返回主进程收到的保存窗口选项，核对它确实附属于主窗口
function readSaveOptions(application) {
    const mainWindow = application.BrowserWindow.getAllWindows()[0];
    return { options: globalThis.desktopSaveOptions, owner: globalThis.desktopSaveOwner === mainWindow.id };
}

// 用浏览器实际看到的文件判断下载是否完成，不能把空文件当作成功
function downloadReady(filename) {
    return fs.existsSync(filename) && fs.statSync(filename).size > 0;
}

// 触发导出并等待真实文件写完，验证没有打开网页格式弹窗
async function exportDesktopFile(application, page, button, filename, extensions) {
    await application.evaluate(setSaveChoice, filename);
    await page.locator(button).click();
    const deadline = Date.now() + 10000;
    while (!downloadReady(filename) && Date.now() < deadline) {
        await delay(50);
    }
    assert.equal(downloadReady(filename), true);
    assert.equal(await page.locator("#export-dialog").isVisible(), false);
    const request = await application.evaluate(readSaveOptions);
    assert.equal(request.owner, true);
    const actual = [];
    for (const filter of request.options.filters) {
        actual.push(filter.extensions[0]);
    }
    assert.deepEqual(actual, extensions);
}

// 检查顶部电路和右上角接线图都直接使用系统保存选项，并按扩展名编码
async function testDesktopExports(application, page, directory) {
    const exported = path.join(directory, "desktop-circuit.json");
    await exportDesktopFile(application, page, "#export-project", exported, ["json", "png", "jpg"]);
    const project = JSON.parse(fs.readFileSync(exported, "utf8"));
    assert.equal(project.switches[0], 1);
    assert.equal(project.chips.length, 5);

    const circuitImage = path.join(directory, "desktop-circuit.PNG");
    await exportDesktopFile(application, page, "#export-project", circuitImage, ["json", "png", "jpg"]);
    const dimensions = pngDimensions(fs.readFileSync(circuitImage));
    const canvas = page.locator("#board-canvas");
    const width = Number(await canvas.getAttribute("width"));
    const height = Number(await canvas.getAttribute("height"));
    assert.deepEqual(dimensions, { width: width, height: height });

    const wiring = path.join(directory, "desktop-wiring.jpeg");
    await exportDesktopFile(application, page, "#export-image", wiring, ["png", "jpg"]);
    const jpeg = fs.readFileSync(wiring);
    assert.equal(jpeg.toString("hex", 0, 3), "ffd8ff");
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

// Electron 可能已处理退出确认，浏览器调试接口收到的是同一次确认的迟到通知
async function dismissDesktopDialog(dialog) {
    try {
        await dialog.dismiss();
    } catch (error) {
        if (dialog.type() !== "beforeunload" || !error.message.includes("No dialog is showing")) {
            throw error;
        }
    }
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
        await dismissStartupAnnouncement(page);
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
        await testDesktopExports(application, page, temporary);

        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramReady);
        assert.ok(await page.locator(".logic-wire").count() > 30);
        const diagram = path.join(temporary, "desktop-logic.svg");
        await exportDesktopFile(application, page, "#logic-export", diagram, ["svg", "png"]);
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
        assert.equal(await restored.locator("#announcement-dialog").isVisible(), false);
        assert.equal(await restored.locator("[data-bit='0']").getAttribute("aria-pressed"), "true");
        assert.equal(await restored.locator("#binary-result").textContent(), "000 0000");
        await restored.waitForFunction(routingReady);
        await restored.locator("#pulse-negative").click();
        assert.equal(await restored.locator("#binary-result").textContent(), "000 0001");
        // 脉冲不会写入存档，改一次输入才会触发未保存退出确认
        await restored.locator("[data-bit='0']").click();
        assert.equal(await restored.locator("#save-status").textContent(), "当前实验未保存");
        restored.on("dialog", dismissDesktopDialog);
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
