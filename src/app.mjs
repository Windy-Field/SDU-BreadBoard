import { BOARD, WIRE_COLORS, IO_LIMIT, NOTES_LIMIT, copyProject, emptyProject, endpointLabel, pinHole, placementError, validEndpoint } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { createRuntime, readEndpoint, simulate } from "./engine.mjs";
import { complementPreset } from "./presets.mjs";
import { allEndpoints, hitTest, hitCandidates, wireHandleAt, nearestEndpoint, renderBoard } from "./render.mjs";
import { LIMITS, STORAGE_KEY, validateProject } from "./storage.mjs";
import { MOTION, tween, fadeContent } from "./motion.mjs";
import { markdownFragment } from "./notes.mjs";
import { auditComplement } from "./audit.mjs";
import { CHIP_REFERENCES } from "./catalog.mjs";
import { WORKSPACE_KEY, READ_ONLY_KEY, CLEANUP_BACKUP_KEY, newExperimentId, keepExperiment, validateWorkspace, findBlankExperiment, cleanWorkspace } from "./workspace.mjs";
import { APP_VERSION, CLOCK_SETTINGS } from "./version.mjs";

const SETTINGS = { historyLimit: 80, toastDuration: 6000, zoomMinimum: 0.15, zoomMaximum: 2, zoomStep: 0.15, wheelSpeed: 0.0015 };
const state = { project: emptyProject(), runtime: createRuntime(), result: null, tool: "wire", wireColor: WIRE_COLORS[1], selected: null, pinnedChip: "", placing: "", pending: null, pointer: null, hovered: "", showInternals: false, showLevels: false, zoom: 1, targetZoom: 1, undo: [], redo: [], activeTab: "inspect", notesEditing: false, previousIssues: new Set(), saveFailed: false, visual: { switches: [], leds: {}, internals: 0 } };
const endpoints = allEndpoints();
let toastCounter = 0;
let canvas = null;
let zoomAnchor = null;
let lastPinnedChip = "";
let lastInputCount = 0;
let boardTransitionFirst = null;
let boardTransitionLast = null;
let readOnly = false;
let workspace = { version: 1, activeId: "", projects: {} };
let activeExperiment = "";
let wiringAudit = [];
let dirty = false;
const dirtyExperiments = new Set();
let savedExperiments = { version: 1, activeId: "", projects: {} };
let autoSave = false;
let confirmationAction = null;
let drag = null;
let ignoreClick = false;
let cycle = { x: -100, y: -100, signature: "", index: 0 };
let catalogModel = "";
let heldPulse = "";
let pulseTimer = 0;
let recentAction = "";
const PULSE_SETTINGS = { feedbackDuration: 160 };
state.pressedPulse = "";
const expandedSelection = new Set();
state.selection = [];

// 更新时间栏，统一按北京时间显示，版本号来自同一个配置文件
function updateClock() {
    element("app-version").textContent = "v" + APP_VERSION;
    element("current-time").textContent = new Intl.DateTimeFormat("zh-CN", CLOCK_SETTINGS).format(new Date());
}

// 把编辑留在内存中；只有手动保存或开启自动保存时才写入浏览器
function stageChanges() {
    keepExperiment(workspace, activeExperiment, state.project);
    dirty = true;
    dirtyExperiments.add(activeExperiment);
    element("save-status").textContent = "有未保存的更改";
    if (autoSave) {
        saveLocal();
    }
}

// 只保存当前实验，Ctrl+S 和保存按钮使用相同入口
function saveCurrent() {
    saveLocal();
}

// 自动保存默认关闭，开启后立即保存当前实验
function changeAutoSave(event) {
    autoSave = event.currentTarget.checked;
    if (autoSave) {
        saveLocal();
    }
}

// 有未保存内容时让浏览器在关闭或刷新页面前询问是否离开
function beforeLeave(event) {
    if (dirty) {
        event.preventDefault();
        event.returnValue = "";
    }
}

// 显示原生确认对话框，传入文字和用户确认后才执行的命名函数
function confirmAction(title, message, action) {
    confirmationAction = action;
    element("confirm-title").textContent = title;
    element("confirm-message").textContent = message;
    element("confirm-dialog").showModal();
    element("confirm-cancel").focus();
}

// 用户取消删除时只关闭弹窗，原内容保持不变
function cancelConfirmation() {
    confirmationAction = null;
    element("confirm-dialog").close();
}

// 用户确认后执行已登记的操作，并清空回调避免重复删除
function acceptConfirmation() {
    const action = confirmationAction;
    confirmationAction = null;
    element("confirm-dialog").close();
    if (action) {
        action();
    }
}

// 从当前实验列表移除指定实验，保留其余实验并更新当前页面
function deleteCurrentExperiment() {
    delete workspace.projects[activeExperiment];
    delete savedExperiments.projects[activeExperiment];
    dirtyExperiments.delete(activeExperiment);
    const ids = Object.keys(workspace.projects);
    if (ids.length === 0) {
        activeExperiment = newExperimentId();
        state.project = emptyProject();
    } else {
        activeExperiment = ids[0];
        state.project = copyProject(workspace.projects[activeExperiment]);
    }
    resetRuntime();
    state.undo = [];
    state.redo = [];
    commit();
    renderLibrary();
    if (Object.keys(savedExperiments.projects).length > 0) {
        savedExperiments.activeId = Object.keys(savedExperiments.projects)[0];
    } else {
        savedExperiments.activeId = activeExperiment;
        savedExperiments.projects[activeExperiment] = copyProject(state.project);
    }
    try {
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify(savedExperiments));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedExperiments.projects[savedExperiments.activeId]));
    } catch (error) {
        toast("实验已从列表移除，你可以在浏览器存储恢复后保存", "warning");
    }
}

// 右上角删除按钮优先处理选中对象，没有选中对象时删除当前实验
function quickDelete() {
    if (editingLocked()) {
        return;
    }
    if (state.selection.length > 0 || (state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip"))) {
        deleteSelected();
        return;
    }
    confirmAction("删除当前实验？", "你将删除“" + state.project.name + "”。其他实验会保留", deleteCurrentExperiment);
}

// 保护当前实验的接线与说明，输入开关、脉冲和查看操作仍然可用
function editingLocked() {
    if (readOnly) {
        toast("当前实验处于只读模式。你可以测试输入输出；编辑接线前，请关闭标题栏的只读开关", "info");
        return true;
    }
    return false;
}

// 切换当前浏览器的只读状态，并收起未完成的接线或备注编辑
function changeReadOnly(event) {
    readOnly = event.currentTarget.checked;
    state.pending = null;
    state.placing = "";
    state.notesEditing = false;
    state.tool = "select";
    lastPinnedChip = "";
    try {
        localStorage.setItem(READ_ONLY_KEY, String(readOnly));
    } catch (error) {
        toast("只读状态已生效；浏览器暂时无法记住这个设置", "warning");
    }
    renderLibrary();
    render();
}

// 在实验列表中显示当前名称，切换时不混用其他实验的接线
function renderExperiments() {
    const picker = element("experiment-picker");
    picker.replaceChildren();
    for (const id of Object.keys(workspace.projects)) {
        let name = workspace.projects[id].name;
        if (id === activeExperiment) {
            name = state.project.name;
        }
        if (name.trim() === "") {
            name = "未命名实验";
        }
        const option = node("option", name, "");
        option.value = id;
        picker.append(option);
    }
    picker.value = activeExperiment;
}

// 保存并切换到另一份本地实验，寄存器按重新上电处理
function switchExperiment(event) {
    keepExperiment(workspace, activeExperiment, state.project);
    const id = event.currentTarget.value;
    if (!Object.hasOwn(workspace.projects, id)) {
        return;
    }
    activeExperiment = id;
    state.project = copyProject(workspace.projects[id]);
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    calculate(false);
    render();
    renderLibrary();
}

// 核对当前补码电路，保留你的原接线，在诊断中列出差异
function auditCurrentWiring() {
    wiringAudit = auditComplement(state.project);
    state.activeTab = "diagnostics";
    if (wiringAudit.length === 0) {
        toast("当前芯片和电气连接与补码实验标准接法一致", "info");
    } else {
        toast("发现接线差异：" + wiringAudit[0] + " 你可以在诊断面板查看详情", "warning");
    }
    render();
}

// 按编号取页面元素，统一界面查询入口
function element(id) {
    return document.getElementById(id);
}

// 创建带文字和样式名的元素，返回新的页面节点
function node(tag, text, className) {
    const result = document.createElement(tag);
    result.textContent = text;
    if (className !== "") {
        result.className = className;
    }
    return result;
}

// 创建 Lucide 图标占位节点，由图标库统一绘制
function icon(name) {
    const result = document.createElement("i");
    result.dataset.lucide = name;
    result.setAttribute("aria-hidden", "true");
    return result;
}

// 替换新加入的图标占位节点，没有返回值
function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// 删除指定编号的提示，用于关闭按钮和超时回调
function removeToast(id) {
    const item = element(id);
    if (item) {
        window.clearTimeout(Number(item.dataset.timer));
        item.classList.add("leaving");
        window.setTimeout(detachToast.bind(null, id), MOTION.toastDuration);
    }
}

// 在提示退出过渡结束后移除节点
function detachToast(id) {
    const item = element(id);
    if (item) {
        item.remove();
    }
}

// 处理提示的关闭按钮，参数为点击事件
function closeToast(event) {
    const toast = event.currentTarget.closest(".toast");
    removeToast(toast.id);
}

// 鼠标进入提示时暂停超时，便于阅读错误
function pauseToast(event) {
    window.clearTimeout(Number(event.currentTarget.dataset.timer));
}

// 鼠标离开提示后重新开始关闭计时
function resumeToast(event) {
    const toast = event.currentTarget;
    toast.dataset.timer = String(window.setTimeout(removeToast.bind(null, toast.id), SETTINGS.toastDuration));
}

// 显示操作错误或重要反馈，参数为中文内容和提示类别
function toast(message, kind) {
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
    element("toast-region").append(item);
    item.dataset.timer = String(window.setTimeout(removeToast.bind(null, item.id), SETTINGS.toastDuration));
    while (element("toast-region").children.length > 4) {
        element("toast-region").firstElementChild.remove();
    }
    recentAction = message;
    updateActionStatus();
    refreshIcons();
}

// 保存编辑前的电路供撤销使用，清空已经失效的重做记录
function remember() {
    state.undo.push(copyProject(state.project));
    if (state.undo.length > SETTINGS.historyLimit) {
        state.undo.shift();
    }
    state.redo = [];
}

// 保存当前实验，其他实验只保留各自上一次手动保存的版本
function saveLocal() {
    try {
        keepExperiment(workspace, activeExperiment, state.project);
        const nextSaved = copyProject(savedExperiments);
        keepExperiment(nextSaved, activeExperiment, state.project);
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify(nextSaved));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
        savedExperiments = nextSaved;
        dirtyExperiments.delete(activeExperiment);
        dirty = dirtyExperiments.size > 0;
        element("save-status").textContent = "当前实验已保存";
        state.saveFailed = false;
    } catch (error) {
        element("save-status").textContent = "本地保存不可用";
        if (!state.saveFailed) {
            toast("浏览器无法保存电路，请使用导出按钮保留文件", "warning");
            state.saveFailed = true;
        }
    }
}

