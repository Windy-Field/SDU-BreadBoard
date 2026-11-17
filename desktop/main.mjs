import { app, BrowserWindow, Menu, dialog, shell, protocol, net } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DESKTOP_SETTINGS } from "./settings.mjs";
import { startUpdates, UPDATE_SETTINGS } from "./updates.mjs";
import { updateDialogDetail, selectReleaseNotes, plainReleaseNotes } from "./release-notes.mjs";
import { loadDesktopPage } from "./window-load.mjs";

// 桌面程序与网页入口保持相同目录关系，安装后仍从应用内部读取资源
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_ORIGIN = DESKTOP_SETTINGS.scheme + "://" + DESKTOP_SETTINGS.host;
const ENTRY_URL = APP_ORIGIN + "/" + DESKTOP_SETTINGS.entry;
const ICON_PATH = path.join(PROJECT_ROOT, DESKTOP_SETTINGS.icon);
const ASSET_ROOT = path.join(PROJECT_ROOT, "assets");
let mainWindow = null;
let pendingUpdateInstall = null;
let updates = null;
let stopping = false;

// 把固定应用地址映射到包内文件，校验路径后返回真实文件名，升级不改变网页存储来源
function bundledPath(address) {
    const url = new URL(address);
    if (url.protocol !== DESKTOP_SETTINGS.scheme + ":" || url.host !== DESKTOP_SETTINGS.host) {
        return "";
    }
    const pathname = decodeURIComponent(url.pathname);
    const filename = path.resolve(PROJECT_ROOT, "." + pathname);
    const relative = path.relative(PROJECT_ROOT, filename);
    if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
        return "";
    }
    return filename;
}

// 通过 Electron 的文件读取接口提供应用资源，网页不启动本地服务器
function serveBundledFile(request) {
    try {
        const filename = bundledPath(request.url);
        if (filename !== "") {
            return net.fetch(pathToFileURL(filename).href);
        }
    } catch (error) {
        console.error(error);
    }
    return new Response("Not found", { status: 404 });
}

// 只允许读取应用自带的图片和 PDF，返回本地资源路径或空字符串
function localReferencePath(address) {
    try {
        const filename = bundledPath(address);
        if (filename === "") {
            return "";
        }
        const relative = path.relative(ASSET_ROOT, filename);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
            return "";
        }
        const extension = path.extname(filename).toLowerCase();
        if (![".png", ".jpg", ".jpeg", ".pdf"].includes(extension)) {
            return "";
        }
        return filename;
    } catch (error) {
        return "";
    }
}

// 外部网页交给默认浏览器，文件地址和其他协议不会交给系统执行
function openExternalReference(address) {
    try {
        const url = new URL(address);
        if (url.protocol === "https:" || url.protocol === "http:") {
            shell.openExternal(url.href).catch(reportDesktopError);
        }
    } catch (error) {
        reportDesktopError(error);
    }
}

// 资料链接在独立的只读窗口查看，不替换正在编辑的面包板页面
function openReference(address) {
    const filename = localReferencePath(address);
    if (filename === "") {
        openExternalReference(address);
        return;
    }
    const reference = new BrowserWindow({
        title: DESKTOP_SETTINGS.title + " · 资料",
        width: DESKTOP_SETTINGS.referenceWidth,
        height: DESKTOP_SETTINGS.referenceHeight,
        icon: ICON_PATH,
        parent: mainWindow,
        show: !app.commandLine.hasSwitch("test-desktop"),
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
    });
    reference.webContents.setWindowOpenHandler(denyNewWindow);
    reference.webContents.on("will-navigate", preventReferenceNavigation);
    loadDesktopPage(reference, address, reportDesktopError);
}

// 资料窗口不再打开子窗口，返回 Electron 规定的拒绝结果
function denyNewWindow() {
    return { action: "deny" };
}

// 阻止资料窗口跳转到其他页面，网页链接仍可在系统浏览器中查看
function preventReferenceNavigation(event, address) {
    event.preventDefault();
    openExternalReference(address);
}

