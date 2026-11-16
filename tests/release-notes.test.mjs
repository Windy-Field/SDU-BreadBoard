import test from "node:test";
import assert from "node:assert/strict";
import { readReleaseNotes, updateDialogDetail, selectReleaseNotes } from "../desktop/release-notes.mjs";
import { UPDATE_SETTINGS } from "../desktop/updates.mjs";

// 模拟GitHub纯文本接口，记录请求参数并允许修改同一个Release的说明
function releaseFixture() {
    const state = {
        release: { tag_name: "1.9.1", draft: false, prerelease: false, body_text: "新增实验\n修复输入问题" },
        requests: [],
        errors: [],
        status: 200,
        offline: false,
        invalidJson: false
    };
    // 每次读取当前说明，模拟发布者随后编辑GitHub中的正文
    async function readJson() {
        if (state.invalidJson) {
            throw new SyntaxError("invalid JSON");
        }
        return structuredClone(state.release);
    }
    // 网络由测试控制，不请求真实GitHub，也不触发下载或安装
    async function request(address, options) {
        state.requests.push({ address: address, options: options });
        if (state.offline) {
            throw new Error("offline");
        }
        return { ok: state.status === 200, status: state.status, json: readJson };
    }
    // 保存错误内容，核对说明读取失败仍能生成更新提示
    function log(error) {
        state.errors.push(error.message);
    }
    return { state: state, request: request, log: log };
}

// 请求绑定待更新版本，并要求GitHub提供纯文本正文而不是执行HTML
async function testReleaseRequest() {
    const fixture = releaseFixture();
    const notes = await readReleaseNotes("1.9.1", UPDATE_SETTINGS, fixture.request);
    assert.equal(notes, "新增实验\n修复输入问题");
    const request = fixture.state.requests[0];
    assert.equal(request.address, "https://api.github.com/repos/Windy-Field/SDU-BreadBoard/releases/tags/1.9.1");
    assert.equal(request.options.headers.Accept, "application/vnd.github.text+json");
    assert.equal(request.options.cache, "no-store");
    assert.equal(request.options.headers["Cache-Control"], "no-cache");
    assert.ok(request.options.signal instanceof AbortSignal);
}

// 发布者改写同一个Release后，下一次弹窗立即使用新正文，不缓存旧说明
async function testEditedRelease() {
    const fixture = releaseFixture();
    const first = await updateDialogDetail("1.9.1", "重启后安装更新", UPDATE_SETTINGS, fixture.request, fixture.log);
    assert.match(first, /新增实验/);
    fixture.state.release.body_text = "调整后的更新说明\n保留实验数据";
    const second = await updateDialogDetail("1.9.1", "重启后安装更新", UPDATE_SETTINGS, fixture.request, fixture.log);
    assert.equal(second, "重启后安装更新\n\n本次更新\n调整后的更新说明\n保留实验数据");
    assert.equal(second.includes("新增实验"), false);
    assert.equal(fixture.state.requests.length, 2);
}

// 不匹配的版本、草稿和预发布不能作为正式更新说明展示
async function testReleaseMismatch() {
    for (const field of ["tag_name", "draft", "prerelease"]) {
        const fixture = releaseFixture();
        fixture.state.release[field] = true;
        if (field === "tag_name") {
            fixture.state.release[field] = "1.9.2";
        }
        const detail = await updateDialogDetail("1.9.1", "允许重启安装", UPDATE_SETTINGS, fixture.request, fixture.log);
        assert.match(detail, /允许重启安装/);
        assert.match(detail, /暂时无法读取更新说明/);
        assert.equal(detail.includes("新增实验"), false);
        assert.equal(fixture.state.errors.length, 1);
    }
}

// 断网、接口限流或返回非JSON时只降级说明，不阻塞更新提示
async function testRequestFailure() {
    for (const failure of ["offline", "status", "json", "empty-response"]) {
        const fixture = releaseFixture();
        if (failure === "offline") {
            fixture.state.offline = true;
        } else if (failure === "status") {
            fixture.state.status = 403;
        } else if (failure === "json") {
            fixture.state.invalidJson = true;
        } else {
            fixture.state.release = null;
        }
        const detail = await updateDialogDetail("1.9.1", "免安装版需手动替换", UPDATE_SETTINGS, fixture.request, fixture.log);
        assert.match(detail, /免安装版需手动替换/);
        assert.match(detail, /暂时无法读取更新说明/);
        assert.equal(fixture.state.errors.length, 1);
    }
}

// 空正文显示清楚的空状态，带v前缀的仓库仍按实际标签读取
async function testEmptyAndPrefixedRelease() {
    const fixture = releaseFixture();
    for (const empty of ["", " \n ", null]) {
        fixture.state.release.body_text = empty;
        assert.equal(await readReleaseNotes("1.9.1", UPDATE_SETTINGS, fixture.request), "此版本暂未填写更新说明");
    }
    const settings = Object.assign({}, UPDATE_SETTINGS);
    settings.vPrefixedTagName = true;
    fixture.state.release.tag_name = "v1.9.1";
    fixture.state.release.body_text = "带前缀的版本说明";
    assert.equal(await readReleaseNotes("1.9.1", settings, fixture.request), "带前缀的版本说明");
    const last = fixture.state.requests[fixture.state.requests.length - 1];
    assert.ok(last.address.endsWith("/tags/v1.9.1"));
}

test("更新说明按版本读取GitHub纯文本正文", testReleaseRequest);
test("编辑Release后下次弹窗使用修改后的说明", testEditedRelease);
test("更新说明拒绝其他版本、草稿和预发布", testReleaseMismatch);
test("更新说明获取失败保留原有安装与下载提示", testRequestFailure);
test("更新说明空状态与标签前缀兼容", testEmptyAndPrefixedRelease);

// 接口限流时仍显示本次更新检查携带的说明，并明确标明未能刷新
async function testFallbackNotes() {
    const fixture = releaseFixture();
    fixture.state.status = 403;
    // 模拟浏览器已经转换好的备用纯文本
    async function readFallback() {
        return "备用发布说明";
    }
    const detail = await updateDialogDetail("1.9.1", "重启安装", UPDATE_SETTINGS, fixture.request, fixture.log, readFallback);
    assert.match(detail, /备用发布说明/);
    assert.match(detail, /当前无法刷新/);
    assert.equal(fixture.state.errors.length, 1);
    // 窗口关闭或解析失败时，说明降级不会影响更新按钮
    async function failedFallback() {
        throw new Error("window closed");
    }
    const failed = await updateDialogDetail("1.9.1", "重启安装", UPDATE_SETTINGS, fixture.request, fixture.log, failedFallback);
    assert.match(failed, /重启安装/);
    assert.match(failed, /暂时无法读取更新说明/);
}

// 多版本说明仅取目标版本，不把其他Release正文混进当前弹窗
function testFallbackSelection() {
    const notes = [{ version: "1.9.2", note: "其他版本" }, { version: "1.9.1", note: "<p>目标版本</p>" }];
    assert.equal(selectReleaseNotes("1.9.1", notes), "<p>目标版本</p>");
    assert.equal(selectReleaseNotes("1.8.0", notes), "");
    assert.equal(selectReleaseNotes("1.9.1", "直接说明"), "直接说明");
    assert.equal(selectReleaseNotes("1.9.1", null), "");
}

test("更新说明接口限流时使用本次检查的备用正文", testFallbackNotes);
test("备用说明按版本选择且兼容更新库返回类型", testFallbackSelection);