// 更新仿真并显示新出现的错误，参数决定是否发送 Toast
function calculate(notify) {
    state.result = simulate(state.project, state.runtime);
    const current = new Set();
    const newIssues = [];
    for (const issue of state.result.issues) {
        const identity = issue.code + ":" + issue.message;
        current.add(identity);
        if (!state.previousIssues.has(identity)) {
            newIssues.push(issue);
        }
    }
    if (notify && newIssues.length > 0) {
        let message = newIssues[0].message;
        if (newIssues.length > 1) {
            message = message + " 另有 " + (newIssues.length - 1) + " 项问题，详见诊断";
        }
        let kind = "error";
        if (newIssues[0].severity === "warning") {
            kind = "warning";
        }
        toast(message, kind);
    }
    state.previousIssues = current;
    animateBoard();
}

// 获取此刻应显示的开关位置和高电平指示灯亮度，不改变电路的真实状态
function targetVisuals() {
    const switches = [];
    const leds = {};
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        switches.push(state.project.switches[index]);
        for (const prefix of ["K", "L"]) {
            const name = prefix + index;
            leds[name] = 0;
            if (readEndpoint(state.result, name) === 1) {
                leds[name] = 1;
            }
        }
    }
    let internals = 0;
    if (state.showInternals) {
        internals = 1;
    }
    return { switches: switches, leds: leds, internals: internals };
}

// 每帧更新画布中的视觉值，真实逻辑电平早已同步计算完成
function updateBoardTransition(progress) {
    const visual = { switches: [], leds: {}, internals: 0 };
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const first = boardTransitionFirst.switches[index];
        const last = boardTransitionLast.switches[index];
        visual.switches.push(first + (last - first) * progress);
        for (const prefix of ["K", "L"]) {
            const name = prefix + index;
            const initial = boardTransitionFirst.leds[name];
            const target = boardTransitionLast.leds[name];
            visual.leds[name] = initial + (target - initial) * progress;
        }
    }
    visual.internals = boardTransitionFirst.internals + (boardTransitionLast.internals - boardTransitionFirst.internals) * progress;
    state.visual = visual;
    renderBoard(canvas, state, endpoints);
}

// 从当前显示值开始平滑过渡，快速反向切换会接着当前值继续
function animateBoard() {
    const target = targetVisuals();
    if (state.visual.switches.length === 0) {
        state.visual = target;
        return;
    }
    boardTransitionFirst = state.visual;
    boardTransitionLast = target;
    tween("board", 0, 1, updateBoardTransition, MOTION.duration);
}

// 完成一次编辑后保存、计算并刷新界面
function commit() {
    wiringAudit = [];
    calculate(true);
    stageChanges();
    render();
}

// 生成未使用的芯片或导线编号，参数为对象数组和字母前缀
function nextId(items, prefix) {
    let maximum = 0;
    for (const item of items) {
        const number = Number(item.id.slice(1));
        maximum = Math.max(maximum, number);
    }
    return prefix + (maximum + 1);
}

// 返回某个孔是否已插芯片脚或导线，便于阻止重复占孔
function occupied(name) {
    for (const chip of state.project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (pinHole(chip, pin) === name) {
                return true;
            }
        }
    }
    for (const wire of state.project.wires) {
        if (wire.from === name || wire.to === name) {
            return true;
        }
    }
    return false;
}

// 在两个合法空孔之间增加导线，返回是否连接成功
function connectWire(first, second, bends) {
    if (editingLocked()) {
        return false;
    }
    if (!validEndpoint(first) || !validEndpoint(second)) {
        toast("端点名称不正确，请选择插孔或检查端点名称", "error");
        return false;
    }
    if (first === second) {
        toast("导线两端不能是同一个孔", "warning");
        return false;
    }
    if (occupied(first) || occupied(second)) {
        toast("这个孔已被占用，请连接同列五孔组中的其他空孔", "warning");
        return false;
    }
    if (state.project.wires.length >= LIMITS.wires) {
        toast("导线数量已达到此版本的上限", "error");
        return false;
    }
    remember();
    state.project.wires.push({ id: nextId(state.project.wires, "W"), from: first, to: second, color: state.wireColor, bends: bends });
    state.pending = null;
    commit();
    return true;
}

// 创建器件库按钮，根据搜索词筛选型号
function renderLibrary() {
    const container = element("chip-library");
    container.replaceChildren();
    const query = element("chip-search").value.toUpperCase().trim();
    let count = 0;
    for (const model in CHIP_MODELS) {
        if (!model.includes(query)) {
            continue;
        }
        const specification = CHIP_MODELS[model];
        const button = node("button", "", "chip-option");
        if (catalogModel === model) {
            button.classList.add("active");
        }
        button.dataset.model = model;
        button.setAttribute("aria-label", "查看 " + model + " " + specification.title);
        button.setAttribute("aria-pressed", String(catalogModel === model));
        const description = node("span", "", "");
        description.append(node("strong", model, ""), node("small", specification.title + " · DIP-" + specification.count, ""));
        button.append(icon("microchip"), description);
        button.addEventListener("click", chooseChip);
        container.append(button);
        count = count + 1;
    }
    element("model-count").textContent = String(count);
    if (count === 0) {
        container.append(node("p", "没有匹配的芯片", "empty-inspector"));
    }
    refreshIcons();
}

// 点击器件库查看芯片资料，只读模式下也可以查看
function chooseChip(event) {
    const model = event.currentTarget.dataset.model;
    if (catalogModel === model) {
        catalogModel = "";
        state.placing = "";
        renderLibrary();
        render();
        return;
    }
    catalogModel = model;
    state.placing = "";
    state.selected = null;
    state.selection = [];
    state.pinnedChip = "";
    state.pending = null;
    state.tool = "select";
    state.activeTab = "inspect";
    renderLibrary();
    render();
}

// 在资料面板明确选择放置，避免查看芯片时误把芯片放到画布上
function placeCatalogChip() {
    if (editingLocked() || catalogModel === "") {
        return;
    }
    state.placing = catalogModel;
    state.tool = "select";
    state.pending = null;
    render();
}

// 把点击位置换算成芯片的板块和起始列，再检查是否可放置
function placeChip(point) {
    if (editingLocked()) {
        return;
    }
    let section = Math.floor((point.y - BOARD.startY + 30) / BOARD.sectionHeight);
    let column = Math.round((point.x - BOARD.startX) / BOARD.pitch) + 1;
    const chip = { id: nextId(state.project.chips, "U"), model: state.placing, section: section, column: column };
    let error = placementError(state.project.chips, chip, "");
    if (state.project.chips.length >= LIMITS.chips) {
        error = "芯片数量已达到此版本的上限";
    }
    if (error === "") {
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
            if (occupied(pinHole(chip, pin))) {
                error = "芯片引脚位置已有导线，请换一组空列";
            }
        }
    }
    if (error !== "") {
        toast(error, "error");
        return;
    }
    remember();
    state.project.chips.push(chip);
    catalogModel = "";
    selectTarget({ kind: "chip", id: chip.id }, false);
    state.placing = "";
    renderLibrary();
    commit();
}

// 返回鼠标事件在面包板逻辑坐标中的位置
function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width * BOARD.width, y: (event.clientY - bounds.top) / bounds.height * BOARD.height };
}

