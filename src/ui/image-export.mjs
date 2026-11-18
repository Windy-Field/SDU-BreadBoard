// 限制位图像素数，防止很大的逻辑图超过浏览器的画布容量
const RASTER = { scale: 2, maxSide: 16384, maxPixels: 16000000 };
const IMAGE_TYPES = { png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };
const JPG_QUALITY = 0.95;
const SVG_PROPERTIES = [
    "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
    "font-family", "font-size", "font-weight", "text-anchor", "dominant-baseline", "opacity", "paint-order"
];

// 把浏览器显示的颜色转成普通 RGB，避免旧版报告软件不识别页面的主题颜色
export function createExportPalette() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    return { context: context, colors: new Map() };
}

// 用一个像素读取颜色的 RGB 值，重复出现的颜色只转换一次
export function exportPaint(palette, color) {
    if (color === "none") {
        return color;
    }
    if (!palette.colors.has(color)) {
        const context = palette.context;
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        const channels = pixel[0] + ", " + pixel[1] + ", " + pixel[2];
        let paint = "rgb(" + channels + ")";
        if (pixel[3] === 0) {
            paint = "none";
        } else if (pixel[3] < 255) {
            const alpha = pixel[3] / 255;
            paint = "rgba(" + channels + ", " + alpha + ")";
        }
        palette.colors.set(color, paint);
    }
    return palette.colors.get(color);
}

// 复制一个图形节点的可见样式，不保留工作台里的键盘交互属性
function copyShapeStyle(source, copy, palette) {
    const style = getComputedStyle(source);
    for (const property of SVG_PROPERTIES) {
        let value = style.getPropertyValue(property);
        if (property === "fill" || property === "stroke") {
            if (value.toLowerCase() === "currentcolor") {
                value = style.color;
            }
            value = exportPaint(palette, value);
        }
        copy.setAttribute(property, value);
    }
    copy.removeAttribute("tabindex");
    copy.removeAttribute("role");
}

// 复制带有实际线色、字体和线型的 SVG，文件不依赖网页样式表
export function copyStyledSvg(source, palette) {
    const copy = source.cloneNode(true);
    copy.removeAttribute("style");
    copyShapeStyle(source, copy, palette);
    const originals = source.querySelectorAll("*");
    const copies = copy.querySelectorAll("*");
    for (let index = 0; index < originals.length; index = index + 1) {
        copyShapeStyle(originals[index], copies[index], palette);
    }
    return copy;
}

// 将 SVG 的完整画面绘制到位图，不使用页面可视区的尺寸或缩放比例
async function rasterizeSvg(file, width, height) {
    const areaScale = Math.sqrt(RASTER.maxPixels / (width * height));
    const sideScale = RASTER.maxSide / Math.max(width, height);
    const scale = Math.min(RASTER.scale, areaScale, sideScale);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const address = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = address;
        await image.decode();
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
    } finally {
        URL.revokeObjectURL(address);
    }
}

// 压缩画布，若浏览器不能生成请求的格式则报告失败
function encodeCanvas(canvas, type) {
    // toBlob 使用回调交付文件，把成功和失败传给等待导出的调用方
    function encode(resolve, reject) {
        // 浏览器可能以 PNG 回退，不能用其他扩展名下载该文件
        function receive(blob) {
            if (!blob || blob.type !== type) {
                reject(new Error("浏览器无法生成所选图片格式"));
                return;
            }
            resolve(blob);
        }
        canvas.toBlob(receive, type, JPG_QUALITY);
    }
    return new Promise(encode);
}

// 将画布编码为 PNG 或 JPG，JPG 的透明区域用白色填充
export async function encodeCanvasImage(canvas, format) {
    let source = canvas;
    if (format === "jpg") {
        source = document.createElement("canvas");
        source.width = canvas.width;
        source.height = canvas.height;
        const context = source.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, source.width, source.height);
        context.drawImage(canvas, 0, 0);
    }
    return encodeCanvas(source, IMAGE_TYPES[format]);
}

// 生成独立 SVG 文件，或把同一份图纸以完整画幅转换为 PNG
export async function encodeSvgImage(svg, format) {
    const serializer = new XMLSerializer();
    const text = serializer.serializeToString(svg);
    const file = new Blob([text], { type: IMAGE_TYPES.svg + ";charset=utf-8" });
    if (format === "svg") {
        return file;
    }
    const width = Number(svg.getAttribute("width"));
    const height = Number(svg.getAttribute("height"));
    const canvas = await rasterizeSvg(file, width, height);
    return encodeCanvasImage(canvas, format);
}
