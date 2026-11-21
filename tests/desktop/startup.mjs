import { chromium } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { dismissStartupAnnouncement } from "../helpers/announcement.mjs";
import { SHARED_WORKSPACE } from "../../src/storage/workspace-settings.mjs";

// 可指定已安装程序或便携EXE，每次使用独立临时存档，不影响个人实验
const ROOT = process.cwd();
const EXECUTABLE = process.env.SDU_STARTUP_EXECUTABLE || path.join(ROOT, "node_modules", "electron", "dist", "electron.exe");
const RUNS = Number(process.env.SDU_STARTUP_RUNS || "3");
const START_TIMEOUT = 90000;
const POLL_INTERVAL = 100;
const REPORT_FILE = process.env.SDU_STARTUP_REPORT || path.join(ROOT, "reports", "startup.json");
const WORKSPACE_SNAPSHOT = process.env.SDU_STARTUP_WORKSPACE;

// 使用系统分配的空闲本地端口，减少与已运行程序冲突
async function availablePort() {
    const server = net.createServer();
    // 获取监听结果后立即释放，后续由本次桌面进程使用
    function listen(resolve, reject) {
        server.once("error", reject);
        // 监听成功后读取系统分配的端口
        function listening() {
            const port = server.address().port;
            // 关闭完成后才允许桌面启动监听
            function closed() {
                resolve(port);
            }
            server.close(closed);
        }
        server.listen(0, "127.0.0.1", listening);
    }
    return new Promise(listen);
}

// 轮询调试端口前短暂让出执行权，不阻塞Node事件循环
function pause(resolve) {
    setTimeout(resolve, POLL_INTERVAL);
}

// 等待便携外壳解压并启动真正的Electron进程，不能只测外壳启动时间
async function waitForBrowser(port, processState, started) {
    const address = "http://127.0.0.1:" + port;
    while (performance.now() - started < START_TIMEOUT) {
        if (processState.exited) {
            throw new Error("桌面程序在页面就绪前退出：" + processState.code);
        }
        try {
            const response = await fetch(address + "/json/version", { signal: AbortSignal.timeout(1000) });
            if (response.ok) {
                return await chromium.connectOverCDP(address);
            }
        } catch (error) {
            // 调试端口在解压结束前不存在，继续等待同一个进程
        }
        await new Promise(pause);
    }
    throw new Error("桌面启动超时");
}

// 只清理本次创建的临时存档目录，防止误删用户实验
function cleanDirectory(directory) {
    const target = path.resolve(directory);
    const prefix = path.resolve(os.tmpdir()) + path.sep;
    if (!target.startsWith(prefix) || !path.basename(target).startsWith("sdu-startup-test-")) {
        throw new Error("启动测试目录超出清理范围");
    }
    fs.rmSync(target, { recursive: true, force: true });
}

// 读取导航阶段耗时，分辨外壳等待与页面初始化的占比
function navigationTiming() {
    const navigation = performance.getEntriesByType("navigation")[0];
    return {
        domReady: navigation.domContentLoadedEventEnd,
        pageLoaded: navigation.loadEventEnd,
        resources: performance.getEntriesByType("resource").length
    };
}

// 测量从创建进程到输入和芯片库就绪，关闭时只处理本次测试进程
async function measureStartup() {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "sdu-startup-test-"));
    const port = await availablePort();
    const argumentsList = [];
    if (!process.env.SDU_STARTUP_EXECUTABLE) {
        argumentsList.push(ROOT);
    }
    argumentsList.push("--user-data-dir=" + directory, "--test-desktop", "--remote-debugging-port=" + port);
    const environment = Object.assign({}, process.env);
    delete environment.ELECTRON_RUN_AS_NODE;
    const started = performance.now();
    const child = spawn(EXECUTABLE, argumentsList, { env: environment, windowsHide: true, stdio: "ignore" });
    const state = { exited: false, code: null };
    // 跟踪真实外壳是否结束，不把异常退出当成就绪
    function exited(code) {
        state.exited = true;
        state.code = code;
    }
    child.once("exit", exited);
    let browser = null;
    try {
        browser = await waitForBrowser(port, state, started);
        const context = browser.contexts()[0];
        const page = context.pages()[0];
        await page.waitForSelector(".chip-option");
        await page.waitForSelector("#quick-switches button");
        const ready = Math.round(performance.now() - started);
        const navigation = await page.evaluate(navigationTiming);
        // 耗时记录后验证真实运算，避免把显示了窗口但无法操作的启动算作成功
        await dismissStartupAnnouncement(page);
        if (WORKSPACE_SNAPSHOT) {
            // 个人包应在新目录载入完整存档，实验状态以快照内容为准
            const expected = JSON.parse(fs.readFileSync(WORKSPACE_SNAPSHOT, "utf8"));
            const file = path.join(directory, SHARED_WORKSPACE.filename);
            const saved = JSON.parse(fs.readFileSync(file, "utf8"));
            assert.deepEqual(saved.workspace, expected);
            assert.equal(await page.locator("#experiment-picker").inputValue(), expected.activeId);
            return { ready: ready, navigation: navigation };
        }
        assert.equal(await page.locator("#binary-result").textContent(), "000 0000");
        await page.locator("[data-bit='0']").click();
        await page.locator("#pulse-negative").click();
        assert.equal(await page.locator("#binary-result").textContent(), "000 0001");
        await page.locator("#save-project").click();
        await page.close();
        return { ready: ready, navigation: navigation };
    } finally {
        if (browser) {
            await browser.close();
        }
        if (!state.exited) {
            // 精确结束本次外壳及子进程，避免便携解压目录仍被占用
            const cleanup = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
            // 等待清理命令结束再移除临时目录
            function waitCleanup(resolve) {
                cleanup.once("exit", resolve);
            }
            await new Promise(waitCleanup);
        }
        cleanDirectory(directory);
    }
}

// 输出多次启动的中位数，报告保存为JSON，便于优化前后比较
async function main() {
    if (!fs.existsSync(EXECUTABLE)) {
        throw new Error("找不到启动测试程序：" + EXECUTABLE);
    }
    if (!Number.isInteger(RUNS) || RUNS < 1) {
        throw new Error("启动测试次数必须为正整数");
    }
    const results = [];
    for (let run = 0; run < RUNS; run = run + 1) {
        const result = await measureStartup();
        results.push(result);
        console.log("启动 " + (run + 1) + "：" + result.ready + "ms");
    }
    const times = [];
    for (const result of results) {
        times.push(result.ready);
    }
    // 普通数字比较避免把毫秒数字按字符串排序
    function compareNumbers(first, second) {
        return first - second;
    }
    times.sort(compareNumbers);
    const middle = Math.floor(times.length / 2);
    const report = { executable: EXECUTABLE, median: times[middle], results: results };
    fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log("启动中位数：" + report.median + "ms");
}

await main();
