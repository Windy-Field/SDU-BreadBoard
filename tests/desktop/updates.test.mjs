import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { startUpdates, UPDATE_SETTINGS } from "../../desktop/updates.mjs";

// 创建可控制的更新器与定时器，测试不下载文件、不启动安装器，也不访问网络
function updateFixture(portable) {
    const updater = new EventEmitter();
    const state = { checks: 0, installs: 0, errors: [], portableOffers: [], install: null, timers: [], removed: [] };
    // 记录配置，确认版本来自指定的公开仓库
    function setFeedURL(feed) {
        state.feed = feed;
    }
    // 模拟更新检查，每次调用只记录一次，结果由测试控制
    async function checkForUpdates() {
        state.checks = state.checks + 1;
        if (state.failure) {
            throw new Error("offline");
        }
    }
    // 只有确认安装后才能触发，检查期间不安装
    function quitAndInstall() {
        state.installs = state.installs + 1;
    }
    // 捕获定时回调，测试直接推进，不等待真实的一小时
    function setTimer(callback, delay) {
        state.timers.push({ callback: callback, delay: delay });
        return state.timers.length;
    }
    // 清理时记录定时器编号，确认退出后不再检查
    function clearTimer(identifier) {
        state.removed.push(identifier);
    }
    // 网络错误仅记录，不弹出阻塞对话框
    function logError(error) {
        state.errors.push(error.message);
    }
    // 免安装版只提供下载入口，不调用安装接口
    async function offerPortable(version, address, releaseNotes) {
        state.portableOffers.push({ version: version, address: address, releaseNotes: releaseNotes });
    }
    // 保存安装回调，模拟用户先选择稍后再手动确认
    async function offerInstall(version, install, releaseNotes) {
        state.version = version;
        state.install = install;
        state.releaseNotes = releaseNotes;
    }
    updater.setFeedURL = setFeedURL;
    updater.checkForUpdates = checkForUpdates;
    updater.quitAndInstall = quitAndInstall;
    const controller = startUpdates(updater, {
        portable: portable,
        log: logError,
        offerPortable: offerPortable,
        offerInstall: offerInstall,
        setTimeout: setTimer,
        clearTimeout: clearTimer,
        setInterval: setTimer,
        clearInterval: clearTimer
    });
    return { updater: updater, state: state, controller: controller };
}

// 标准安装版后台下载，下载期间不重复检查，只有用户确认才执行安装
async function testInstalledUpdates() {
    const fixture = updateFixture(false);
    const state = fixture.state;
    assert.equal(fixture.updater.autoDownload, true);
    assert.equal(fixture.updater.autoInstallOnAppQuit, false);
    assert.equal(state.feed.repo, "SDU-BreadBoard");
    assert.equal(state.timers[0].delay, UPDATE_SETTINGS.startupDelay);
    assert.equal(state.timers[1].delay, UPDATE_SETTINGS.interval);
    await state.timers[0].callback();
    fixture.updater.emit("update-available", { version: "9.0.0" });
    await state.timers[1].callback();
    assert.equal(state.checks, 1);
    fixture.updater.emit("update-downloaded", { version: "9.0.0", releaseNotes: "<p>新增实验</p>" });
    assert.equal(state.installs, 0);
    assert.equal(state.version, "9.0.0");
    assert.equal(state.releaseNotes, "<p>新增实验</p>");
    state.install();
    assert.equal(state.installs, 1);
    fixture.controller.stop();
    assert.equal(state.removed.length, 2);
    assert.equal(fixture.updater.listenerCount("update-available"), 0);
    await state.timers[1].callback();
    assert.equal(state.checks, 1);
}

// 离线失败后下次仍可重试，免安装版不下载或安装，也不重复提示同一版本
async function testPortableAndRetry() {
    const fixture = updateFixture(true);
    const state = fixture.state;
    assert.equal(fixture.updater.autoDownload, false);
    state.failure = true;
    await state.timers[0].callback();
    assert.deepEqual(state.errors, ["offline"]);
    state.failure = false;
    await state.timers[1].callback();
    assert.equal(state.checks, 2);
    fixture.updater.emit("update-available", { version: "9.0.0", releaseNotes: "<p>免安装版更新</p>" });
    fixture.updater.emit("update-available", { version: "9.0.0" });
    assert.equal(state.portableOffers.length, 1);
    assert.equal(state.portableOffers[0].releaseNotes, "<p>免安装版更新</p>");
    assert.equal(state.installs, 0);
    fixture.controller.stop();
}

test("安装版更新下载、确认安装及退出清理", testInstalledUpdates);
test("免安装提示去重及离线检查重试", testPortableAndRetry);
