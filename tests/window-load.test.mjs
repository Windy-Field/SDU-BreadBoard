import test from "node:test";
import assert from "node:assert/strict";
import { loadDesktopPage } from "../desktop/window-load.mjs";

// 模拟延迟结束的页面加载，供测试精确控制失败与窗口关闭的先后顺序
function loadingFixture() {
    const state = { destroyed: false, contentsDestroyed: false, errors: [], reject: null };
    // 返回尚未完成的加载任务，失败由测试触发
    function loadURL() {
        // 保存失败入口，不访问网络或真实桌面窗口
        function prepareLoading(resolve, reject) {
            state.reject = reject;
        }
        return new Promise(prepareLoading);
    }
    // 模拟窗口销毁状态，与 Electron 的查询方法保持一致
    function isDestroyed() {
        return state.destroyed;
    }
    // 独立记录页面对象状态，窗口尚未销毁时页面也可能已结束
    function contentsDestroyed() {
        return state.contentsDestroyed;
    }
    // 捕获真实加载失败的提示，便于检查是否被错误隐藏
    function reportError(error) {
        state.errors.push(error.message);
    }
    const window = { loadURL: loadURL, isDestroyed: isDestroyed, webContents: { isDestroyed: contentsDestroyed } };
    return { state: state, window: window, reportError: reportError };
}

// 窗口仍存在时的 ERR_FAILED 必须继续报告，不能把所有加载错误都忽略
async function testLiveWindowFailure() {
    const fixture = loadingFixture();
    const loading = loadDesktopPage(fixture.window, "breadboard://app/index.html", fixture.reportError);
    fixture.state.reject(new Error("ERR_FAILED (-2) loading breadboard://app/index.html"));
    await loading;
    assert.equal(fixture.state.errors.length, 1);
}

// 加载未完成就关闭窗口时，同样的 ERR_FAILED 不应在退出后弹出误报
async function testClosedWindowFailure() {
    for (const closedPart of ["destroyed", "contentsDestroyed"]) {
        const fixture = loadingFixture();
        const loading = loadDesktopPage(fixture.window, "breadboard://app/index.html", fixture.reportError);
        fixture.state[closedPart] = true;
        fixture.state.reject(new Error("ERR_FAILED (-2) loading breadboard://app/index.html"));
        await loading;
        assert.deepEqual(fixture.state.errors, []);
    }
}

test("仍存在的桌面窗口报告真实加载失败", testLiveWindowFailure);
test("关闭中的窗口不弹出加载中断误报", testClosedWindowFailure);
