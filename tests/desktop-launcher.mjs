import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { APP_VERSION } from "../src/version.mjs";

// 实际压缩两个桌面程序可能需要数分钟，超时后明确报告失败
const BUILD_TIMEOUT = 600000;
const ROOT = process.cwd();
const LAUNCHER = path.join(ROOT, "package-desktop.cmd");

// 从项目外运行双击入口，核对退出状态和两个版本的实际产物
function testDesktopLauncher() {
    const source = fs.readFileSync(LAUNCHER, "utf8");
    const withoutWindowsNewlines = source.replaceAll("\r\n", "");
    assert.equal(withoutWindowsNewlines.includes("\n"), false, "Windows 打包入口必须使用 CRLF 换行");
    const environment = Object.assign({}, process.env);
    environment.SDU_DESKTOP_LAUNCHER = LAUNCHER;
    const started = Date.now();
    const result = spawnSync("cmd.exe", ["/d", "/c", "call \"%SDU_DESKTOP_LAUNCHER%\""], {
        cwd: os.tmpdir(),
        env: environment,
        input: "\r\n",
        encoding: "utf8",
        timeout: BUILD_TIMEOUT,
        windowsVerbatimArguments: true
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /桌面版打包完成/);
    assert.match(result.stdout, /Press any key|请按任意键/i);
    const output = path.join(ROOT, "releases", "desktop");
    const prefix = "SDU-BreadBoard-" + APP_VERSION;
    for (const name of [prefix + "-Setup-x64.exe", prefix + "-Portable-x64.exe", prefix + "-Setup-x64.exe.blockmap", "latest.yml"]) {
        const filename = path.join(output, name);
        const details = fs.statSync(filename);
        assert.ok(details.size > 0, "打包产物不能为空：" + name);
        assert.ok(details.mtimeMs >= started, "打包产物不是本次生成：" + name);
    }
    const manifest = fs.readFileSync(path.join(output, "latest.yml"), "utf8");
    assert.ok(manifest.includes("version: " + APP_VERSION));
    console.log("桌面打包入口通过：从项目外启动、成功提示和暂停、安装版、免安装版、更新清单及校验文件");
}

testDesktopLauncher();
