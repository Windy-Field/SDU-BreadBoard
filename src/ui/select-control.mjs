import { node, icon, refreshIcons } from "./dom.mjs";

// 弹层位置参数，单位为像素，宽度跟随原选择框
const SELECT_LAYOUT = {
    margin: 10, // 到窗口边缘的最小距离
    gap: 6, // 到选择框的距离
    maximumHeight: 320, // 最大高度，超出后内部滚动
    upwardThreshold: 180, // 下方空间不足时向上展开的判断高度
    minimumHeight: 40 // 至少保留一行
};
// 连续输入名称前缀的等待时间，单位为毫秒
const TYPE_SEARCH_DELAY = 700;
const controls = new WeakMap();
let openedControl = null;

// 关闭选项面板，可选择把键盘焦点交还原来的按钮
function closeSelect(restoreFocus) {
    if (!openedControl) {
        return;
    }
    const control = openedControl;
    openedControl = null;
    control.panel.hidePopover();
    control.button.setAttribute("aria-expanded", "false");
    control.button.removeAttribute("aria-activedescendant");
    if (restoreFocus && control.button.isConnected) {
        control.button.focus();
    }
}

// 依据窗口可用空间放置面板，脱离左侧滚动容器，避免被边界裁切
function positionPanel(control) {
    const bounds = control.button.getBoundingClientRect();
    const width = Math.min(bounds.width, window.innerWidth - SELECT_LAYOUT.margin * 2);
    const left = Math.max(SELECT_LAYOUT.margin, Math.min(bounds.left, window.innerWidth - width - SELECT_LAYOUT.margin));
    const below = window.innerHeight - bounds.bottom - SELECT_LAYOUT.gap - SELECT_LAYOUT.margin;
    const above = bounds.top - SELECT_LAYOUT.gap - SELECT_LAYOUT.margin;
    let available = below;
    const upward = below < Math.min(SELECT_LAYOUT.upwardThreshold, above);
    if (upward) {
        available = above;
    }
    control.panel.style.width = width + "px";
    control.panel.style.maxHeight = Math.max(SELECT_LAYOUT.minimumHeight, Math.min(SELECT_LAYOUT.maximumHeight, available)) + "px";
    control.panel.style.left = left + "px";
    control.panel.style.top = "0px";
    let top = bounds.bottom + SELECT_LAYOUT.gap;
    if (upward) {
        top = bounds.top - SELECT_LAYOUT.gap - control.panel.getBoundingClientRect().height;
    }
    control.panel.style.top = Math.max(SELECT_LAYOUT.margin, top) + "px";
}

// 更新键盘指向的选项，只高亮预览，确认后才切换实验
function focusOption(control, index) {
    const options = control.panel.children;
    if (options.length === 0) {
        return;
    }
    control.activeIndex = Math.max(0, Math.min(index, options.length - 1));
    for (let position = 0; position < options.length; position = position + 1) {
        options[position].classList.toggle("focused", position === control.activeIndex);
    }
    const active = options[control.activeIndex];
    control.button.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
}

// 创建选项行，当前值使用勾选标记，长名称在面板内自然换行
function renderOptions(control) {
    control.panel.replaceChildren();
    for (let index = 0; index < control.select.options.length; index = index + 1) {
        const option = control.select.options[index];
        const item = node("div", "", "select-option");
        item.id = control.select.id + "-option-" + index;
        item.dataset.index = String(index);
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.selected));
        item.setAttribute("aria-disabled", String(option.disabled));
        item.append(node("span", option.textContent, "select-option-label"), icon("check"));
        control.panel.append(item);
    }
    refreshIcons();
}

// 打开一个下拉面板，其他面板先关闭，初始焦点跟随已选值
function openSelect(control) {
    if (control.select.disabled) {
        return;
    }
    closeSelect(false);
    openedControl = control;
    renderOptions(control);
    control.panel.showPopover();
    control.button.setAttribute("aria-expanded", "true");
    positionPanel(control);
    focusOption(control, control.select.selectedIndex);
}

// 点击按钮展开或收起，不改变当前实验
function toggleSelect(control) {
    if (openedControl === control) {
        closeSelect(true);
    } else {
        openSelect(control);
    }
}

