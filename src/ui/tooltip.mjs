import { element } from "./dom.mjs";

// 延迟以毫秒计，间距与视口留白以像素计
const TOOLTIP = { showDelay: 800, leaveDelay: 150, gap: 8, edge: 8 };
let tip = null;
let anchor = null;
let timer = 0;
let describedAnchor = null;
let previousDescription = null;

// 从图标或文字找到负责提示的控件，动态添加的按钮也适用
function tooltipAnchor(target) {
    if (!(target instanceof Element)) {
        return null;
    }
    return target.closest("[data-tip]");
}

// 停掉待显示或待隐藏的计时器，避免快速移过按钮时显示旧提示
function stopTimer() {
    window.clearTimeout(timer);
    timer = 0;
}

// 关闭提示，并还原触发控件原有的读屏描述
function hideTooltip() {
    stopTimer();
    if (tip.matches(":popover-open")) {
        tip.hidePopover();
    }
    if (describedAnchor) {
        if (previousDescription === null) {
            describedAnchor.removeAttribute("aria-describedby");
        } else {
            describedAnchor.setAttribute("aria-describedby", previousDescription);
        }
    }
    describedAnchor = null;
    previousDescription = null;
    anchor = null;
}

// 优先放在控件下方，空间不足时换到上方，并把提示限制在视口内
function positionTooltip(trigger) {
    const bounds = trigger.getBoundingClientRect();
    const size = tip.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const centered = bounds.left + (bounds.width - size.width) / 2;
    const rightLimit = viewportWidth - TOOLTIP.edge - size.width;
    const left = Math.max(TOOLTIP.edge, Math.min(centered, rightLimit));
    const below = bounds.bottom + TOOLTIP.gap;
    const above = bounds.top - TOOLTIP.gap - size.height;
    const bottomLimit = viewportHeight - TOOLTIP.edge - size.height;
    let top = below;
    if (below > bottomLimit && above >= TOOLTIP.edge) {
        top = above;
    }
    top = Math.max(TOOLTIP.edge, Math.min(top, bottomLimit));
    tip.style.left = left + "px";
    tip.style.top = top + "px";
}

// 在浏览器顶层显示提示，且放在所属对话框内以免被模态窗口遮蔽
function showTooltip() {
    stopTimer();
    if (!anchor || !anchor.isConnected || anchor.getClientRects().length === 0) {
        hideTooltip();
        return;
    }
    let host = anchor.closest("dialog[open]");
    if (!host) {
        host = document.body;
    }
    host.append(tip);
    tip.textContent = anchor.dataset.tip;
    tip.showPopover();
    positionTooltip(anchor);
    describedAnchor = anchor;
    previousDescription = anchor.getAttribute("aria-describedby");
    let description = tip.id;
    if (previousDescription) {
        description = previousDescription + " " + description;
    }
    anchor.setAttribute("aria-describedby", description);
}

// 鼠标悬停延迟显示，移到已显示的提示上时允许继续阅读
function enterTooltip(event) {
    if (event.pointerType !== "mouse") {
        return;
    }
    if (tip.contains(event.target)) {
        stopTimer();
        return;
    }
    const trigger = tooltipAnchor(event.target);
    if (!trigger) {
        return;
    }
    if (trigger === anchor) {
        if (tip.matches(":popover-open")) {
            stopTimer();
        }
        return;
    }
    hideTooltip();
    anchor = trigger;
    timer = window.setTimeout(showTooltip, TOOLTIP.showDelay);
}

// 离开控件或提示后短暂等待，让指针能越过两者之间的空隙
function leaveTooltip(event) {
    if (!anchor || event.pointerType !== "mouse") {
        return;
    }
    const fromTip = tip.contains(event.target);
    if (!fromTip && tooltipAnchor(event.target) !== anchor) {
        return;
    }
    if (anchor.contains(event.relatedTarget) || tip.contains(event.relatedTarget)) {
        return;
    }
    if (!tip.matches(":popover-open")) {
        hideTooltip();
        return;
    }
    const focus = document.activeElement;
    const keyboardFocus = focus && anchor.contains(focus) && focus.matches(":focus-visible");
    if (!keyboardFocus) {
        stopTimer();
        timer = window.setTimeout(hideTooltip, TOOLTIP.leaveDelay);
    }
}

// 键盘聚焦时立即显示提示，鼠标点击聚焦不重复打开提示
function focusTooltip(event) {
    const trigger = tooltipAnchor(event.target);
    if (!trigger || !event.target.matches(":focus-visible")) {
        return;
    }
    if (trigger !== anchor || !tip.matches(":popover-open")) {
        hideTooltip();
        anchor = trigger;
        showTooltip();
    }
}

// 键盘离开控件时关闭提示，仍在同一控件内部时保留
function blurTooltip(event) {
    if (anchor && anchor.contains(event.target) && !anchor.contains(event.relatedTarget)) {
        hideTooltip();
    }
}

// Escape 优先收起可见提示，下一次按键仍可关闭原对话框
function dismissTooltip(event) {
    if (event.key !== "Escape" || !anchor) {
        return;
    }
    if (tip.matches(":popover-open")) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
    hideTooltip();
}

// 对话框关闭后不保留其中控件的悬停提示
function closeDialogTooltip(event) {
    if (anchor && event.target.contains(anchor)) {
        hideTooltip();
    }
}

// 用同一个浮层响应整页控件，包含后续生成的对象检查按钮
export function bindTooltips() {
    tip = element("workbench-tooltip");
    tip.style.setProperty("--tooltip-edge", TOOLTIP.edge + "px");
    document.addEventListener("pointerover", enterTooltip);
    document.addEventListener("pointerout", leaveTooltip);
    document.addEventListener("pointerdown", hideTooltip, true);
    document.addEventListener("focusin", focusTooltip);
    document.addEventListener("focusout", blurTooltip);
    document.addEventListener("keydown", dismissTooltip, true);
    document.addEventListener("close", closeDialogTooltip, true);
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("blur", hideTooltip);
}
