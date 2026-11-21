import { element, node, icon, refreshIcons } from "./dom.mjs";

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
    control.panel.dataset.direction = "down";
    if (upward) {
        available = above;
        control.panel.dataset.direction = "up";
    }
    control.panel.style.width = width + "px";
    control.panel.style.maxHeight = Math.max(SELECT_LAYOUT.minimumHeight, Math.min(SELECT_LAYOUT.maximumHeight, available)) + "px";
    control.panel.style.left = left + "px";
    control.panel.style.top = "0px";
    let top = bounds.bottom + SELECT_LAYOUT.gap;
    if (upward) {
        top = bounds.top - SELECT_LAYOUT.gap - control.panel.offsetHeight;
    }
    control.panel.style.top = Math.max(SELECT_LAYOUT.margin, top) + "px";
}

// 更新键盘指向的选项，只高亮预览，确认后才改变选择
function focusOption(control, index) {
    const options = control.items;
    if (options.length === 0) {
        return;
    }
    control.activeIndex = Math.max(0, Math.min(index, options.length - 1));
    for (let position = 0; position < options.length; position = position + 1) {
        options[position].classList.toggle("focused", position === control.activeIndex);
    }
    const active = options[control.activeIndex];
    control.button.setAttribute("aria-activedescendant", active.id);
    // 只滚动选项列表，避免页面滚动事件把刚打开的列表关掉
    const panel = control.panel;
    const firstVisible = panel.scrollTop;
    const lastVisible = firstVisible + panel.clientHeight;
    const firstPixel = active.offsetTop;
    const lastPixel = firstPixel + active.offsetHeight;
    if (firstPixel < firstVisible) {
        panel.scrollTop = firstPixel;
    } else if (lastPixel > lastVisible) {
        panel.scrollTop = lastPixel - panel.clientHeight;
    }
}

// 同步选项的可用状态和选择顺序，保持当前滚动位置
function updateOptions(control) {
    for (let index = 0; index < control.items.length; index = index + 1) {
        const option = control.select.options[index];
        const item = control.items[index];
        item.setAttribute("aria-selected", String(option.selected));
        item.setAttribute("aria-disabled", String(option.disabled));
        if (control.select.multiple) {
            item.lastElementChild.textContent = option.dataset.order || "";
        }
    }
}

// 创建选项行，分组标题不参与键盘选择，选中的多选项显示顺序
function renderOptions(control) {
    control.panel.replaceChildren();
    control.items = [];
    let previousGroup = null;
    for (let index = 0; index < control.select.options.length; index = index + 1) {
        const option = control.select.options[index];
        const group = option.parentElement;
        if (group.tagName === "OPTGROUP" && group !== previousGroup) {
            const heading = node("div", group.label, "select-group-label");
            heading.setAttribute("role", "presentation");
            control.panel.append(heading);
        }
        previousGroup = group;
        const item = node("div", "", "select-option");
        item.id = control.select.id + "-option-" + index;
        item.dataset.index = String(index);
        item.setAttribute("role", "option");
        item.append(node("span", option.textContent, "select-option-label"));
        if (control.select.multiple) {
            const mark = node("span", "", "select-order");
            mark.setAttribute("aria-hidden", "true");
            item.append(mark);
        } else {
            item.append(icon("check"));
        }
        control.items.push(item);
        control.panel.append(item);
    }
    updateOptions(control);
    refreshIcons();
}

// 打开一个下拉面板，其他面板先关闭，初始焦点跟随已选值
function openSelect(control, keyboard) {
    if (control.select.disabled) {
        return;
    }
    closeSelect(false);
    openedControl = control;
    renderOptions(control);
    control.panel.classList.toggle("keyboard-open", keyboard);
    // 模态窗口里的下拉必须放在窗口内，列表才能接收鼠标和键盘操作
    const dialog = control.button.closest("dialog");
    if (dialog) {
        dialog.append(control.panel);
    }
    control.panel.showPopover();
    control.button.setAttribute("aria-expanded", "true");
    positionPanel(control);
    focusOption(control, control.select.selectedIndex);
}