// 处理画布点击，依次处理放置、按键、接线和对象选择
function clickBoard(event) {
    if (ignoreClick) {
        ignoreClick = false;
        return;
    }
    const point = canvasPoint(event);
    if (state.placing !== "") {
        placeChip(point);
        return;
    }
    const target = cycleTarget(point);
    if (target && target.kind === "switch") {
        toggleSwitch(target.id);
        return;
    }
    if (target && target.kind === "pulse") {
        pulse(target.id);
        return;
    }
    if (readOnly) {
        selectTarget(target, event.ctrlKey || event.metaKey);
        render();
        return;
    }
    if (state.tool === "delete") {
        if (target && (target.kind === "wire" || target.kind === "chip")) {
            confirmAction("删除对象？", "确认删除 " + target.id + "？", removeTargets.bind(null, [target]));
        }
        return;
    }
    if (target && target.kind === "node" && state.tool === "wire") {
        if (occupied(target.id)) {
            state.selected = target;
            toast("此孔已占用，接线请选同列的其他空孔", "warning");
        } else if (!state.pending) {
            state.pending = { from: target.id, bends: [] };
            state.selected = target;
        } else {
            connectWire(state.pending.from, target.id, state.pending.bends);
        }
    } else if (state.pending && (!target || target.kind === "wire")) {
        if (state.pending.bends.length >= LIMITS.bends) {
            toast("这根线的转折点过多，请先完成或取消接线", "warning");
        } else {
            state.pending.bends.push({ x: Math.round(point.x), y: Math.round(point.y) });
        }
    } else {
        selectTarget(target, event.ctrlKey || event.metaKey);
    }
    render();
}

// 同一位置连续点击时，依次选择导线、接口和芯片
function cycleTarget(point) {
    const candidates = hitCandidates(point, state, endpoints);
    let signature = "";
    for (const target of candidates) {
        signature = signature + target.kind + ":" + target.id + ";";
    }
    if (Math.hypot(point.x - cycle.x, point.y - cycle.y) < 7 && signature === cycle.signature && candidates.length > 1) {
        cycle.index = (cycle.index + 1) % candidates.length;
    } else {
        cycle.index = 0;
    }
    cycle.x = point.x;
    cycle.y = point.y;
    cycle.signature = signature;
    if (candidates.length === 0) {
        return null;
    }
    return candidates[cycle.index];
}

// 普通点击替换选择，Ctrl 点击增减选择；选中芯片时立即打开其介绍
function selectTarget(target, multiple) {
    catalogModel = "";
    const same = target && state.selected && target.kind === state.selected.kind && target.id === state.selected.id;
    if (same && !multiple) {
        if (target.kind === "chip" && state.pinnedChip === target.id) {
            state.pinnedChip = "";
        }
        state.selected = null;
        state.selection = [];
        return;
    }
    if (multiple && state.selection.length === 0 && state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip")) {
        state.selection.push({ kind: state.selected.kind, id: state.selected.id });
    }
    state.selected = target;
    if (!multiple) {
        state.selection = [];
    }
    if (!target) {
        return;
    }
    if (target.kind === "chip" || target.kind === "wire") {
        let position = -1;
        for (let index = 0; index < state.selection.length; index = index + 1) {
            if (state.selection[index].kind === target.kind && state.selection[index].id === target.id) {
                position = index;
            }
        }
        if (multiple && position >= 0) {
            state.selection.splice(position, 1);
            if (target.kind === "chip" && state.pinnedChip === target.id) {
                state.pinnedChip = "";
            }
            state.selected = null;
            if (state.selection.length > 0) {
                state.selected = state.selection[state.selection.length - 1];
            }
            return;
        } else if (position < 0) {
            state.selection.push({ kind: target.kind, id: target.id });
        }
    }
    if (target.kind === "chip") {
        state.pinnedChip = target.id;
        state.activeTab = "inspect";
        lastPinnedChip = "";
    }
}

// 只在选择模式下记录拖线起点，实际移动超过阈值后才建立撤销记录
function pointerDown(event) {
    const target = hitTest(canvasPoint(event), state, endpoints);
    if (target && target.kind === "pulse" && event.button === 0) {
        startPulse(target.id);
        canvas.setPointerCapture(event.pointerId);
        return;
    }
    if (state.tool !== "select" || readOnly || event.ctrlKey || event.metaKey || event.button !== 0) {
        return;
    }
    const point = canvasPoint(event);
    const handle = wireHandleAt(point, state.project, state.selected);
    if (handle) {
        drag = { wire: handle.wire, handle: handle.handle, points: handle.points, origin: point, moved: false, original: copyProject(state.project) };
        canvas.setPointerCapture(event.pointerId);
    }
}

// 拖动转折点直接预览路径；端点等松开时吸附到合法空孔
function dragPointer(event) {
    if (!drag) {
        return;
    }
    const point = canvasPoint(event);
    if (!drag.moved && Math.hypot(point.x - drag.origin.x, point.y - drag.origin.y) <= 4) {
        return;
    }
    drag.moved = true;
    const wire = findWire(drag.wire);
    if (drag.handle > 0 && drag.handle < drag.points.length - 1) {
        const bends = [];
        for (let index = 1; index < drag.points.length - 1; index = index + 1) {
            let location = drag.points[index];
            if (index === drag.handle) {
                location = { x: Math.round(point.x), y: Math.round(point.y) };
            }
            bends.push(location);
        }
        wire.bends = bends;
    }
    renderBoard(canvas, state, endpoints);
}

// 松开拖动时检查插孔占用，失败恢复原路径，成功后保存为一次编辑
function pointerUp(event) {
    if (heldPulse !== "") {
        finishPulse();
        ignoreClick = true;
        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
        return;
    }
    if (!drag) {
        return;
    }
    const current = drag;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
    if (!current.moved) {
        return;
    }
    ignoreClick = true;
    const wire = findWire(current.wire);
    const end = current.handle === 0 || current.handle === current.points.length - 1;
    if (end) {
        const name = nearestEndpoint(canvasPoint(event), endpoints);
        let previous = wire.from;
        if (current.handle !== 0) {
            previous = wire.to;
        }
        if (name === "" || (occupied(name) && name !== previous)) {
            state.project = current.original;
            toast("请把端点拖到一个空插孔，原接线已保留", "warning");
            render();
            return;
        }
        if (current.handle === 0) {
            wire.from = name;
        } else {
            wire.to = name;
        }
    }
    state.undo.push(current.original);
    state.redo = [];
    commit();
}

// 浏览器取消手势时恢复原来的导线路径
function cancelPointer() {
    finishPulse();
    if (drag && drag.moved) {
        state.project = drag.original;
    }
    drag = null;
    renderBoard(canvas, state, endpoints);
}

// 鼠标移动时只重绘画布和孔位文字，不重新计算电路
function movePointer(event) {
    if (drag) {
        dragPointer(event);
        return;
    }
    const point = canvasPoint(event);
    state.pointer = point;
    const target = hitTest(point, state, endpoints);
    state.hovered = "";
    if (target && target.kind === "node") {
        state.hovered = target.id;
        const value = readEndpoint(state.result, target.id);
        element("pointer-status").textContent = endpointLabel(target.id) + " · " + value;
        canvas.title = endpointLabel(target.id) + "：" + value;
    } else if (target && target.kind === "chip") {
        element("pointer-status").textContent = target.id;
        canvas.title = target.id;
    } else {
        element("pointer-status").textContent = "面包板";
        canvas.title = "";
    }
    renderBoard(canvas, state, endpoints);
}

// 离开画布后移除悬停标记
function leaveBoard() {
    state.hovered = "";
    state.pointer = null;
    renderBoard(canvas, state, endpoints);
}

// 取消一根尚未完成的线或待放置芯片
function cancelWire() {
    state.pending = null;
    state.placing = "";
    catalogModel = "";
    renderLibrary();
    render();
}

// 切换编辑工具，参数来自按钮事件中的工具名称
function chooseTool(event) {
    state.tool = event.currentTarget.id.slice(5);
    state.pending = null;
    state.placing = "";
    renderLibrary();
    render();
}

// 为调色板创建固定颜色选项
function createPalette() {
    const container = element("wire-palette");
    for (const color of WIRE_COLORS) {
        const button = node("button", "", "swatch");
        button.style.backgroundColor = color;
        button.dataset.color = color;
        button.title = "导线颜色 " + color;
        button.setAttribute("aria-label", "导线颜色 " + color);
        button.addEventListener("click", chooseColor);
        container.append(button);
    }
}

// 选择预设导线颜色，并可修改已选中导线的颜色
function chooseColor(event) {
    setWireColor(event.currentTarget.dataset.color);
}

// 接受颜色输入框的自选颜色
function chooseCustomColor(event) {
    setWireColor(event.currentTarget.value);
}

// 设置后续接线颜色，并一次修改所有选中的导线，芯片保持原样
function setWireColor(color) {
    const wires = [];
    if (state.selection.length > 0) {
        for (const target of state.selection) {
            if (target.kind === "wire") {
                const wire = findWire(target.id);
                if (wire && wire.color !== color) {
                    wires.push(wire);
                }
            }
        }
    } else if (state.selected && state.selected.kind === "wire") {
        const wire = findWire(state.selected.id);
        if (wire && wire.color !== color) {
            wires.push(wire);
        }
    }
    if (wires.length > 0) {
        if (editingLocked()) {
            return;
        }
        remember();
        for (const wire of wires) {
            wire.color = color;
        }
        stageChanges();
    }
    state.wireColor = color;
    render();
}

// 按编号查找导线，返回对象或空值
function findWire(id) {
    for (const wire of state.project.wires) {
        if (wire.id === id) {
            return wire;
        }
    }
    return null;
}

