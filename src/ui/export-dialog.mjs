import { downloadFile, element, node } from "./dom.mjs";
import { showToast } from "./toast.mjs";
import { EXPORT_FILES, EXPORT_FORMATS, exportFormatForName } from "../../desktop/export-formats.mjs";

let pendingExport = null;
let saving = false;

// 浏览器没有系统选择器时才显示网页格式弹窗
function openDownloadDialog(file, createFile) {
    const dialog = element("export-dialog");
    if (dialog.open) {
        return;
    }
    element("export-title").textContent = file.title;
    const picker = element("export-format");
    picker.replaceChildren();
    for (const format of file.formats) {
        const option = node("option", format.toUpperCase(), "");
        option.value = format;
        picker.append(option);
    }
    pendingExport = { file: file, createFile: createFile };
    dialog.showModal();
}

// 放弃本次导出，关闭弹窗后焦点由浏览器还给原按钮
function cancelExport() {
    pendingExport = null;
    element("export-dialog").close();
}

// 生成指定格式并交给浏览器下载，关闭网页弹窗后才开始编码
async function downloadExport(file, format, createFile) {
    const blob = await createFile(format);
    downloadFile(blob, file.name + "." + format);
}

// 桌面主进程只接收文件内容，不把用户选中的真实路径交给页面
async function saveDesktopExport(bridge, kind, createFile) {
    const selected = await bridge.choose(kind);
    if (!selected) {
        return;
    }
    let content;
    try {
        const blob = await createFile(selected.format);
        content = await blob.arrayBuffer();
    } catch (error) {
        await bridge.discard(selected.ticket);
        throw error;
    }
    await bridge.write(selected.ticket, content);
}

// 为浏览器系统保存选择器列出可写入的格式，扩展名必须带点
function browserFileTypes(formats) {
    const types = [];
    for (const format of formats) {
        const entry = EXPORT_FORMATS[format];
        const extensions = [];
        for (const extension of entry.extensions) {
            extensions.push("." + extension);
        }
        const accept = {};
        accept[entry.mime] = extensions;
        types.push({ description: entry.label, accept: accept });
    }
    return types;
}

// 支持文件选择器的浏览器直接打开系统窗口，再按最终扩展名生成文件
async function saveBrowserExport(file, createFile) {
    const defaultFormat = file.formats[0];
    let handle;
    try {
        handle = await window.showSaveFilePicker({
            suggestedName: file.name + "." + defaultFormat,
            types: browserFileTypes(file.formats),
            excludeAcceptAllOption: true
        });
    } catch (error) {
        if (error.name === "SecurityError") {
            return false;
        }
        throw error;
    }
    const format = exportFormatForName(handle.name, file.formats);
    if (!format) {
        throw new Error("文件扩展名与支持的格式不匹配");
    }
    const content = await createFile(format);
    const output = await handle.createWritable();
    await output.write(content);
    await output.close();
    return true;
}

// 逻辑图在模态窗口内，失败消息也放在该窗口内，避免被遮挡
function reportExportError(error) {
    const message = "导出失败：" + error.message;
    if (element("logic-diagram-dialog").open) {
        const notice = element("logic-export-error");
        notice.textContent = message;
        notice.hidden = false;
    } else {
        showToast(message, "error");
    }
}

// 记录一次用户触发的导出，优先使用系统窗口，取消时不编码也不写入
async function requestExport(kind, createFile) {
    if (saving) {
        return;
    }
    const file = EXPORT_FILES[kind];
    const bridge = window.breadboardExport;
    saving = true;
    element("logic-export-error").hidden = true;
    try {
        if (bridge) {
            await saveDesktopExport(bridge, kind, createFile);
        } else if (typeof window.showSaveFilePicker === "function") {
            const supported = await saveBrowserExport(file, createFile);
            if (!supported) {
                openDownloadDialog(file, createFile);
            }
        } else {
            openDownloadDialog(file, createFile);
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            reportExportError(error);
        }
    } finally {
        saving = false;
    }
}

// 提交网页版的备用格式弹窗，确认之后才生成文件
async function confirmExport(event) {
    event.preventDefault();
    const request = pendingExport;
    const format = element("export-format").value;
    cancelExport();
    if (request && request.file.formats.includes(format)) {
        try {
            await downloadExport(request.file, format, request.createFile);
        } catch (error) {
            reportExportError(error);
        }
    }
}

// 绑定共享弹窗，取消按钮和 Escape 都不生成文件
export function bindExportDialog() {
    element("export-form").addEventListener("submit", confirmExport);
    element("export-cancel").addEventListener("click", cancelExport);
    element("export-dialog").addEventListener("cancel", cancelExport);
}

// 为导出按钮登记文件类型及内容生成函数，格式和文件名由共享配置提供
export function bindFileExport(buttonId, kind, createFile) {
    const button = element(buttonId);
    const open = requestExport.bind(null, kind, createFile);
    button.addEventListener("click", open);
}
