import { svgElement, SVG_NAMESPACE } from "./dom.mjs";
import { copyStyledSvg, createExportPalette, encodeSvgImage, exportPaint } from "./image-export.mjs";

// 导出的标签列比侧栏宽，留出完整信号名和高低电平刻度的位置
const SHEET = { margin: 12, titleHeight: 28, axisHeight: 24, footerHeight: 24, labelWidth: 168, minWidth: 376 };

// 用双引号保护含逗号、换行或引号的 CSV 字段
function csvRow(values) {
    const fields = [];
    for (const value of values) {
        const text = String(value);
        if (/[",\r\n]/.test(text)) {
            const escaped = text.replaceAll('"', '""');
            fields.push('"' + escaped + '"');
        } else {
            fields.push(text);
        }
    }
    return fields.join(",");
}

// 每一行保存一个事件的电平快照，零号事件是录制前的初始值
function createTimingCsv(trace) {
    const headers = ["事件序号", "操作"];
    for (const signal of trace.signals) {
        headers.push(signal.label);
    }
    const rows = [csvRow(headers)];
    for (let index = 0; index < trace.samples.length; index = index + 1) {
        const sample = trace.samples[index];
        const row = [index, sample.action];
        for (const signal of trace.signals) {
            row.push(sample.values[signal.endpoint]);
        }
        rows.push(csvRow(row));
    }
    // UTF-8 文件头让 Windows 上的 Excel 也能直接识别中文
    const content = rows.join("\r\n") + "\r\n";
    return new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
}

// 读取文字和分隔线使用的主题颜色，转成独立图片可识别的普通颜色
function sheetStyle(lanes, palette) {
    const style = getComputedStyle(lanes);
    const firstLane = lanes.firstElementChild;
    const grid = firstLane.querySelector(".timing-wave-grid");
    const gridStyle = getComputedStyle(grid);
    return {
        ink: exportPaint(palette, style.getPropertyValue("--color-ink").trim()),
        background: exportPaint(palette, style.getPropertyValue("--color-surface").trim()),
        divider: exportPaint(palette, gridStyle.stroke),
        font: style.getPropertyValue("--font-mono").trim()
    };
}

// 将已有波形或刻度放在图纸坐标中，保留其线型而不复制网页交互
function placeSvg(sheet, source, horizontal, vertical, palette) {
    const copy = copyStyledSvg(source, palette);
    copy.setAttribute("x", String(horizontal));
    copy.setAttribute("y", String(vertical));
    const selection = copy.querySelector(".timing-wave-selected");
    if (selection) {
        selection.remove();
    }
    sheet.append(copy);
}

// 把每路信号的完整名称、固定刻度和波形放在同一行
function drawSheetLanes(sheet, lanes, trace, size, palette, style) {
    const bodyTop = SHEET.margin + SHEET.titleHeight + SHEET.axisHeight;
    for (let index = 0; index < trace.signals.length; index = index + 1) {
        const lane = lanes.children[index];
        const top = bodyTop + index * size.rowHeight;
        const middle = top + size.rowHeight / 2;
        const wave = lane.querySelector(":scope > svg");
        const levelScale = lane.querySelector(".timing-level-scale");
        const scaleWidth = Number(levelScale.getAttribute("width"));
        svgElement(sheet, "text", {
            x: SHEET.margin, y: middle, "dominant-baseline": "central", "font-size": 11
        }, trace.signals[index].label);
        placeSvg(sheet, levelScale, size.waveStart - scaleWidth, top, palette);
        placeSvg(sheet, wave, size.waveStart, top, palette);
        const rowEnd = top + size.rowHeight;
        svgElement(sheet, "line", {
            x1: SHEET.margin, y1: rowEnd, x2: size.waveEnd, y2: rowEnd, stroke: style.divider
        });
    }
}

// 生成独立图纸，宽度来自完整波形，不读取滚动位置或窗口宽度
function buildTimingSheet(lanes, trace) {
    const firstWave = lanes.querySelector(".timing-lane > svg");
    const waveWidth = Number(firstWave.getAttribute("width"));
    const rowHeight = Number(firstWave.getAttribute("height"));
    const waveStart = SHEET.margin + SHEET.labelWidth;
    const waveEnd = waveStart + waveWidth;
    const width = Math.max(SHEET.minWidth, waveEnd + SHEET.margin);
    const bodyTop = SHEET.margin + SHEET.titleHeight + SHEET.axisHeight;
    const bodyBottom = bodyTop + trace.signals.length * rowHeight;
    const height = bodyBottom + SHEET.footerHeight + SHEET.margin;
    const palette = createExportPalette();
    const style = sheetStyle(lanes, palette);
    const sheet = document.createElementNS(SVG_NAMESPACE, "svg");
    sheet.setAttribute("xmlns", SVG_NAMESPACE);
    sheet.setAttribute("width", String(width));
    sheet.setAttribute("height", String(height));
    sheet.setAttribute("viewBox", "0 0 " + width + " " + height);
    sheet.setAttribute("font-family", style.font);
    sheet.setAttribute("fill", style.ink);
    svgElement(sheet, "title", {}, "数字时序波形");
    svgElement(sheet, "rect", { width: width, height: height, fill: style.background });
    svgElement(sheet, "text", { x: SHEET.margin, y: SHEET.margin + 15, "font-size": 15, "font-weight": 600 }, "数字时序波形");
    const axisLabelHeight = bodyTop - 7;
    svgElement(sheet, "text", { x: SHEET.margin, y: axisLabelHeight, "font-size": 11 }, "事件序号（非实物时间）");
    const step = waveWidth / trace.samples.length;
    for (let index = 0; index < trace.samples.length; index = index + 1) {
        const center = waveStart + (index + 0.5) * step;
        svgElement(sheet, "text", { x: center, y: axisLabelHeight, "font-size": 11, "text-anchor": "middle" }, String(index));
    }
    const size = { rowHeight: rowHeight, waveStart: waveStart, waveEnd: waveEnd };
    drawSheetLanes(sheet, lanes, trace, size, palette, style);
    svgElement(sheet, "line", { x1: SHEET.margin, y1: bodyTop, x2: waveEnd, y2: bodyTop, stroke: style.divider });
    svgElement(sheet, "line", { x1: waveStart, y1: bodyTop, x2: waveStart, y2: bodyBottom, stroke: style.divider });
    svgElement(sheet, "text", { x: SHEET.margin, y: bodyBottom + 19, "font-size": 11 }, "0 低电平 · 1 高电平 · X 未知 · Z 高阻");
    return sheet;
}

// 根据所选格式导出本轮截至当前的完整记录，不改变录制和事件选择
export function encodeTimingTrace(lanes, trace, format) {
    if (trace.samples.length === 0) {
        throw new Error("尚未录制波形");
    }
    if (format === "csv") {
        return createTimingCsv(trace);
    }
    const sheet = buildTimingSheet(lanes, trace);
    return encodeSvgImage(sheet, format);
}
