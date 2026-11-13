import { element, node, icon } from "./dom.mjs";

// 最小阅读高度和每次按钮调整距离使用页面像素，不影响电路坐标
const INSPECTION_SIZES = { minimum: 64, step: 24 };
const weights = new Map();
let resizing = null;

// 切换实验时清除阅读比例，避免上一份实验的分区影响新实验
export function resetInspectionLayout() {
    weights.clear();
    resizing = null;
}

// 按稳定的分区编号读取比例，新打开的资料默认平均分配空间
function paneWeight(pane) {
    if (weights.has(pane.id)) {
        return weights.get(pane.id);
    }
    return 1;
}

// 把阅读比例换成像素高度，分隔条高度从样式读取，避免两处配置不一致
export function applyInspectionSizes() {
    const stack = element("inspection-stack");
    if (stack.hidden || stack.clientHeight === 0) {
        return;
    }
    const pinned = element("pinned-chip");
    const panes = pinned.querySelectorAll(".inspection-pane");
    const inspection = element("inspect-panel");
    const showInspection = !inspection.classList.contains("inspection-duplicate");
    let count = panes.length;
    let pinnedWeight = 0;
    for (const pane of panes) {
        pinnedWeight = pinnedWeight + paneWeight(pane);
    }
    let totalWeight = pinnedWeight;
    if (showInspection) {
        count = count + 1;
        totalWeight = totalWeight + paneWeight(inspection);
    }
    if (count === 0) {
        return;
    }
    const style = window.getComputedStyle(stack);
    const dividerHeight = Number.parseFloat(style.getPropertyValue("--inspection-divider-height"));
    const dividerCount = Math.max(0, count - 1);
    const contentHeight = Math.max(0, stack.clientHeight - dividerCount * dividerHeight);
    for (const pane of panes) {
        const height = contentHeight * paneWeight(pane) / totalWeight;
        pane.style.flexBasis = height + "px";
    }
    const internalDividers = Math.max(0, panes.length - 1);
    const pinnedHeight = contentHeight * pinnedWeight / totalWeight;
    pinned.style.flexBasis = pinnedHeight + internalDividers * dividerHeight + "px";
    inspection.style.flexBasis = contentHeight * paneWeight(inspection) / totalWeight + "px";
}

// 根据两个资料区配置分隔条，所有输入方式共用同一个调整函数
export function configureInspectionDivider(divider, before, after) {
    divider.className = "inspection-divider";
    divider.setAttribute("role", "separator");
    divider.setAttribute("aria-orientation", "horizontal");
    divider.setAttribute("aria-label", "调整上下资料空间");
    divider.setAttribute("aria-controls", before.id + " " + after.id);
    divider.setAttribute("aria-valuemin", "0");
    divider.setAttribute("aria-valuemax", "100");
    const totalWeight = paneWeight(before) + paneWeight(after);
    const percentage = Math.round(paneWeight(before) / totalWeight * 100);
    divider.setAttribute("aria-valuenow", String(percentage));
    divider.tabIndex = 0;
    divider.dataset.before = before.id;
    divider.dataset.after = after.id;
    if (divider.childElementCount > 0) {
        return;
    }
    for (const direction of ["up", "down"]) {
        const button = node("button", "", "splitter-adjust");
        button.dataset.direction = direction;
        let label = "增加下方资料空间";
        if (direction === "down") {
            label = "增加上方资料空间";
        }
        button.setAttribute("aria-label", label);
        button.dataset.tip = label;
        button.append(icon("chevron-" + direction));
        button.addEventListener("click", clickInspectionDivider);
        divider.append(button);
    }
    divider.addEventListener("pointerdown", startInspectionResize);
    divider.addEventListener("pointermove", moveInspectionResize);
    divider.addEventListener("pointerup", stopInspectionResize);
    divider.addEventListener("pointercancel", stopInspectionResize);
    divider.addEventListener("lostpointercapture", stopInspectionResize);
    divider.addEventListener("keydown", keyInspectionResize);
}

// 按本次位移调整相邻两份资料，保留其他分区的高度和阅读位置
function resizeInspectionPair(divider, change) {
    const before = element(divider.dataset.before);
    const after = element(divider.dataset.after);
    const firstHeight = before.getBoundingClientRect().height;
    const totalHeight = firstHeight + after.getBoundingClientRect().height;
    if (totalHeight === 0) {
        return;
    }
    const minimum = Math.min(INSPECTION_SIZES.minimum, totalHeight / 3);
    const requestedHeight = firstHeight + change;
    const height = Math.max(minimum, Math.min(totalHeight - minimum, requestedHeight));
    const totalWeight = paneWeight(before) + paneWeight(after);
    weights.set(before.id, totalWeight * height / totalHeight);
    weights.set(after.id, totalWeight * (totalHeight - height) / totalHeight);
    divider.setAttribute("aria-valuenow", String(Math.round(height / totalHeight * 100)));
    applyInspectionSizes();
}

// 捕获拖动指针，让鼠标离开分隔条后仍能连续调整
function startInspectionResize(event) {
    if (event.button !== 0 || event.target.closest("button")) {
        return;
    }
    event.preventDefault();
    const divider = event.currentTarget;
    resizing = { divider: divider, y: event.clientY };
    divider.setPointerCapture(event.pointerId);
}

// 逐次应用指针位移，拖动只调整阅读空间，不产生电路编辑记录
function moveInspectionResize(event) {
    if (!resizing || resizing.divider !== event.currentTarget) {
        return;
    }
    const change = event.clientY - resizing.y;
    resizing.y = event.clientY;
    resizeInspectionPair(event.currentTarget, change);
}

// 指针松开或手势取消后结束空间调整
function stopInspectionResize() {
    resizing = null;
}

// 上下方向键与拖动采用相同的高度限制
function keyInspectionResize(event) {
    if (event.target !== event.currentTarget) {
        return;
    }
    let change = 0;
    if (event.key === "ArrowUp") {
        change = -INSPECTION_SIZES.step;
    } else if (event.key === "ArrowDown") {
        change = INSPECTION_SIZES.step;
    } else {
        return;
    }
    event.preventDefault();
    resizeInspectionPair(event.currentTarget, change);
}

// 单击方向按钮也能调整资料空间，触屏用户无需精确拖动
function clickInspectionDivider(event) {
    let change = INSPECTION_SIZES.step;
    if (event.currentTarget.dataset.direction === "up") {
        change = -change;
    }
    resizeInspectionPair(event.currentTarget.parentElement, change);
}