// 按编号查找芯片，返回对象或空值
function findChip(id) {
    for (const chip of state.project.chips) {
        if (chip.id === id) {
            return chip;
        }
    }
    return null;
}

// 删除选中的芯片或导线，保留其他结构并提供撤销
// 删除检查面板中的当前对象
function deleteSelected() {
    if (editingLocked()) {
        return;
    }
    const targets = [];
    for (const target of state.selection) {
        targets.push({ kind: target.kind, id: target.id });
    }
    if (targets.length === 0 && state.selected && (state.selected.kind === "chip" || state.selected.kind === "wire")) {
        targets.push({ kind: state.selected.kind, id: state.selected.id });
    }
    if (targets.length > 0) {
        confirmAction("删除选中的对象？", "你选中了 " + targets.length + " 个对象，确认后将从当前实验中移除", removeTargets.bind(null, targets));
    }
}

// 同时移除多选对象，只建立一个撤销记录
function removeTargets(targets) {
    remember();
    const wires = [];
    const chips = [];
    const removed = new Set();
    for (const target of targets) {
        removed.add(target.kind + ":" + target.id);
    }
    for (const wire of state.project.wires) {
        if (!removed.has("wire:" + wire.id)) {
            wires.push(wire);
        }
    }
    for (const chip of state.project.chips) {
        if (!removed.has("chip:" + chip.id)) {
            chips.push(chip);
        } else {
            delete state.runtime.registers[chip.id];
        }
    }
    state.project.wires = wires;
    state.project.chips = chips;
    state.selected = null;
    state.selection = [];
    commit();
}

// 删除固定引脚面板对应的芯片，不误删后来选中的孔或导线
function deletePinnedChip() {
    if (findChip(state.pinnedChip)) {
        const target = { kind: "chip", id: state.pinnedChip };
        confirmAction("删除芯片？", "确认删除 " + target.id + "？导线会留在原来的插孔", removeTargets.bind(null, [target]));
    }
}

// 切换一个板载按键，参数为按键编号
function toggleSwitch(index) {
    remember();
    if (state.project.switches[index] === 0) {
        state.project.switches[index] = 1;
    } else {
        state.project.switches[index] = 0;
    }
    commit();
}

// 处理快速输入位按钮
function clickQuickSwitch(event) {
    toggleSwitch(Number(event.currentTarget.dataset.bit));
}

// 按下脉冲按钮时立即输出有效电平，保持到按钮松开
function startPulse(kind) {
    if (!state.project.power) {
        toast("电源已关闭，请先打开电源再发脉冲", "warning");
        return;
    }
    if (heldPulse !== "") {
        return;
    }
    window.clearTimeout(pulseTimer);
    heldPulse = kind;
    state.pressedPulse = kind;
    if (kind === "P+") {
        state.runtime.pulses.positive = 1;
    } else {
        state.runtime.pulses.negative = 0;
    }
    calculate(true);
    render();
}

// 松开时恢复默认电平，P− 在此时产生上升沿
function finishPulse() {
    if (heldPulse === "") {
        return;
    }
    const kind = heldPulse;
    heldPulse = "";
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
    calculate(true);
    recentAction = kind + " 单脉冲已完成";
    render();
    pulseTimer = window.setTimeout(clearPulseFeedback, PULSE_SETTINGS.feedbackDuration);
}

// 恢复脉冲按钮的外观，不修改已经完成的逻辑时序
function clearPulseFeedback() {
    state.pressedPulse = "";
    render();
}

// 键盘激活或程序触发点击时也能发出一次完整脉冲
function pulse(kind) {
    startPulse(kind);
    finishPulse();
}

// 外部脉冲按钮与画布按钮共用按下逻辑
function pressPulseButton(event) {
    startPulse(event.currentTarget.dataset.pulse);
    if (heldPulse !== "") {
        event.currentTarget.setPointerCapture(event.pointerId);
    }
}

// 外部按钮松开或取消指针时恢复默认电平
function releasePulseButton() {
    finishPulse();
}

// 鼠标点击由按下松开处理，键盘生成的点击补发完整脉冲
function clickPulseButton(event) {
    if (event.detail === 0) {
        pulse(event.currentTarget.dataset.pulse);
    }
}

// 切换总电源，断电会丢失寄存器保存的数据
function changePower(event) {
    remember();
    state.project.power = event.currentTarget.checked;
    commit();
}

// 撤销结构或输入编辑；寄存器重新回到上电未知状态
function undoEdit() {
    if (editingLocked()) {
        return;
    }
    if (state.undo.length === 0) {
        return;
    }
    state.redo.push(copyProject(state.project));
    state.project = state.undo.pop();
    resetRuntime();
    commit();
}

// 重做已撤销的编辑
function redoEdit() {
    if (editingLocked()) {
        return;
    }
    if (state.redo.length === 0) {
        return;
    }
    state.undo.push(copyProject(state.project));
    state.project = state.redo.pop();
    resetRuntime();
    commit();
}

// 清除易失仿真状态和未完成的操作
function resetRuntime() {
    heldPulse = "";
    state.pressedPulse = "";
    window.clearTimeout(pulseTimer);
    state.runtime = createRuntime();
    state.pending = null;
    state.placing = "";
    state.selected = null;
    catalogModel = "";
    state.selection = [];
    state.pinnedChip = "";
    lastPinnedChip = "";
    state.previousIssues = new Set();
}

// 新建空电路，旧电路可通过撤销恢复
function newProject() {
    keepExperiment(workspace, activeExperiment, state.project);
    const blank = findBlankExperiment(workspace);
    if (blank !== "") {
        activeExperiment = blank;
        state.project = copyProject(workspace.projects[blank]);
        resetRuntime();
        calculate(false);
        render();
        toast("已切换到现有的空白实验。你开始编辑后，可以再新建下一份", "info");
        return;
    }
    activeExperiment = newExperimentId();
    state.project = emptyProject();
    state.project.name = "空白实验 " + (Object.keys(workspace.projects).length + 1);
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    commit();
    renderLibrary();
}

// 载入已经核对的补码运算器示例，寄存器需要再次清零
function loadPreset() {
    keepExperiment(workspace, activeExperiment, state.project);
    for (const id of Object.keys(workspace.projects)) {
        if (workspace.projects[id].name === "双符号位补码运算器" && auditComplement(workspace.projects[id]).length === 0) {
            activeExperiment = id;
            state.project = copyProject(workspace.projects[id]);
            resetRuntime();
            calculate(false);
            render();
            return;
        }
    }
    activeExperiment = newExperimentId();
    state.project = complementPreset();
    resetRuntime();
    state.undo = [];
    state.redo = [];
    wiringAudit = [];
    commit();
    renderLibrary();
}

// 更新电路名称和未保存标记，不改变电气状态
function renameProject(event) {
    if (editingLocked()) {
        render();
        return;
    }
    state.project.name = event.currentTarget.value;
    stageChanges();
    renderExperiments();
}

// 下载指定 Blob 文件，参数为文件内容与英文文件名
function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(revokeDownload.bind(null, url), 1000);
}

// 释放下载用的临时网址
function revokeDownload(url) {
    URL.revokeObjectURL(url);
}

// 导出电路结构与输入状态，不导出寄存器易失内容
function exportProject() {
    const content = JSON.stringify(state.project, null, 2);
    download(new Blob([content], { type: "application/json" }), "breadboard-circuit.json");
}

// 备份全部实验，供项目迁移或更换浏览器后导入
function exportWorkspace() {
    keepExperiment(workspace, activeExperiment, state.project);
    download(new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" }), "sdu-breadboard-workspace.json");
}

// 打开原生文件选择器
function chooseImport() {
    element("import-file").click();
}

// 校验导入文件，失败时保留当前电路并用 Toast 说明
async function importProject(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) {
        return;
    }
    try {
        if (file.size > LIMITS.fileBytes) {
            throw new Error("电路文件过大，请选择小于 2 MB 的文件");
        }
        const content = await file.text();
        const parsed = JSON.parse(content);
        if (parsed.projects) {
            keepExperiment(workspace, activeExperiment, state.project);
            const imported = validateWorkspace(parsed);
            for (const id of Object.keys(imported.projects)) {
                workspace.projects[newExperimentId()] = imported.projects[id];
            }
            cleanWorkspace(workspace);
            stageChanges();
            render();
            toast("实验备份已导入。你可以在“我的实验”中切换，按 Ctrl+S 保存", "info");
            input.value = "";
            return;
        }
        const candidate = validateProject(parsed);
        keepExperiment(workspace, activeExperiment, state.project);
        activeExperiment = newExperimentId();
        state.project = candidate;
        resetRuntime();
        state.undo = [];
        state.redo = [];
        wiringAudit = [];
        commit();
        renderLibrary();
    } catch (error) {
        let message = "电路文件无法解析，请检查 JSON 格式";
        if (!(error instanceof SyntaxError)) {
            message = error.message;
        }
        toast(message, "error");
    }
    input.value = "";
}

// 接收画布图片并保存，参数为空时提示导出失败
function receiveImage(blob) {
    if (!blob) {
        toast("无法导出图片，请重试", "error");
        return;
    }
    download(blob, "breadboard-wiring.png");
}

// 导出完整接线画布，不包括工具栏
function exportImage() {
    canvas.toBlob(receiveImage, "image/png");
}