// 点击按钮展开或收起，不改变当前值
function toggleSelect(control, event) {
    if (openedControl === control) {
        closeSelect(true);
    } else {
        openSelect(control, event.detail === 0);
    }
}

// 确认有效选项，单选后关闭，多选时保持列表打开
function chooseOption(control, index) {
    const option = control.select.options[index];
    if (!option || option.disabled) {
        return;
    }
    if (control.select.multiple) {
        option.selected = !option.selected;
        focusOption(control, index);
        control.select.dispatchEvent(new Event("change", { bubbles: true }));
        refreshSelect(control.select);
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
    // 列表收起后把 Escape 交还给所在对话框
    if (event.key === "Escape" && openedControl !== control) {
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
        openSelect(control, true);
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
        openSelect(control, true);
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

// 外层滚动时让列表跟随触发按钮，按钮滑出可见区域后再收起
function outsideScroll(event) {
    if (!openedControl || !event.target.contains(openedControl.button)) {
        return;
    }
    const control = openedControl;
    const bounds = control.button.getBoundingClientRect();
    let visibleTop = 0;
    let visibleBottom = window.innerHeight;
    if (event.target instanceof Element) {
        const area = event.target.getBoundingClientRect();
        visibleTop = Math.max(visibleTop, area.top);
        visibleBottom = Math.min(visibleBottom, area.bottom);
    }
    if (bounds.bottom <= visibleTop || bounds.top >= visibleBottom) {
        closeSelect(false);
        return;
    }
    positionPanel(control);
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

// 为原生选择框添加统一外观，返回可聚焦的触发按钮
export function refreshSelect(select, optionsChanged = false) {
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
        for (const caption of document.querySelectorAll("label[for='" + select.id + "']")) {
            caption.htmlFor = button.id;
        }
        if (select.multiple) {
            panel.setAttribute("aria-multiselectable", "true");
        }
        const description = select.getAttribute("aria-describedby");
        if (description) {
            button.setAttribute("aria-describedby", description);
        }
        control = { select: select, wrapper: wrapper, button: button, label: label, panel: panel, items: [], activeIndex: 0, typed: "", typedAt: 0 };
        controls.set(select, control);
        button.addEventListener("click", toggleSelect.bind(null, control));
        button.addEventListener("keydown", selectKeyDown.bind(null, control));
        button.addEventListener("blur", selectBlur.bind(null, control));
        panel.addEventListener("mousedown", keepTriggerFocus);
        panel.addEventListener("click", clickOption.bind(null, control));
        select.addEventListener("change", selectChanged.bind(null, select));
    }
    const selected = select.options[select.selectedIndex];
    control.label.textContent = "选择选项";
    if (selected) {
        control.label.textContent = selected.textContent;
    }
    if (select.multiple) {
        const count = select.selectedOptions.length;
        control.label.textContent = "选择监测信号";
        if (count > 0) {
            control.label.textContent = "已选 " + count + " 路信号";
        }
    }
    control.button.title = control.label.textContent;
    control.button.disabled = select.disabled;
    if (openedControl === control) {
        if (select.multiple && !select.disabled && !optionsChanged) {
            updateOptions(control);
        } else {
            closeSelect(false);
        }
    }
    return control.button;
}

// 点击选项时把焦点留在组合框，避免 blur 先关闭面板使点击丢失
function keepTriggerFocus(event) {
    if (event.target.closest(".select-option")) {
        event.preventDefault();
    }
}

// 模态窗口关闭时清掉选项列表，重新打开后由触发框重新定位
function closeDialogSelect(event) {
    if (openedControl && event.target.contains(openedControl.button)) {
        closeSelect(false);
    }
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
document.addEventListener("close", closeDialogSelect, true);
window.addEventListener("resize", resizeWindow);
