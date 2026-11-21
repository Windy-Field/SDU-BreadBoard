// 文件名、格式和类型由网页及桌面共用，存档格式与图片格式分别列出
export const EXPORT_FILES = {
    circuit: { title: "导出电路", name: "breadboard-circuit", formats: ["json", "png", "jpg"] },
    workspace: { title: "导出全部已保存实验", name: "breadboard-workspace", formats: ["json"] },
    board: { title: "导出接线图", name: "breadboard-wiring", formats: ["png", "jpg"] },
    logic: { title: "导出逻辑图", name: "breadboard-logic", formats: ["svg", "png"] },
    timing: { title: "导出波形", name: "breadboard-timing", formats: ["svg", "png", "csv"] }
};

export const EXPORT_FORMATS = {
    json: { label: "JSON 电路存档（可重新导入）", mime: "application/json", extensions: ["json"] },
    png: { label: "PNG 图片", mime: "image/png", extensions: ["png"] },
    jpg: { label: "JPEG 图片", mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
    svg: { label: "SVG 矢量图", mime: "image/svg+xml", extensions: ["svg"] },
    csv: { label: "CSV 时序数据", mime: "text/csv", extensions: ["csv"] }
};

// 由最终文件名确定实际编码格式，兼容大小写和 JPEG 的两种扩展名
export function exportFormatForName(filename, formats) {
    const extensionStart = filename.lastIndexOf(".") + 1;
    if (extensionStart > 0) {
        const extension = filename.slice(extensionStart).toLowerCase();
        for (const format of formats) {
            if (EXPORT_FORMATS[format].extensions.includes(extension)) {
                return format;
            }
        }
    }
    return "";
}