// 设置缩放比例，同时更新画布容器尺寸
function applyZoom(value) {
    state.zoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    element("canvas-size").style.width = BOARD.width * state.zoom + "px";
    element("canvas-size").style.height = BOARD.height * state.zoom + "px";
    canvas.style.transform = "scale(" + state.zoom + ")";
    element("zoom-label").textContent = Math.round(state.zoom * 100) + "%";
    if (zoomAnchor) {
        const viewport = element("board-viewport");
        const bounds = canvas.getBoundingClientRect();
        viewport.scrollLeft = viewport.scrollLeft + bounds.left + zoomAnchor.x * state.zoom - zoomAnchor.clientX;
        viewport.scrollTop = viewport.scrollTop + bounds.top + zoomAnchor.y * state.zoom - zoomAnchor.clientY;
    }
}

// 把缩放目标平滑推进到指定比例，鼠标位置保持在相同电路节点
function changeZoom(value, anchor) {
    zoomAnchor = anchor;
    state.targetZoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    tween("zoom", state.zoom, state.targetZoom, applyZoom, MOTION.zoomDuration);
}

// 滚轮缩放以鼠标下的电路位置为中心，不把滚动事件传给页面
function wheelBoard(event) {
    if (!event.ctrlKey) {
        return;
    }
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    const anchor = { x: (event.clientX - bounds.left) / state.zoom, y: (event.clientY - bounds.top) / state.zoom, clientX: event.clientX, clientY: event.clientY };
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
        delta = delta * 16;
    } else if (event.deltaMode === 2) {
        delta = delta * element("board-viewport").clientHeight;
    }
    const scale = Math.exp(-delta * SETTINGS.wheelSpeed);
    changeZoom(state.targetZoom * scale, anchor);
}

// 将面包板调整到工作区可用宽度
function fitBoard() {
    const width = element("board-viewport").clientWidth - 36;
    changeZoom(width / BOARD.width, null);
}

// 放大画布，不改变元件和导线坐标
function zoomIn() {
    changeZoom(state.targetZoom + SETTINGS.zoomStep, null);
}

// 缩小画布，不改变元件和导线坐标
function zoomOut() {
    changeZoom(state.targetZoom - SETTINGS.zoomStep, null);
}

// 切换内部连通和节点电平的显示，不改变仿真
function changeDisplayOptions() {
    state.showInternals = element("show-internals").checked;
    state.showLevels = element("show-levels").checked;
    animateBoard();
}

// 处理按端点名称接线按钮
function connectByName() {
    const first = element("from-endpoint").value.trim();
    const second = element("to-endpoint").value.trim();
    connectWire(first, second, []);
}

// 切换检查、导线和诊断标签页
function changeTab(event) {
    state.activeTab = event.currentTarget.id.slice(4);
    renderPanels();
    fadeContent(element(state.activeTab + "-panel"));
}

// 添加一条引脚信息，参数包含芯片、脚号和表格节点
function appendPinRow(table, chip, pin) {
    const model = CHIP_MODELS[chip.model];
    const row = document.createElement("tr");
    const hole = pinHole(chip, pin);
    const value = readEndpoint(state.result, hole);
    row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""));
    let levelClass = "logic-level";
    if (value === 1) {
        levelClass = levelClass + " high";
    } else if (value === "X" || value === "Z") {
        levelClass = levelClass + " unknown";
    }
    const levelCell = node("td", String(value), levelClass);
    levelCell.dataset.pin = String(pin);
    row.append(levelCell);
    const positionCell = document.createElement("td");
    const button = node("button", endpointLabel(hole), "");
    button.dataset.endpoint = hole;
    button.addEventListener("click", inspectPin);
    positionCell.append(button);
    row.append(positionCell);
    table.append(row);
}

// 在引脚表中选中物理孔，画布会显示同节点连通孔
function inspectPin(event) {
    state.selected = { kind: "node", id: event.currentTarget.dataset.endpoint };
    render();
}

// 检查面板显示芯片引脚及可调整的摆放位置
function renderChipPanel(container, chip) {
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", chip.id + " · " + chip.model, ""));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "删除芯片");
    remove.append(icon("trash-2"));
    remove.addEventListener("click", deletePinnedChip);
    heading.append(remove);
    const unpin = node("button", "", "icon-button");
    unpin.setAttribute("aria-label", "取消固定引脚信息");
    unpin.append(icon("pin-off"));
    unpin.addEventListener("click", unpinChip);
    heading.append(unpin);
    container.append(heading, node("p", CHIP_MODELS[chip.model].title + " · 缺口朝左", "inspection-meta"));
    appendChipReference(container, chip);
    const controls = node("div", "", "move-fields");
    const sectionLabel = node("label", "板块", "");
    const section = document.createElement("select");
    section.id = "move-section";
    for (let index = 0; index < 4; index = index + 1) {
        const option = node("option", "第 " + (index + 1) + " 块", "");
        option.value = String(index);
        section.append(option);
    }
    section.value = String(chip.section);
    sectionLabel.append(section);
    const columnLabel = node("label", "起始列", "");
    const column = document.createElement("input");
    column.id = "move-column";
    column.type = "number";
    column.min = "1";
    column.max = "59";
    column.value = String(chip.column);
    columnLabel.append(column);
    const move = node("button", "移动芯片", "button");
    move.addEventListener("click", moveChip);
    controls.append(sectionLabel, columnLabel, move);
    move.disabled = readOnly;
    remove.disabled = readOnly;
    section.disabled = readOnly;
    column.disabled = readOnly;
    container.append(controls);
    appendChipPinTable(container, chip);
}

// 在单选和多选检查中复用原厂引脚图、资料链接与功能说明
function appendChipReference(container, chip) {
    const reference = CHIP_REFERENCES[chip.model];
    const figure = node("figure", "", "chip-reference");
    const imageLink = node("a", "", "");
    let imagePath = "assets/pinouts/" + reference.file + ".png";
    if (reference.image) {
        imagePath = reference.image;
    }
    imageLink.href = imagePath;
    imageLink.target = "_blank";
    imageLink.rel = "noopener";
    const image = document.createElement("img");
    image.src = imageLink.href;
    image.alt = chip.model + " DIP 引脚图";
    imageLink.append(image);
    let caption = "原厂顶视图：缺口朝上；画布中的芯片缺口朝左";
    let sourceLabel = "TI 数据手册 · 第 " + reference.page + " 页";
    if (reference.image) {
        caption = "用户材料中的引脚图；安装时请按物理脚号核对";
        sourceLabel = "查看材料中的逻辑符号";
    }
    figure.append(imageLink, node("figcaption", caption, ""));
    const source = node("a", sourceLabel, "datasheet-link");
    source.href = "assets/datasheets/" + reference.file + ".pdf#page=" + reference.page;
    if (reference.logicImage) {
        source.href = reference.logicImage;
    }
    source.target = "_blank";
    source.rel = "noopener";
    container.append(figure, source, node("p", reference.summary, "chip-summary"));
}

// 显示指定芯片全部引脚的名称、当前电平和物理孔位
function appendChipPinTable(container, chip) {
    const table = node("table", "", "pin-table");
    const head = document.createElement("tr");
    head.append(node("th", "脚", ""), node("th", "名称", ""), node("th", "电平", ""), node("th", "位置", ""));
    table.append(head);
    for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        appendPinRow(table, chip, pin);
    }
    container.append(table);
}

// 根据位置控件移动选中芯片，保留导线在原来的物理孔
function moveChip() {
    if (editingLocked()) {
        return;
    }
    const chip = findChip(state.pinnedChip);
    const candidate = { id: chip.id, model: chip.model, section: Number(element("move-section").value), column: Number(element("move-column").value) };
    let error = placementError(state.project.chips, candidate, chip.id);
    for (const wire of state.project.wires) {
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
            const hole = pinHole(candidate, pin);
            if (wire.from === hole || wire.to === hole) {
                error = "新位置的芯片孔被导线占用，请先移走导线";
            }
        }
    }
    if (error !== "") {
        toast(error, "error");
        return;
    }
    remember();
    chip.section = candidate.section;
    chip.column = candidate.column;
    lastPinnedChip = "";
    delete state.runtime.registers[chip.id];
    commit();
}

// 在检查面板显示选中的导线、孔或默认状态
function renderInspection() {
    const container = element("inspect-panel");
    const scrollTop = container.scrollTop;
    container.replaceChildren();
    if (catalogModel !== "") {
        renderCatalogInfo(container, catalogModel);
        return;
    }
    if (state.selection.length > 1) {
        renderMultiInspection(container);
        container.scrollTop = scrollTop;
        return;
    }
    if (state.selected && state.selected.kind === "chip") {
        const chip = findChip(state.selected.id);
        if (chip) {
            container.append(node("h2", chip.id + " · " + chip.model, ""), node("p", "引脚信息已固定在上方", "inspection-meta"));
            return;
        }
    }
    if (state.selected && state.selected.kind === "wire") {
        const wire = findWire(state.selected.id);
        if (wire) {
            container.append(node("h2", wire.id, ""), node("p", endpointLabel(wire.from) + " → " + endpointLabel(wire.to), "inspection-meta"));
            container.append(node("div", String(readEndpoint(state.result, wire.from)), "node-value"));
            const remove = node("button", "删除导线", "button");
            remove.addEventListener("click", deleteSelected);
            container.append(remove);
            return;
        }
    }
    if (state.selected && state.selected.kind === "node") {
        const name = state.selected.id;
        container.append(node("h2", endpointLabel(name), ""), node("p", name, "inspection-meta"), node("div", String(readEndpoint(state.result, name)), "node-value"));
        const pullUp = node("button", "为此节点添加上拉", "button");
        if (state.project.pullUps.includes(name)) {
            pullUp.textContent = "移除此节点上拉";
        }
        pullUp.disabled = readOnly;
        pullUp.dataset.endpoint = name;
        pullUp.addEventListener("click", togglePullUp);
        container.append(pullUp);
        for (const chip of state.project.chips) {
            for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
                if (pinHole(chip, pin) === name) {
                    container.append(node("p", chip.id + " 第 " + pin + " 脚 · " + CHIP_MODELS[chip.model].labels[pin], "inspection-meta"));
                }
            }
        }
        return;
    }
    const empty = node("div", "", "empty-inspector");
    empty.append(icon("scan-line"), node("strong", "未选择对象", ""), node("p", "芯片 " + state.project.chips.length + " 片 · 导线 " + state.project.wires.length + " 根", ""));
    container.append(empty);
    const summary = node("table", "", "pin-table");
    for (const chip of state.project.chips) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        const button = node("button", chip.id + "  " + chip.model, "");
        button.dataset.chip = chip.id;
        button.addEventListener("click", selectChipFromList);
        cell.append(button);
        row.append(cell, node("td", "第" + (chip.section + 1) + "块", ""));
        summary.append(row);
    }
    container.append(summary);
}