// 拦截网页的新窗口请求，自带资料和外部网址分别由对应入口处理
function handleNewWindow(details) {
    openReference(details.url);
    return { action: "deny" };
}

// 主窗口只加载自己的入口，点击链接不能替换电路编辑器
function preventMainNavigation(event, address) {
    event.preventDefault();
    openReference(address);
}

// 网页有未保存内容时显示原生确认，用户选择离开后才允许关闭或刷新
function confirmUnsavedExit(event) {
    const choice = dialog.showMessageBoxSync(mainWindow, {
        type: "question",
        title: "实验尚未保存",
        message: "当前实验有未保存的更改，确定离开吗？",
        detail: "选择返回后，可以按 Ctrl+S 保存当前实验",
        buttons: ["返回实验", "放弃更改并离开"],
        defaultId: 0,
        cancelId: 0,
        noLink: true
    });
    if (choice === 1) {
        event.preventDefault();
    } else {
        pendingUpdateInstall = null;
    }
}

// JSON、PNG 和 SVG 导出沿用页面下载，通过原生保存窗口选择位置
function prepareDownload(event, item) {
    item.setSaveDialogOptions({
        title: "导出实验文件",
        defaultPath: path.join(app.getPath("downloads"), item.getFilename())
    });
}

// 桌面加载失败时显示可读错误，日志保留具体原因供排查
function reportDesktopError(error) {
    console.error(error);
    dialog.showErrorBox("SDU 面包板", "无法打开页面或资料：" + error.message);
}

// 主窗口关闭后释放引用，下次激活时可以创建新窗口
function clearMainWindow() {
    mainWindow = null;
    if (pendingUpdateInstall) {
        const install = pendingUpdateInstall;
        pendingUpdateInstall = null;
        install();
    }
}

// 更新检查的网络错误只写入日志，用户仍可继续离线使用
function logUpdateError(error) {
    console.warn("更新检查暂未完成：", error.message);
}

// 获取弹窗说明，接口不可用时用浏览器原生解析器整理更新库提供的备用正文
async function readUpdateDetail(version, introduction, releaseNotes) {
    // 延迟到网络失败后再整理备用说明，避免正常请求时额外操作主页面
    async function readFallback() {
        if (!mainWindow || mainWindow.isDestroyed()) {
            return "";
        }
        const source = selectReleaseNotes(version, releaseNotes);
        if (source === "") {
            return "";
        }
        const script = "(" + plainReleaseNotes.toString() + ")(" + JSON.stringify(source) + ")";
        return mainWindow.webContents.executeJavaScript(script);
    }
    return updateDialogDetail(version, introduction, UPDATE_SETTINGS, net.fetch, logUpdateError, readFallback);
}

// 免安装版发现新版本时提供发布页，用户可选择下载安装版以获得自动安装能力
async function offerPortableUpdate(version, address, releaseNotes) {
    if (!mainWindow) {
        return;
    }
    const introduction = "免安装版需手动替换程序，安装版支持自动下载和重启安装，实验存档会保留";
    const detail = await readUpdateDetail(version, introduction, releaseNotes);
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    const result = await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "发现新版本",
        message: "SDU 面包板 " + version + " 已发布",
        detail: detail,
        buttons: ["稍后", "打开下载页"],
        defaultId: 1,
        cancelId: 0
    });
    if (result.response === 1) {
        await shell.openExternal(address);
    }
}

// 提示更新已下载，关闭窗口前仍会经过原有未保存检查，取消离开则不启动安装器
async function offerUpdateInstall(version, install, releaseNotes) {
    if (!mainWindow) {
        return;
    }
    const introduction = "重启后安装更新，实验存档会保留；如有未保存内容，下一步可返回保存";
    const detail = await readUpdateDetail(version, introduction, releaseNotes);
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    const result = await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "更新已准备好",
        message: "SDU 面包板 " + version + " 已下载完成",
        detail: detail,
        buttons: ["稍后", "重启安装"],
        defaultId: 1,
        cancelId: 0
    });
    if (result.response === 1 && mainWindow) {
        pendingUpdateInstall = install;
        mainWindow.close();
    }
}

