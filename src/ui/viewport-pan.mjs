// 两种画布共用屏幕像素阈值，轻微抖动仍算单击
const PAN_SETTINGS = { threshold: 4 };

// 为滚动容器绑定鼠标平移，选项指定按键、状态样式及业务回调，返回查询和结束方法
export function bindViewportPan(viewport, options) {
    let gesture = null;
    let suppressClick = false;

    // 记录按下位置，业务允许后才接管鼠标，滚动条和触摸操作交给浏览器
    function startPan(event) {
        if (gesture) {
            return;
        }
        suppressClick = false;
        if (event.pointerType !== "mouse" || !options.buttons.includes(event.button)) {
            return;
        }
        if (!options.canStart(event)) {
            return;
        }
        const bounds = viewport.getBoundingClientRect();
        const contentRight = bounds.left + viewport.clientLeft + viewport.clientWidth;
        const contentBottom = bounds.top + viewport.clientTop + viewport.clientHeight;
        if (event.clientX >= contentRight || event.clientY >= contentBottom) {
            return;
        }
        gesture = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            scrollLeft: viewport.scrollLeft,
            scrollTop: viewport.scrollTop,
            moved: false
        };
        if (event.button === 1) {
            event.preventDefault();
        }
    }

    // 超过阈值后捕获鼠标并更新滚动位置，移出容器仍能继续拖动
    function movePan(event) {
        if (!gesture || event.pointerId !== gesture.pointerId) {
            return;
        }
        const distanceX = event.clientX - gesture.clientX;
        const distanceY = event.clientY - gesture.clientY;
        const distance = Math.hypot(distanceX, distanceY);
        if (!gesture.moved && distance <= PAN_SETTINGS.threshold) {
            return;
        }
        if (!gesture.moved) {
            gesture.moved = true;
            suppressClick = true;
            viewport.setPointerCapture(event.pointerId);
            viewport.classList.add(options.activeClass);
            options.onStart();
        }
        event.preventDefault();
        viewport.scrollLeft = gesture.scrollLeft - distanceX;
        viewport.scrollTop = gesture.scrollTop - distanceY;
    }

    // 根据结束事件释放鼠标捕获，无参数时用于关闭窗口或重新生成图纸
    function finishPan(event = null) {
        if (!gesture) {
            return;
        }
        if (event && event.pointerId !== undefined && event.pointerId !== gesture.pointerId) {
            return;
        }
        const pointerId = gesture.pointerId;
        gesture = null;
        viewport.classList.remove(options.activeClass);
        if (viewport.hasPointerCapture(pointerId)) {
            viewport.releasePointerCapture(pointerId);
        }
    }

    // 在点击到达子元素前拦截拖动后的鼠标点击，键盘激活和下一次单击继续正常工作
    function suppressPanClick(event) {
        if (suppressClick && event.detail > 0) {
            suppressClick = false;
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // 返回是否已经进入平移，供画布暂停悬停预览
    function isDragging() {
        return gesture !== null && gesture.moved;
    }

    viewport.addEventListener("pointerdown", startPan);
    viewport.addEventListener("pointermove", movePan);
    viewport.addEventListener("lostpointercapture", finishPan);
    viewport.addEventListener("click", suppressPanClick, true);
    window.addEventListener("pointerup", finishPan);
    window.addEventListener("pointercancel", finishPan);
    window.addEventListener("blur", finishPan);
    return { isDragging: isDragging, finish: finishPan };
}