// 为 OC 输出或双向控制端增加弱上拉，不能用直接短接电源代替电阻
function togglePullUp(event) {
    if (editingLocked()) {
        return;
    }
    remember();
    const endpoint = event.currentTarget.dataset.endpoint;
    const index = state.project.pullUps.indexOf(endpoint);
    if (index >= 0) {
        state.project.pullUps.splice(index, 1);
    } else {
        state.project.pullUps.push(endpoint);
    }
    commit();
}

// 展示尚未放置的芯片资料，脚位表只描述型号，不混入某片芯片的实时电平
function renderCatalogInfo(container, modelName) {
    const model = CHIP_MODELS[modelName];
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", modelName, ""));
    container.append(heading, node("p", model.title + " · DIP-" + model.count, "inspection-meta"));
    appendChipReference(container, { model: modelName });
    const place = node("button", "", "button catalog-place");
    place.id = "place-catalog-chip";
    place.append(icon("microchip"), node("span", "放置芯片", ""));
    place.disabled = readOnly;
    place.addEventListener("click", placeCatalogChip);
    container.append(place);
    const table = node("table", "", "pin-table catalog-pin-table");
    const header = document.createElement("tr");
    header.append(node("th", "脚号", ""), node("th", "名称", ""), node("th", "类型", ""));
    table.append(header);
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        let kind = "输入";
        if (pin === model.power) {
            kind = "+5V 电源";
        } else if (pin === model.ground) {
            kind = "地";
        } else if (model.outputs.includes(pin)) {
            kind = "输出";
        }
        const row = document.createElement("tr");
        row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""), node("td", kind, ""));
        table.append(row);
    }
    container.append(table);
}

// 从多选列表移除单个对象，其他对象的选择和电路连接保持不变
function deselectFromInspection(event) {
    const kind = event.currentTarget.dataset.kind;
    const id = event.currentTarget.dataset.id;
    const kept = [];
    for (const target of state.selection) {
        if (target.kind !== kind || target.id !== id) {
            kept.push(target);
        }
    }
    state.selection = kept;
    state.selected = null;
    if (kept.length > 0) {
        state.selected = kept[kept.length - 1];
    }
    if (kind === "chip" && state.pinnedChip === id) {
        state.pinnedChip = "";
    }
    render();
}

// 记住多选芯片详情的展开状态，电平更新时仍保持当前阅读位置
function toggleSelectionDetails(event) {
    const details = event.currentTarget;
    if (details.open) {
        expandedSelection.add(details.dataset.chip);
    } else {
        expandedSelection.delete(details.dataset.chip);
    }
}

// 为多选对象添加统一标题与取消选择按钮
function selectionHeading(container, target, title) {
    const heading = node("div", "", "selection-heading");
    heading.append(node("h3", title, ""));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "取消选择 " + target.id);
    remove.dataset.kind = target.kind;
    remove.dataset.id = target.id;
    remove.append(icon("x"));
    remove.addEventListener("click", deselectFromInspection);
    heading.append(remove);
    container.append(heading);
}

// 在多选检查中展示导线两端、电平及颜色，不只显示最后一根线
function appendSelectedWire(container, target, wire) {
    selectionHeading(container, target, wire.id + " · 导线");
    const swatch = node("span", "", "selection-wire-color");
    swatch.style.backgroundColor = wire.color;
    swatch.setAttribute("aria-label", "颜色 " + wire.color);
    const color = node("div", "", "selection-wire-meta");
    color.append(swatch, node("span", wire.color, ""));
    container.append(color);
    const list = node("dl", "", "selection-wire-endpoints");
    for (const endpoint of [wire.from, wire.to]) {
        const row = node("div", "", "selection-endpoint");
        const value = readEndpoint(state.result, endpoint);
        row.append(node("dt", endpointLabel(endpoint), ""), node("dd", String(value), "logic-level"));
        list.append(row);
    }
    container.append(list);
}

// 在多选检查中展示芯片位置和功能，并提供独立展开的引脚资料
function appendSelectedChip(container, target, chip) {
    const model = CHIP_MODELS[chip.model];
    selectionHeading(container, target, chip.id + " · " + chip.model);
    const lastColumn = chip.column + model.count / 2 - 1;
    container.append(node("p", model.title + " · 第 " + (chip.section + 1) + " 块 · " + chip.column + "～" + lastColumn + " 列", "selection-location"));
    container.append(node("p", CHIP_REFERENCES[chip.model].summary, "chip-summary"));
    const details = node("details", "", "selection-chip-details");
    details.dataset.chip = chip.id;
    details.open = expandedSelection.has(chip.id);
    details.append(node("summary", "引脚图与实时电平", ""));
    const body = node("div", "", "selection-chip-body");
    appendChipReference(body, chip);
    appendChipPinTable(body, chip);
    details.append(body);
    details.addEventListener("toggle", toggleSelectionDetails);
    container.append(details);
}

// 按选择顺序逐项显示全部芯片和导线，并保留批量删除入口
function renderMultiInspection(container) {
    container.append(node("p", "已选择 " + state.selection.length + " 个对象", "inspection-meta"));
    const list = node("div", "", "selection-list");
    for (const target of state.selection) {
        const section = node("section", "", "selection-item");
        section.dataset.kind = target.kind;
        section.dataset.id = target.id;
        section.setAttribute("aria-label", target.id + " 检查信息");
        if (target.kind === "wire") {
            const wire = findWire(target.id);
            if (wire) {
                appendSelectedWire(section, target, wire);
                list.append(section);
            }
        } else if (target.kind === "chip") {
            const chip = findChip(target.id);
            if (chip) {
                appendSelectedChip(section, target, chip);
                list.append(section);
            }
        }
    }
    container.append(list);
    const remove = node("button", "", "button selection-delete");
    remove.append(icon("trash-2"), node("span", "删除所选对象", ""));
    remove.disabled = readOnly;
    remove.addEventListener("click", deleteSelected);
    container.append(remove);
}

// 从芯片概览列表打开该芯片的检查面板
function selectChipFromList(event) {
    selectTarget({ kind: "chip", id: event.currentTarget.dataset.chip }, event.ctrlKey || event.metaKey);
    render();
}

// 选中导线列表中的一根线
function selectWireFromList(event) {
    selectTarget({ kind: "wire", id: event.currentTarget.dataset.wire }, event.ctrlKey || event.metaKey);
    state.activeTab = "inspect";
    render();
}

// 删除导线列表中的一根线
function deleteWireFromList(event) {
    const target = { kind: "wire", id: event.currentTarget.dataset.wire };
    if (!editingLocked()) {
        confirmAction("删除导线？", "确认删除 " + target.id + "？", removeTargets.bind(null, [target]));
    }
}

// 绘制可选择和删除的导线列表
function renderWireList() {
    const container = element("wires-panel");
    container.replaceChildren();
    for (const wire of state.project.wires) {
        const row = node("div", "", "wire-row");
        const swatch = node("span", "", "");
        swatch.style.backgroundColor = wire.color;
        const select = node("button", "", "");
        select.dataset.wire = wire.id;
        select.append(node("small", wire.id + " · " + readEndpoint(state.result, wire.from), ""), node("span", endpointLabel(wire.from) + " → " + endpointLabel(wire.to), ""));
        select.addEventListener("click", selectWireFromList);
        const remove = node("button", "", "icon-button");
        remove.dataset.wire = wire.id;
        remove.setAttribute("aria-label", "删除 " + wire.id);
        remove.append(icon("x"));
        remove.addEventListener("click", deleteWireFromList);
        remove.disabled = readOnly;
        row.append(swatch, select, remove);
        container.append(row);
    }
    if (state.project.wires.length === 0) {
        container.append(node("p", "暂无导线", "empty-inspector"));
    }
}