// 确认一个有效选项，通过原有 change 事件复用实验切换与芯片移动逻辑
function chooseOption(control, index) {
    const option = control.select.options[index];
    if (!option || option.disabled) {
        return;
    }
    const changed = control.select.value !== option.value;
    control.select.value = option.value;
    closeSelect(true);
    refreshSelect(control.select);
    if (changed) {
        control.select.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

// 读取被点击的选项行，面板空隙不触发选择
function clickOption(control, event) {
    const option = event.target.closest(".select-option");
    if (option) {
        chooseOption(control, Number(option.dataset.index));
    }
}

// 使用方向键浏览，Enter 或空格确认，Esc 取消，Tab 按正常顺序离开
function selectKeyDown(control, event) {
    if (event.key === "Tab") {
        closeSelect(false);
        return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) {
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            searchOption(control, event.key);
            event.stopPropagation();
        }
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") {
        closeSelect(true);
        return;
    }
    if (openedControl !== control) {
        openSelect(control);
        return;
    }
    if (event.key === "Enter" || event.key === " ") {
        chooseOption(control, control.activeIndex);
    } else if (event.key === "ArrowDown") {
        focusOption(control, control.activeIndex + 1);
    } else if (event.key === "ArrowUp") {
        focusOption(control, control.activeIndex - 1);
    } else if (event.key === "Home") {
        focusOption(control, 0);
    } else if (event.key === "End") {
        focusOption(control, control.select.options.length - 1);
    }
}

// 按名称前缀定位选项，短时间内连续输入会合并成一个搜索词
function searchOption(control, text) {
    const now = Date.now();
    if (now - control.typedAt > TYPE_SEARCH_DELAY) {
        control.typed = "";
    }
    control.typed = control.typed + text.toLocaleLowerCase();
    control.typedAt = now;
    if (openedControl !== control) {
        openSelect(control);
    }
    for (let index = 0; index < control.select.options.length; index = index + 1) {
        const option = control.select.options[index];
        if (!option.disabled && option.textContent.toLocaleLowerCase().startsWith(control.typed)) {
            focusOption(control, index);
            return;
        }
    }
}

// 点击控件外部时关闭面板，不阻止被点击的其他按钮执行
function outsidePointerDown(event) {
    if (!openedControl) {
        return;
    }
    if (!openedControl.wrapper.contains(event.target) && !openedControl.panel.contains(event.target)) {
        closeSelect(false);
    }
}

// 滚动外层区域或调整窗口后收起列表，避免面板脱离触发按钮
function outsideScroll(event) {
    if (openedControl && !openedControl.panel.contains(event.target)) {
        closeSelect(false);
    }
}

// 窗口尺寸改变后收起列表，下一次展开时重新计算可用空间
function resizeWindow() {
    closeSelect(false);
}

// 原生选项值改变后同步按钮，原生 select 保留为唯一数据源
function selectChanged(select) {
    refreshSelect(select);
}

// 失去焦点时关闭列表，避免键盘焦点移动后仍留下展开状态
function selectBlur(control) {
    if (openedControl === control) {
        closeSelect(false);
    }
}

// 为一个原生下拉控件添加统一外观，原有值、选项和 change 监听保持可用
export function refreshSelect(select) {
    let control = controls.get(select);
    if (!control) {
        const wrapper = node("div", "", "select-control");
        const button = node("button", "", "select-trigger");
        const label = node("span", "", "select-value");
        const panel = node("div", "", "select-panel");
        panel.id = select.id + "-listbox";
        panel.setAttribute("popover", "manual");
        panel.setAttribute("role", "listbox");
        panel.setAttribute("aria-label", select.getAttribute("aria-label") || "选择选项");
        button.type = "button";
        button.id = select.id + "-trigger";
        button.setAttribute("role", "combobox");
        button.setAttribute("aria-label", select.getAttribute("aria-label") || "选择选项");
        button.setAttribute("aria-controls", panel.id);
        button.setAttribute("aria-haspopup", "listbox");
        button.setAttribute("aria-expanded", "false");
        button.append(label, icon("chevron-down"));
        select.before(wrapper);
        wrapper.append(select, button);
        document.body.append(panel);
        select.classList.add("select-native");
        select.tabIndex = -1;
        select.setAttribute("aria-hidden", "true");
        for (const label of document.querySelectorAll("label[for='" + select.id + "']")) {
            label.htmlFor = button.id;
        }
        control = { select: select, wrapper: wrapper, button: button, label: label, panel: panel, activeIndex: 0, typed: "", typedAt: 0 };
        controls.set(select, control);
        button.addEventListener("click", toggleSelect.bind(null, control));
        button.addEventListener("keydown", selectKeyDown.bind(null, control));
        button.addEventListener("blur", selectBlur.bind(null, control));
        panel.addEventListener("pointerdown", keepTriggerFocus);
        panel.addEventListener("click", clickOption.bind(null, control));
        select.addEventListener("change", selectChanged.bind(null, select));
    }
    const selected = select.options[select.selectedIndex];
    control.label.textContent = "选择选项";
    if (selected) {
        control.label.textContent = selected.textContent;
    }
    control.button.title = control.label.textContent;
    control.button.disabled = select.disabled;
    if (openedControl === control) {
        closeSelect(false);
    }
}

// 点击选项时把焦点留在组合框，避免 blur 先关闭面板使点击丢失
function keepTriggerFocus(event) {
    event.preventDefault();
}

// 在界面刷新后移除已经离开文档的控件面板，防止切换芯片时积累隐藏节点
export function cleanSelectPanels() {
    for (const panel of document.querySelectorAll(".select-panel")) {
        const triggerId = panel.id.replace("-listbox", "-trigger");
        if (!document.getElementById(triggerId)) {
            if (openedControl && openedControl.panel === panel) {
                closeSelect(false);
            }
            panel.remove();
        }
    }
}

document.addEventListener("pointerdown", outsidePointerDown);
document.addEventListener("scroll", outsideScroll, true);
window.addEventListener("resize", resizeWindow);
