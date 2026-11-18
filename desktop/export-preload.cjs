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
