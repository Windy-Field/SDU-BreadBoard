import { app, dialog, ipcMain } from "electron";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { EXPORT_FILES, EXPORT_FORMATS, exportFormatForName } from "./export-formats.mjs";

// 最大位图受画布像素上限约束，给其 PNG 和其他格式留足空间
const MAX_EXPORT_BYTES = 96 * 1024 * 1024;

// 把当前图形支持的格式转换成 Windows 保存窗口的类型列表
function saveFilters(formats) {
    const filters = [];
    for (const format of formats) {
        const entry = EXPORT_FORMATS[format];
        filters.push({ name: entry.label, extensions: entry.extensions });
    }
    return filters;
}

// 注册原生导出接口，只接受来自主窗口入口页面的请求
export function bindNativeExport(getMainWindow, entryUrl) {
    let pending = null;
    let choosing = false;
    let pageVersion = 0;

    // 资料窗口、子框架和其他页面都不能请求保存文件
    function requireMainWindow(event) {
        const window = getMainWindow();
        if (!window || window.isDestroyed() || window.webContents !== event.sender) {
            throw new Error("只能从面包板主窗口导出");
        }
        const frame = event.senderFrame;
        if (!frame || frame !== window.webContents.mainFrame || frame.url !== entryUrl) {
            throw new Error("只能从面包板入口导出");
        }
        return window;
    }

    // 由系统窗口一次选择目录、名称和类型，返回编码格式及单次保存凭证
    async function chooseExport(event, kind) {
        const window = requireMainWindow(event);
        if (choosing || pending) {
            return null;
        }
        if (!Object.hasOwn(EXPORT_FILES, kind)) {
            throw new Error("不支持这种导出对象");
        }
        const file = EXPORT_FILES[kind];
        const requestVersion = pageVersion;
        choosing = true;
        try {
            const result = await dialog.showSaveDialog(window, {
                title: file.title,
                defaultPath: path.join(app.getPath("downloads"), file.name),
                filters: saveFilters(file.formats)
            });
            if (result.canceled || !result.filePath || requestVersion !== pageVersion) {
                return null;
            }
            requireMainWindow(event);
            const basename = path.basename(result.filePath);
            let filename = result.filePath;
            let format = exportFormatForName(basename, file.formats);
            if (!format && path.extname(basename) === "" && file.formats.length === 1) {
                format = file.formats[0];
                filename = filename + "." + format;
            }
            if (!format) {
                throw new Error("文件扩展名与支持的格式不匹配");
            }
            const ticket = randomUUID();
            pending = { ticket: ticket, filename: filename, sender: event.sender };
            return { ticket: ticket, format: format };
        } finally {
            choosing = false;
        }
    }

    // 只写入刚刚由系统窗口确认的位置，凭证在写入前即失效
    async function writeExport(event, ticket, content) {
        requireMainWindow(event);
        if (!pending || pending.ticket !== ticket || pending.sender !== event.sender) {
            throw new Error("本次导出的保存位置已失效");
        }
        const filename = pending.filename;
        pending = null;
        if (!(content instanceof ArrayBuffer) || content.byteLength === 0 || content.byteLength > MAX_EXPORT_BYTES) {
            throw new Error("导出文件大小不正确");
        }
        await writeFile(filename, Buffer.from(content));
    }

    // 页面编码失败时撤销尚未使用的凭证，不修改磁盘上的文件
    function discardExport(event, ticket) {
        requireMainWindow(event);
        if (pending && pending.ticket === ticket && pending.sender === event.sender) {
            pending = null;
        }
    }

    // 主窗口退出或重新载入后，不沿用上一个页面选中的位置
    function resetExport() {
        pending = null;
        pageVersion = pageVersion + 1;
    }

    ipcMain.handle("choose-export", chooseExport);
    ipcMain.handle("write-export", writeExport);
    ipcMain.handle("discard-export", discardExport);
    return resetExport;
}
