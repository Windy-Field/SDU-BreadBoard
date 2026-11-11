import { element, node, icon, refreshIcons } from "./dom.mjs";
import { MOTION } from "./motion.mjs";

// 提示停留时间为毫秒，超出同时显示数量后移除最早的提示
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
    if (item.dataset.persistent === "true") {
        return;
    }
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
}

// 显示中文提示，persistent 为 true 时由调用方负责关闭；返回提示编号
export function showToast(message, kind, persistent) {
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
    if (persistent) {
        item.dataset.persistent = "true";
        close.setAttribute("aria-label", "关闭等待提示");
    } else {
        const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
        item.dataset.timer = String(timer);
    }
    while (region.children.length > TOAST_SETTINGS.visibleLimit) {
        const oldest = region.firstElementChild;
        window.clearTimeout(Number(oldest.dataset.timer));
        oldest.remove();
    }
    refreshIcons();
    return item.id;
}

// 主动关闭指定提示，供长时间任务结束或失败时清理等待信息
export function dismissToast(id) {
    if (id !== "") {
        removeToast(id);
    }
}
