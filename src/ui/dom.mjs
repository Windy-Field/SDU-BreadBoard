// SVG 节点需要用独立的命名空间创建，两个绘图面板使用同一个入口
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
// 给浏览器留出读取下载内容的时间，之后释放临时地址
const DOWNLOAD_RELEASE_DELAY = 1000;

// 按编号取页面元素，统一界面查询入口
export function element(id) {
    return document.getElementById(id);
}

// 创建带文字和样式名的元素，返回新的页面节点
export function node(tag, text, className) {
    const result = document.createElement(tag);
    result.textContent = text;
    if (className !== "") {
        result.className = className;
    }
    return result;
}

// 根据标签和属性创建图形，附到指定父节点并返回新节点
export function svgElement(parent, name, attributes, text = "") {
    const shape = document.createElementNS(SVG_NAMESPACE, name);
    for (const key of Object.keys(attributes)) {
        shape.setAttribute(key, String(attributes[key]));
    }
    if (text !== "") {
        shape.textContent = text;
    }
    parent.append(shape);
    return shape;
}

// 释放下载完成后不再使用的临时地址
function revokeDownload(url) {
    URL.revokeObjectURL(url);
}

// 将文件内容按指定名称交给浏览器下载
export function downloadFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(revokeDownload.bind(null, url), DOWNLOAD_RELEASE_DELAY);
}

// 创建 Lucide 图标占位节点，由图标库统一绘制
export function icon(name) {
    const result = document.createElement("i");
    result.dataset.lucide = name;
    result.setAttribute("aria-hidden", "true");
    return result;
}

// 替换新加入的图标占位节点，没有返回值
export function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

