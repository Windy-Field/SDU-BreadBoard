const electron = require("electron");
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;

// 页面只能请求系统选择位置，不能指定任意写入路径
function chooseExport(kind) {
    return ipcRenderer.invoke("choose-export", kind);
}

// 保存时交还本次选择的凭证和文件内容，最终路径留在主进程
function writeExport(ticket, content) {
    return ipcRenderer.invoke("write-export", ticket, content);
}

// 编码失败时放弃本次保存位置，避免留下可再次使用的凭证
function discardExport(ticket) {
    return ipcRenderer.invoke("discard-export", ticket);
}

contextBridge.exposeInMainWorld("breadboardExport", {
    choose: chooseExport, write: writeExport, discard: discardExport
});

// 获取桌面和本机网页共用的工作区及其修订号
function readWorkspace() {
    return ipcRenderer.invoke("read-shared-workspace");
}

// 将编辑后的工作区连同读取时的修订号送到主进程
function writeWorkspace(change) {
    return ipcRenderer.invoke("write-shared-workspace", change);
}

// 使用系统默认浏览器打开本机共享工作区
function openSharedWeb() {
    return ipcRenderer.invoke("open-shared-workbench");
}

// 读取个人构建附带的初始工作区，普通发行包返回空值
function readSnapshot() {
    return ipcRenderer.invoke("read-workspace-snapshot");
}

contextBridge.exposeInMainWorld("breadboardWorkspace", {
    read: readWorkspace, write: writeWorkspace, openWeb: openSharedWeb, readSnapshot: readSnapshot
});
