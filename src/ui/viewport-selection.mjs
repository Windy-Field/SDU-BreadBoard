import { selectionRectangle } from "./selection-geometry.mjs";

// 右键移动超过此屏幕像素距离才开始框选，轻点右键不改变选择
const BOX_SETTINGS = { threshold: 4 };

// 绑定右键框选，业务回调决定能否开始及如何应用屏幕坐标选框，返回取消和状态查询方法
export function bindViewportSelection(viewport, options) {
    let gesture = null;
    const overlay = document.createElement("div");
    overlay.className = "viewport-selection-box";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    viewport.append(overlay);

    // 将鼠标位置限制在可见画布内，选框不覆盖滚动条或其他面板
    function selectionPoint(event) {
        const bounds = viewport.getBoundingClientRect();
        const left = bounds.left + viewport.clientLeft;
        const top = bounds.top + viewport.clientTop;
        return {
            x: Math.max(left, Math.min(left + viewport.clientWidth, event.clientX)),
            y: Math.max(top, Math.min(top + viewport.clientHeight, event.clientY))
        };
    }

    // 记录右键起点与追加选择状态，按下时不触发芯片编辑或输入按钮
    function startSelection(event) {
        if (event.pointerType !== "mouse" || event.button !== 2 || gesture || !options.canStart()) {
            return;
        }
        const point = selectionPoint(event);
        if (point.x !== event.clientX || point.y !== event.clientY) {
            return;
        }
        event.preventDefault();
        gesture = {
            pointerId: event.pointerId,
            first: point,
            last: point,
            multiple: event.ctrlKey || event.metaKey,
            moved: false
        };
        viewport.setPointerCapture(event.pointerId);
    }

    // 绘制选框时补上容器滚动量，方框始终跟随屏幕上的鼠标
    function moveSelection(event) {
        if (!gesture || event.pointerId !== gesture.pointerId) {
            return;
        }
        gesture.last = selectionPoint(event);
        const distanceX = gesture.last.x - gesture.first.x;
        const distanceY = gesture.last.y - gesture.first.y;
        if (!gesture.moved && Math.hypot(distanceX, distanceY) <= BOX_SETTINGS.threshold) {
            return;
        }
        gesture.moved = true;
        event.preventDefault();
        const rectangle = selectionRectangle(gesture.first, gesture.last);
        const bounds = viewport.getBoundingClientRect();
        overlay.hidden = false;
        overlay.style.left = rectangle.left - bounds.left - viewport.clientLeft + viewport.scrollLeft + "px";
        overlay.style.top = rectangle.top - bounds.top - viewport.clientTop + viewport.scrollTop + "px";
        overlay.style.width = rectangle.right - rectangle.left + "px";
        overlay.style.height = rectangle.bottom - rectangle.top + "px";
        viewport.classList.add("viewport-selecting");
    }

    // 清理选框和鼠标捕获，取消手势不会改动原来的选择
    function cancelSelection() {
        if (!gesture) {
            return;
        }
        const pointerId = gesture.pointerId;
        gesture = null;
        overlay.hidden = true;
        viewport.classList.remove("viewport-selecting");
        if (viewport.hasPointerCapture(pointerId)) {
            viewport.releasePointerCapture(pointerId);
        }
    }

    // 只接受本次右键释放，框选结束后一次应用结果，避免创建连续撤销记录
    function finishSelection(event) {
        if (!gesture || event.pointerId !== gesture.pointerId || event.button !== 2) {
            return;
        }
        moveSelection(event);
        const completed = gesture;
        cancelSelection();
        if (completed.moved) {
            const rectangle = selectionRectangle(completed.first, completed.last);
            options.onSelect(rectangle, completed.multiple);
        }
    }

    // 取消事件只结束对应鼠标的手势，其他指针不干扰当前选框
    function cancelPointerSelection(event) {
        if (gesture && event.pointerId === gesture.pointerId) {
            cancelSelection();
        }
    }

    // Escape 取消选框并阻止关闭图纸或取消原先正在编辑的接线
    function cancelSelectionKey(event) {
        if (gesture && event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            cancelSelection();
        }
    }

    // 画布右键用于框选，禁止弹出浏览器菜单打断拖动
    function preventSelectionMenu(event) {
        event.preventDefault();
    }

    // 返回是否正在持有右键选框，供悬停和其他拖动处理避让
    function isSelecting() {
        return gesture !== null;
    }

    viewport.addEventListener("pointerdown", startSelection);
    viewport.addEventListener("pointermove", moveSelection);
    viewport.addEventListener("lostpointercapture", cancelPointerSelection);
    viewport.addEventListener("contextmenu", preventSelectionMenu);
    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", cancelPointerSelection);
    window.addEventListener("blur", cancelSelection);
    document.addEventListener("keydown", cancelSelectionKey, true);
    return { cancel: cancelSelection, isSelecting: isSelecting };
}