// 仅发行版开启网络更新，测试与开发入口不访问 GitHub
async function initializeUpdates() {
    if (!app.isPackaged || app.commandLine.hasSwitch("test-desktop")) {
        return;
    }
    const updaterModule = await import("electron-updater");
    if (stopping) {
        return;
    }
    const updaterPackage = updaterModule.default;
    updates = startUpdates(updaterPackage.autoUpdater, {
        portable: Boolean(process.env.PORTABLE_EXECUTABLE_FILE),
        log: logUpdateError,
        offerPortable: offerPortableUpdate,
        offerInstall: offerUpdateInstall,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
    });
}

// 最后退出时停止更新定时器，不留下后台检查任务
function stopDesktopUpdates() {
    stopping = true;
    if (updates) {
        updates.stop();
        updates = null;
    }
}

// 页面已完成首次加载后再准备更新库，网络检查仍按原配置延迟执行
function prepareUpdates() {
    initializeUpdates().catch(logUpdateError);
}

// 创建独立桌面窗口，网页只能访问浏览器能力，不直接访问 Node.js 或系统接口
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: DESKTOP_SETTINGS.title,
        width: DESKTOP_SETTINGS.width,
        height: DESKTOP_SETTINGS.height,
        minWidth: DESKTOP_SETTINGS.minimumWidth,
        minHeight: DESKTOP_SETTINGS.minimumHeight,
        icon: ICON_PATH,
        backgroundColor: DESKTOP_SETTINGS.backgroundColor,
        show: !app.commandLine.hasSwitch("test-desktop"),
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
    });
    mainWindow.webContents.setWindowOpenHandler(handleNewWindow);
    mainWindow.webContents.on("will-navigate", preventMainNavigation);
    mainWindow.webContents.on("will-prevent-unload", confirmUnsavedExit);
    mainWindow.webContents.once("did-finish-load", prepareUpdates);
    mainWindow.on("closed", clearMainWindow);
    loadDesktopPage(mainWindow, ENTRY_URL, reportDesktopError);
}

// 再次启动时聚焦原窗口，避免两份窗口同时覆盖本地实验列表
function focusMainWindow() {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
    }
}

// 应用激活且没有窗口时重新打开，供系统任务栏入口使用
function activateApplication() {
    if (!mainWindow) {
        createMainWindow();
    }
}

// Windows 关闭最后一个窗口后退出，不留下后台进程
function quitAfterWindowsClosed() {
    if (pendingUpdateInstall) {
        return;
    }
    app.quit();
}

// 所有窗口共享固定存档目录，移动或升级程序不会更换实验存储位置
function startDesktop() {
    Menu.setApplicationMenu(null);
    protocol.handle(DESKTOP_SETTINGS.scheme, serveBundledFile);
    createMainWindow();
    mainWindow.webContents.session.on("will-download", prepareDownload);
    app.on("activate", activateApplication);
    app.on("window-all-closed", quitAfterWindowsClosed);
    app.on("will-quit", stopDesktopUpdates);
}

app.setName(DESKTOP_SETTINGS.name);
protocol.registerSchemesAsPrivileged([{
    scheme: DESKTOP_SETTINGS.scheme,
    privileges: { standard: true, secure: true, supportFetchAPI: true }
}]);
let dataPath = path.join(app.getPath("appData"), DESKTOP_SETTINGS.dataFolder);
const requestedDataPath = app.commandLine.getSwitchValue("user-data-dir");
if (requestedDataPath !== "") {
    dataPath = path.resolve(requestedDataPath);
}
app.setPath("userData", dataPath);
if (app.requestSingleInstanceLock()) {
    app.on("second-instance", focusMainWindow);
    const ready = app.whenReady();
    const starting = ready.then(startDesktop);
    starting.catch(reportDesktopError);
} else {
    app.quit();
}
