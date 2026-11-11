
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