// 绘制当前诊断，Toast 消失后仍可在这里查阅
function renderDiagnostics() {
    const container = element("diagnostics-panel");
    container.replaceChildren();
    if (state.result.issues.length === 0 && wiringAudit.length === 0) {
        const item = node("div", "", "diagnostic success");
        let message = "未发现供电、悬空输入或输出冲突";
        if (!state.project.power) {
            message = "电源已关闭";
        } else if (state.project.chips.length === 0) {
            message = "当前没有芯片";
        }
        item.append(icon("circle-check"), node("span", message, ""));
        container.append(item);
    }
    for (const issue of state.result.issues) {
        const item = node("div", "", "diagnostic " + issue.severity);
        item.append(icon("triangle-alert"), node("span", issue.message, ""));
        container.append(item);
    }
    for (const message of wiringAudit.slice(0, 80)) {
        const item = node("div", "", "diagnostic warning");
        item.append(icon("route"), node("span", message, ""));
        container.append(item);
    }
}

// 根据当前标签页显示对应面板
function renderPanels() {
    renderPinnedChip();
    for (const name of ["inspect", "wires", "diagnostics", "notes"]) {
        const active = name === state.activeTab;
        element(name + "-panel").hidden = !active;
        element("tab-" + name).classList.toggle("active", active);
        element("tab-" + name).setAttribute("aria-selected", String(active));
    }
    renderInspection();
    if (state.activeTab === "wires") {
        renderWireList();
    }
    if (state.activeTab === "diagnostics") {
        renderDiagnostics();
    }
    if (state.activeTab === "notes") {
        renderNotes();
    }
    refreshIcons();
}

// 固定最近选中的芯片，其信息不会因继续接线或切换标签而消失
function renderPinnedChip() {
    if (state.selected && state.selected.kind === "chip") {
        state.pinnedChip = state.selected.id;
    }
    const container = element("pinned-chip");
    if (state.selection.length > 1) {
        container.hidden = true;
        return;
    }
    const chip = findChip(state.pinnedChip);
    container.hidden = !chip;
    if (!chip) {
        container.replaceChildren();
        lastPinnedChip = "";
        return;
    }
    if (lastPinnedChip !== chip.id) {
        container.replaceChildren();
        renderChipPanel(container, chip);
        lastPinnedChip = chip.id;
        fadeContent(container);
    } else {
        for (const cell of container.querySelectorAll("[data-pin]")) {
            const value = readEndpoint(state.result, pinHole(chip, Number(cell.dataset.pin)));
            cell.textContent = String(value);
            cell.classList.toggle("high", value === 1);
            cell.classList.toggle("unknown", value === "X" || value === "Z");
        }
    }
}

// 用户明确关闭时取消固定芯片，避免下次刷新又自动固定
function unpinChip() {
    state.pinnedChip = "";
    if (state.selected && state.selected.kind === "chip") {
        state.selected = null;
    }
    render();
}

// 创建某一个输入端口的快速开关和高有效 LED
function createQuickInput(bit) {
    const wrapper = node("div", "", "quick-input");
    wrapper.append(node("span", "K" + bit, "quick-port-label"));
    const led = node("span", "", "io-led");
    led.dataset.inputLed = String(bit);
    led.setAttribute("role", "img");
    const button = node("button", "0", "bit-button");
    button.dataset.bit = String(bit);
    button.setAttribute("aria-label", "切换 K" + bit);
    button.addEventListener("click", clickQuickSwitch);
    wrapper.append(led, button);
    return wrapper;
}

// 根据位数创建输入控件，仅结构变化时重建以保留焦点和动画
function ensureInputControls(count) {
    if (lastInputCount === count) {
        return;
    }
    const container = element("quick-switches");
    container.replaceChildren();
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
        container.append(createQuickInput(bit));
    }
    lastInputCount = count;
    fadeContent(container);
}

// 更新输入和输出灯的语义状态，仅确认为 1 时点亮
function setLedState(led, name, value) {
    led.classList.toggle("on", value === 1);
    led.dataset.value = String(value);
    led.setAttribute("aria-label", name + "：" + value);
    led.title = name + "：" + value;
}

// 绘制输出端口 LED 和端口名称，未知状态仍显示文字但不点亮
function renderOutputLeds(count) {
    const container = element("output-leds");
    if (container.children.length !== count) {
        container.replaceChildren();
        for (let bit = count - 1; bit >= 0; bit = bit - 1) {
            const wrapper = node("div", "", "output-port");
            const led = node("span", "", "io-led");
            led.dataset.outputLed = String(bit);
            led.setAttribute("role", "img");
            wrapper.append(led, node("span", "L" + bit, "quick-port-label"));
            container.append(wrapper);
        }
    }
    for (const led of container.querySelectorAll("[data-output-led]")) {
        const name = "L" + led.dataset.outputLed;
        setLedState(led, name, readEndpoint(state.result, name));
    }
}

// 按用户选择的位数读取端口电平，显示电路实际输出
function renderIo() {
    const inputCount = state.project.inputCount;
    const outputCount = state.project.outputCount;
    ensureInputControls(inputCount);
    let input = 0;
    for (const button of element("quick-switches").querySelectorAll("button")) {
        const bit = Number(button.dataset.bit);
        const value = state.project.switches[bit];
        button.textContent = String(value);
        button.setAttribute("aria-pressed", String(value === 1));
        const led = button.parentElement.querySelector(".io-led");
        setLedState(led, "K" + bit, readEndpoint(state.result, "K" + bit));
        input = input * 2 + value;
    }
    element("input-decimal").textContent = String(input);
    element("input-count").value = String(state.project.inputCount);
    element("output-count").value = String(state.project.outputCount);
    element("input-label").textContent = "输入 K" + (inputCount - 1) + "…K0";
    element("output-label").textContent = "输出 L" + (outputCount - 1) + "…L0";
    let binary = "";
    let known = true;
    let number = 0;
    for (let bit = outputCount - 1; bit >= 0; bit = bit - 1) {
        const value = readEndpoint(state.result, "L" + bit);
        binary = binary + String(value);
        if (bit > 0 && bit % 4 === 0) {
            binary = binary + " ";
        }
        if (value !== 0 && value !== 1) {
            known = false;
        } else {
            number = number * 2 + value;
        }
    }
    element("binary-result").textContent = binary;
    element("binary-result").classList.add("general-binary");
    renderOutputLeds(outputCount);
    let meaning = "未知 / 悬空";
    if (!state.project.power) {
        meaning = "电源关闭";
    } else if (known) {
        meaning = String(number);
    }
    element("result-meaning").textContent = meaning;
}

// 更新输入输出的显示位数，物理板仍保留全部 24 个输入和输出端口
function changeIoCount(event) {
    if (editingLocked()) {
        renderIo();
        return;
    }
    const count = Number(event.currentTarget.value);
    if (!Number.isInteger(count) || count < 1 || count > IO_LIMIT) {
        toast("显示位数必须为 1～24，请输入整数", "warning");
        renderIo();
        return;
    }
    remember();
    if (event.currentTarget.id === "input-count") {
        state.project.inputCount = count;
    } else {
        state.project.outputCount = count;
    }
    commit();
    fadeContent(document.querySelector(".io-strip"));
}

// 将备注显示为安全的 Markdown 预览，编辑时保留光标位置
function renderNotes() {
    const editor = element("notes-editor");
    if (editor.value !== state.project.notes) {
        editor.value = state.project.notes;
    }
    editor.hidden = !state.notesEditing;
    element("notes-editor-label").hidden = !state.notesEditing;
    element("notes-preview").hidden = state.notesEditing;
    element("notes-edit-button").classList.toggle("selected", state.notesEditing);
    element("notes-edit-button").setAttribute("aria-pressed", String(state.notesEditing));
    element("notes-preview-button").classList.toggle("selected", !state.notesEditing);
    element("notes-preview-button").setAttribute("aria-pressed", String(!state.notesEditing));
    if (!state.notesEditing) {
        element("notes-preview").replaceChildren(markdownFragment(state.project.notes));
    }
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " · 随电路保存";
}

// 进入 Markdown 编辑，聚焦编辑框但不改变电路
function editNotes() {
    if (editingLocked()) {
        return;
    }
    state.notesEditing = true;
    renderNotes();
    element("notes-editor").focus({ preventScroll: true });
    fadeContent(element("notes-editor"));
}

// 切换到清理后的 Markdown 预览
function previewNotes() {
    state.notesEditing = false;
    renderNotes();
    fadeContent(element("notes-preview"));
}

// 在开始编辑备注时保留一个撤销点，不为每个按键复制整张电路
function rememberNotes() {
    remember();
}

// 备注输入后更新当前草稿，不重复仿真或重建编辑框
function updateNotes(event) {
    if (editingLocked()) {
        renderNotes();
        return;
    }
    state.project.notes = event.currentTarget.value;
    stageChanges();
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " · 按 Ctrl+S 保存";
    element("undo").disabled = state.undo.length === 0;
    element("redo").disabled = state.redo.length === 0;
}

