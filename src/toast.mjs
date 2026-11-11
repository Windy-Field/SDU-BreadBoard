import { element, node, icon, refreshIcons } from "./dom.mjs";
import { MOTION } from "./motion.mjs";

const TOAST_SETTINGS = { duration: 6000, visibleLimit: 4 };
let toastCounter = 0;

// 删除指定提示，先播放退出动画，再移除页面节点
function removeToast(id) {
    const item = element(id);
    if (!item) {
        return;
    }
    window.clearTimeout(Number(item.dataset.timer));
    item.classList.add("leaving");
    window.setTimeout(detachToast.bind(null, id), MOTION.toastDuration);
}

// 退出动画结束后移除提示节点
function detachToast(id) {
    const item = element(id);
    if (item) {
        item.remove();
    }
}

// 通过关闭按钮找到对应提示，不影响其他提示
function closeToast(event) {
    const item = event.currentTarget.closest(".toast");
    removeToast(item.id);
}

// 鼠标或键盘焦点进入提示时暂停计时，留出阅读时间
function pauseToast(event) {
    window.clearTimeout(Number(event.currentTarget.dataset.timer));
}

// 鼠标或焦点离开后，重新等待完整的显示时长
function resumeToast(event) {
    const item = event.currentTarget;
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
}

// 显示中文提示，参数为消息和类别；此模块只负责提示，不修改电路状态
export function showToast(message, kind) {
    toastCounter = toastCounter + 1;
    const item = node("div", "", "toast " + kind);
    item.id = "toast-" + toastCounter;
    item.setAttribute("role", "status");
    let symbol = "circle-alert";
    if (kind === "info") {
        symbol = "info";
    } else if (kind === "warning") {
        symbol = "triangle-alert";
    }
    item.append(icon(symbol), node("span", message, ""));
    const close = node("button", "", "icon-button");
    close.setAttribute("aria-label", "关闭提示");
    close.append(icon("x"));
    close.addEventListener("click", closeToast);
    item.append(close);
    item.addEventListener("mouseenter", pauseToast);
    item.addEventListener("mouseleave", resumeToast);
    item.addEventListener("focusin", pauseToast);
    item.addEventListener("focusout", resumeToast);
    const region = element("toast-region");
    region.append(item);
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
    while (region.children.length > TOAST_SETTINGS.visibleLimit) {
        const oldest = region.firstElementChild;
        window.clearTimeout(Number(oldest.dataset.timer));
        oldest.remove();
    }
    refreshIcons();
}
