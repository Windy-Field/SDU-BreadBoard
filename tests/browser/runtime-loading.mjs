import { chromium } from "playwright";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

// 记录运行错误，不把缺失引擎造成的错误隐藏
function recordError(errors, error) {
    errors.push(error.message);
}

// 返回本地引擎是否已经执行，首屏不应提前初始化重型依赖
function loadedRuntimes() {
    return {
        layout: typeof window.ELK === "function",
        routing: typeof window.BreadboardRouting !== "undefined"
    };
}

// 图纸成功或失败均解除等待状态，测试继续检查具体结果
function diagramFinished() {
    return document.getElementById("logic-diagram-dialog").getAttribute("aria-busy") === "false";
}

// 等待异步接线结束，确保测试读到的是新接线而不是旧画面
function wireAdded() {
    return document.getElementById("wire-count").textContent === "62";
}

// 模拟第一次本地脚本加载失败，file协议不能依赖网络路由拦截
function failNextLayoutLoad() {
    const append = document.head.append;
    // 仅拦截布局库的一次追加，其他页面行为沿用浏览器原方法
    function appendWithFailure(script) {
        if (script.src.endsWith("/vendor/elk.bundled.js")) {
            document.head.append = append;
            // 让加载任务登记完成后再报告失败，顺序与浏览器事件保持一致
            function failLoading() {
                script.dispatchEvent(new Event("error"));
            }
            window.setTimeout(failLoading, 0);
            return;
        }
        append.call(document.head, script);
    }
    document.head.append = appendWithFailure;
}

// 验证离线按需加载、首次失败重试、布线与图纸相互独立
async function main() {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", recordError.bind(null, errors));
    try {
        await page.context().setOffline(true);
        const url = pathToFileURL(path.join(ROOT, "index.html"));
        await page.goto(url.href);
        await page.waitForSelector(".chip-option");
        assert.deepEqual(await page.evaluate(loadedRuntimes), { layout: false, routing: false });
        await page.evaluate(failNextLayoutLoad);
        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramFinished);
        assert.match(await page.locator("#logic-diagram-summary").textContent(), /生成失败/);
        await page.locator("#close-logic-diagram").click();
        await page.locator("#view-logic-diagram").click();
        await page.waitForFunction(diagramFinished);
        assert.ok(await page.locator(".logic-component").count() > 0);
        assert.deepEqual(await page.evaluate(loadedRuntimes), { layout: true, routing: false });
        await page.locator("#close-logic-diagram").click();
        await page.locator("#from-endpoint").fill("B0:A:1");
        await page.locator("#to-endpoint").fill("B0:A:2");
        await page.locator("#connect-endpoints").click();
        await page.waitForFunction(wireAdded);
        assert.deepEqual(await page.evaluate(loadedRuntimes), { layout: true, routing: true });
        await page.locator("#undo").click();
        assert.equal(await page.locator("#wire-count").textContent(), "61");
        assert.deepEqual(errors, []);
        await page.locator("#save-project").click();
        console.log("引擎加载通过：首屏不加载、布局失败可重试、离线布局及接线均正常");
    } finally {
        await browser.close();
    }
}

await main();