// 刷新整个工作台的可见状态；不在此函数里改变电路
function render() {
    updateActionStatus();
    for (const button of document.querySelectorAll(".pulse-button")) {
        const pressed = button.dataset.pulse === state.pressedPulse;
        button.classList.toggle("pressed", pressed);
        button.setAttribute("aria-pressed", String(pressed));
    }
    element("save-status").textContent = "当前实验已保存";
    if (dirtyExperiments.has(activeExperiment)) {
        element("save-status").textContent = "当前实验未保存";
    }
    element("read-only-toggle").checked = readOnly;
    element("project-name").readOnly = readOnly;
    for (const id of ["tool-wire", "tool-delete", "connect-endpoints", "input-count", "output-count", "notes-edit-button"]) {
        element(id).disabled = readOnly;
    }
    element("project-name").value = state.project.name;
    element("power-toggle").checked = state.project.power;
    element("undo").disabled = readOnly || state.undo.length === 0;
    element("redo").disabled = readOnly || state.redo.length === 0;
    element("cancel-wire").disabled = !state.pending && state.placing === "";
    for (const name of ["wire", "select", "delete"]) {
        const active = state.tool === name;
        element("tool-" + name).classList.toggle("selected", active);
        element("tool-" + name).setAttribute("aria-pressed", String(active));
    }
    for (const button of element("wire-palette").children) {
        const active = button.dataset.color === state.wireColor;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    }
    element("custom-color").value = state.wireColor;
    element("wire-count").textContent = String(state.project.wires.length);
    element("issue-count").textContent = String(state.result.issues.length + wiringAudit.length);
    element("circuit-count").textContent = state.project.chips.length + " 片芯片 · " + state.project.wires.length + " 根导线";
    let status = "电路稳定";
    if (!state.project.power) {
        status = "电源关闭";
    } else if (state.result.issues.length > 0) {
        status = state.result.issues.length + " 项诊断";
    }
    if (state.pending) {
        status = "接线起点：" + endpointLabel(state.pending.from);
    } else if (state.placing) {
        status = "待放置 " + state.placing;
    }
    element("simulation-status").textContent = status;
    renderIo();
    renderExperiments();
    renderPanels();
    renderBoard(canvas, state, endpoints);
}

// 状态栏始终从当前交互状态读取，避免上一次查看的芯片名称残留
function updateActionStatus() {
    let message = "就绪";
    if (recentAction !== "") {
        message = recentAction;
    }
    if (state.pressedPulse !== "") {
        message = state.pressedPulse + " 脉冲";
    } else if (state.placing !== "") {
        message = "待放置 " + state.placing;
    } else if (state.pending) {
        message = "接线起点：" + endpointLabel(state.pending.from);
    } else if (catalogModel !== "") {
        message = "正在查看 " + catalogModel;
    } else if (state.selection.length > 1) {
        message = "已选择 " + state.selection.length + " 个对象";
    } else if (state.selected) {
        message = "已选择 " + state.selected.id;
    }
    element("action-status").textContent = message;
}

// 打开实验说明对话框
function showHelp() {
    const paragraphs = element("help-dialog").querySelectorAll(".dialog-body p");
    paragraphs[0].textContent = "你可以在“我的实验”中新建独立实验，或切回已保存的实验。输入和输出各可显示 1～24 位，端口作用可以写在 Markdown 备注里";
    paragraphs[1].textContent = "点击器件库中的芯片先查看功能和引脚图，再点击“放置芯片”选择安装位置。芯片缺口朝左，跨 E/F 沟槽。接线时依次选择起点和终点，点击空白可增加转折点，按 Esc 取消";
    paragraphs[6].textContent = "补码示例中，K0～K3 是数值位，K4 是符号位，K5 为 0 时加、1 时减。你把 K6 切到 0 再切回 1 即可清零。按住 P− 后松开，寄存器在恢复上升沿保存结果。L5、L4 是两个符号位，L6 指示溢出";
    paragraphs[paragraphs.length - 1].textContent = "快捷键：Ctrl+Z 撤销，Ctrl+Shift+Z 重做，Delete 请求删除选中对象，Ctrl+S 只保存当前实验。你可以按住 Ctrl 多选器件和导线，在选择模式下拖动导线端点或转折点。自动保存默认关闭；有未保存内容时，关闭或刷新页面会显示浏览器离开确认。你选择留在页面后，可以按 Ctrl+S 保存";
    element("help-dialog").showModal();
    fadeContent(element("help-dialog"));
}

// 关闭实验说明对话框
function closeHelp() {
    element("help-dialog").close();
}

// 处理全局快捷键，文本输入时不抢占普通编辑操作
function keyDown(event) {
    const tag = event.target.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCurrent();
        return;
    }
    if (element("confirm-dialog").open) {
        return;
    }
    if (event.key === "Escape") {
        cancelWire();
        return;
    }
    if (editing || element("help-dialog").open) {
        return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
            redoEdit();
        } else {
            undoEdit();
        }
    } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
    }
}

// 将命名事件处理函数绑定到界面控件
function bindEvents() {
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", cancelPointer);
    element("save-project").addEventListener("click", saveCurrent);
    element("autosave-toggle").addEventListener("change", changeAutoSave);
    element("quick-delete").addEventListener("click", quickDelete);
    element("confirm-cancel").addEventListener("click", cancelConfirmation);
    element("confirm-accept").addEventListener("click", acceptConfirmation);
    element("export-workspace").addEventListener("click", exportWorkspace);
    window.addEventListener("beforeunload", beforeLeave);
    element("read-only-toggle").addEventListener("change", changeReadOnly);
    element("new-experiment").addEventListener("click", newProject);
    element("experiment-picker").addEventListener("change", switchExperiment);
    element("audit-preset").addEventListener("click", auditCurrentWiring);
    canvas.addEventListener("click", clickBoard);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerleave", leaveBoard);
    element("board-viewport").addEventListener("wheel", wheelBoard, { passive: false });
    element("tool-wire").addEventListener("click", chooseTool);
    element("tool-select").addEventListener("click", chooseTool);
    element("tool-delete").addEventListener("click", chooseTool);
    element("chip-search").addEventListener("input", renderLibrary);
    element("custom-color").addEventListener("input", chooseCustomColor);
    element("cancel-wire").addEventListener("click", cancelWire);
    element("undo").addEventListener("click", undoEdit);
    element("redo").addEventListener("click", redoEdit);
    element("zoom-in").addEventListener("click", zoomIn);
    element("zoom-out").addEventListener("click", zoomOut);
    element("fit-board").addEventListener("click", fitBoard);
    element("show-internals").addEventListener("change", changeDisplayOptions);
    element("show-levels").addEventListener("change", changeDisplayOptions);
    for (const button of document.querySelectorAll(".pulse-button")) {
        button.addEventListener("pointerdown", pressPulseButton);
        button.addEventListener("pointerup", releasePulseButton);
        button.addEventListener("pointercancel", releasePulseButton);
        button.addEventListener("click", clickPulseButton);
    }
    window.addEventListener("blur", releasePulseButton);
    element("power-toggle").addEventListener("change", changePower);
    element("new-project").addEventListener("click", newProject);
    element("load-preset").addEventListener("click", loadPreset);
    element("export-project").addEventListener("click", exportProject);
    element("import-project").addEventListener("click", chooseImport);
    element("import-file").addEventListener("change", importProject);
    element("project-name").addEventListener("change", renameProject);
    element("export-image").addEventListener("click", exportImage);
    element("connect-endpoints").addEventListener("click", connectByName);
    element("tab-inspect").addEventListener("click", changeTab);
    element("tab-wires").addEventListener("click", changeTab);
    element("tab-diagnostics").addEventListener("click", changeTab);
    element("tab-notes").addEventListener("click", changeTab);
    element("input-count").addEventListener("change", changeIoCount);
    element("output-count").addEventListener("change", changeIoCount);
    element("notes-edit-button").addEventListener("click", editNotes);
    element("notes-preview-button").addEventListener("click", previewNotes);
    element("notes-editor").addEventListener("focus", rememberNotes);
    element("notes-editor").addEventListener("input", updateNotes);
    element("help-button").addEventListener("click", showHelp);
    element("close-help").addEventListener("click", closeHelp);
    document.addEventListener("keydown", keyDown);
}

// 初始化离线工作台，恢复本地结构，寄存器仍从未知状态开始
function start() {
    canvas = element("board-canvas");
    canvas.height = BOARD.height * 2;
    canvas.style.height = BOARD.height + "px";
    let loadError = "";
    let removedCount = 0;
    try {
        readOnly = localStorage.getItem(READ_ONLY_KEY) === "true";
        const savedWorkspace = localStorage.getItem(WORKSPACE_KEY);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (savedWorkspace) {
            workspace = validateWorkspace(JSON.parse(savedWorkspace));
            const beforeCleanup = JSON.stringify(workspace);
            removedCount = cleanWorkspace(workspace).length;
            if (removedCount > 0) {
                localStorage.setItem(CLEANUP_BACKUP_KEY, beforeCleanup);
                localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
            }
            activeExperiment = workspace.activeId;
            state.project = copyProject(workspace.projects[activeExperiment]);
        } else if (saved) {
            state.project = validateProject(JSON.parse(saved));
        } else {
            state.project = complementPreset();
        }
    } catch (error) {
        state.project = complementPreset();
        loadError = "本地电路无法恢复，已打开示例。原文件可重新导入";
    }
    if (activeExperiment === "") {
        activeExperiment = newExperimentId();
        keepExperiment(workspace, activeExperiment, state.project);
    }
    savedExperiments = copyProject(workspace);
    bindEvents();
    createPalette();
    calculate(false);
    renderLibrary();
    fitBoard();
    render();
    refreshIcons();
    updateClock();
    window.setInterval(updateClock, 1000);
    if (loadError !== "") {
        toast(loadError, "warning");
    }
    if (removedCount > 0) {
        toast("已整理 " + removedCount + " 份重复空白或补码实验，整理前的列表已备份", "info");
    }
    if (state.project.name === "双符号位补码运算器") {
        wiringAudit = auditComplement(state.project);
        if (wiringAudit.length > 0) {
            state.activeTab = "diagnostics";
            render();
            toast("这份实验的接线与标准示例有差异。你可以查看诊断面板，或打开一份新的补码示例对照", "warning");
        }
    }
}

start();
