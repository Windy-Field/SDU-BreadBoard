import { element, node, icon, refreshIcons } from "./dom.mjs";
import { MOTION } from "./motion.mjs";

// 提示停留时间为毫秒，超出同时显示数量后移除最早的提示
const TOAST_SETTINGS = { duration: 6000, visibleLimit: 4 };
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let toastCounter = 0;

// 删除指定提示，先播放退出动画，再移除页面节点
function removeToast(id) {
    const item = element(id);
    if (!item || item.classList.contains("leaving")) {
        return;
    }
    stopTimer(item);
    if (reducedMotion.matches) {
        item.remove();
        return;
    }
    item.classList.add("leaving");
    item.inert = true;
    item.setAttribute("aria-hidden", "true");
    const timer = window.setTimeout(detachToast.bind(null, id), MOTION.toastDuration);
    item.dataset.timer = String(timer);
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

// 停止当前提示的计时，避免同一条提示留下多份计时任务
function stopTimer(item) {
    window.clearTimeout(Number(item.dataset.timer));
    delete item.dataset.timer;
}

// 鼠标和焦点都离开提示后才重新计时，保证提示有足够的阅读时间
function startTimer(item) {
    if (!item.isConnected || item.classList.contains("leaving")) {
        return;
    }
    stopTimer(item);
    if (item.dataset.persistent === "true" || item.matches(":hover") || item.contains(document.activeElement)) {
        return;
    }
    const timer = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer);
}

// 鼠标或键盘焦点进入时暂停自动关闭，不影响已经开始的退场
function pauseToast(event) {
    const item = event.currentTarget;
    if (!item.classList.contains("leaving")) {
        stopTimer(item);
    }
}

// 等浏览器完成焦点切换，再决定是否恢复提示计时
function resumeToast(event) {
    queueMicrotask(startTimer.bind(null, event.currentTarget));
}

// 返回仍在显示的同类提示，同一错误连续触发时不重复堆叠
function findToast(region, message, kind) {
    for (const item of region.children) {
        if (item.dataset.persistent === "true" || item.classList.contains("leaving")) {
            continue;
        }
        if (item.dataset.message === message && item.classList.contains(kind)) {
            return item;
        }
    }
    return null;
}

// 优先腾出短提示的空间，保留仍在处理的任务提示
function trimToasts(region) {
    while (region.children.length > TOAST_SETTINGS.visibleLimit) {
        let oldest = region.firstElementChild;
        for (const item of region.children) {
            if (item.dataset.persistent !== "true" || item.classList.contains("leaving")) {
                oldest = item;
                break;
            }
        }
        stopTimer(oldest);
        oldest.remove();
    }
}

// 显示中文提示，persistent 为 true 时由调用方负责关闭；返回提示编号
export function showToast(message, kind, persistent = false) {
    const region = element("toast-region");
    if (!persistent) {
        const existing = findToast(region, message, kind);
        if (existing) {
            startTimer(existing);
            return existing.id;
        }
    }
    toastCounter = toastCounter + 1;
    const item = node("div", "", "toast " + kind);
    item.id = "toast-" + toastCounter;
    item.dataset.message = message;
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
    if (persistent) {
        item.dataset.persistent = "true";
        close.setAttribute("aria-label", "关闭等待提示");
    }
    region.append(item);
    startTimer(item);
    trimToasts(region);
    refreshIcons();
    return item.id;
}

// 切换实验时清除上一份的提示及计时，不把旧诊断带进新实验
export function clearToasts() {
    const region = element("toast-region");
    for (const item of region.children) {
        stopTimer(item);
    }
    region.replaceChildren();
}

// 主动关闭指定提示，供长时间任务结束或失败时清理等待信息
export function dismissToast(id) {
    if (id !== "") {
        removeToast(id);
    }
}
