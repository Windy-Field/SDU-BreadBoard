import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { Arch, build, Platform } from "electron-builder";
import { validateWorkspace } from "../src/storage/workspace.mjs";
import { SHARED_WORKSPACE } from "../src/storage/workspace-settings.mjs";

// 带个人数据的安装程序和网页 ZIP 统一输出到独立目录
const PERSONAL_ROOT = "releases/personal";
const DESKTOP_CONFIG = "electron-builder.json";
const DESKTOP_TARGETS = ["nsis", "portable"];
const BROWSER_SEED_FILE = "workspace-seed.js";

// 校验浏览器导出的整份工作区，返回适合打包的 JSON 文本
function readSnapshot(filename) {
    if (!filename) {
        throw new Error("请传入「导出全部已保存实验」生成的 JSON 文件路径");
    }
    const content = fs.readFileSync(filename, "utf8");
    const workspace = validateWorkspace(JSON.parse(content.replace(/^\uFEFF/, "")));
    const envelope = JSON.stringify({ revision: randomUUID(), workspace: workspace });
    if (Buffer.byteLength(envelope) > SHARED_WORKSPACE.maxBytes) {
        throw new Error("这份工作区超出了共享存档的大小限制");
    }
    return JSON.stringify(workspace);
}

// 复用公开版的构建配置，只替换个人包的资源、文件名和输出目录
async function buildPersonalDesktop(output, snapshotFile) {
    const source = fs.readFileSync(DESKTOP_CONFIG, "utf8");
    const config = JSON.parse(source);
    config.directories.output = path.join(output, "desktop");
    config.extraResources = [{ from: snapshotFile, to: SHARED_WORKSPACE.snapshotFile }];
    config.nsis.artifactName = config.nsis.artifactName.replace("-Setup", "-Personal-Setup");
    config.portable.artifactName = config.portable.artifactName.replace("-Portable", "-Personal-Portable");
    const targets = Platform.WINDOWS.createTarget(DESKTOP_TARGETS, Arch.x64);
    await build({ targets: targets, config: config, publish: "never" });
}

// 用同一份快照生成三种个人包，并在结束时删除处理过的快照文件
async function main() {
    const snapshot = readSnapshot(process.argv[2]);
    fs.mkdirSync(PERSONAL_ROOT, { recursive: true });
    const output = fs.mkdtempSync(path.resolve(PERSONAL_ROOT, "snapshot-"));
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "sdu-personal-build-"));
    const desktopSnapshot = path.join(temporary, SHARED_WORKSPACE.snapshotFile);
    const browserSnapshot = path.join(temporary, BROWSER_SEED_FILE);
    try {
        fs.writeFileSync(desktopSnapshot, snapshot, "utf8");
        const source = "window.breadboardSnapshot = " + JSON.stringify(snapshot) + ";";
        fs.writeFileSync(browserSnapshot, source, "utf8");
        execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
        await buildPersonalDesktop(output, desktopSnapshot);
        execFileSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "scripts/package.ps1", "-OutputDirectory", output, "-SnapshotScript", browserSnapshot], { stdio: "inherit" });
        console.log("个人快照包已生成，包含私有存档，请自行保管：" + output);
    } finally {
        fs.rmSync(desktopSnapshot, { force: true });
        fs.rmSync(browserSnapshot, { force: true });
        fs.rmdirSync(temporary);
    }
}

await main();
