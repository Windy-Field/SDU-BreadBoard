import { element, node, icon, refreshIcons } from "./dom.mjs";
import { appendChipReference } from "./chip-reference-view.mjs";
import { showToast } from "./toast.mjs";
import { refreshSelect, cleanSelectPanels } from "./select-control.mjs";
import { BOARD, WIRE_COLORS, IO_LIMIT, NOTES_LIMIT, copyProject, emptyProject, endpointLabel, pinHole, placementError, isPhysicalHole } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { createRuntime, readEndpoint, simulate } from "./engine.mjs";
import { complementPreset, restorePresetRoutes } from "./presets.mjs";
import { routeWires } from "./routing.mjs";
import { DRAW, allEndpoints, renderBoard } from "./render.mjs";
import { hitTest, hitCandidates, wireHandleAt, nearestEndpoint } from "./geometry.mjs";
import { LIMITS, STORAGE_KEY, validateProject } from "./storage.mjs";
import { MOTION, tween, fadeContent } from "./motion.mjs";
import { markdownFragment } from "./notes.mjs";
import { inspectCircuit } from "./diagnostics.mjs";
import { CHIP_REFERENCES } from "./catalog.mjs";
import { WORKSPACE_KEY, READ_ONLY_KEY, CLEANUP_BACKUP_KEY, newExperimentId, keepExperiment, validateWorkspace, findBlankExperiment, cleanWorkspace } from "./workspace.mjs";
import { APP_VERSION, CLOCK_SETTINGS } from "./version.mjs";

// 界面操作参数：时长单位为毫秒，距离单位为画布逻辑像素
const SETTINGS = {
    // 撤销最多保留的编辑次数
    historyLimit: 80,
    // 缩放上下限、按钮步长和滚轮灵敏度
    zoomMinimum: 0.15,
    zoomMaximum: 2,
    zoomStep: 0.15,
    wheelSpeed: 0.0015,
    // 连续点击容差与开始拖动的最小距离
    clickTolerance: 7,
    dragThreshold: 4,
    // 适应宽度时画布两侧预留的总空间
    fitPadding: 36,
    // 滚轮按行报告位移时，每行对应的像素数
    wheelLinePixels: 16,
    // 下载地址释放时间和页脚时钟刷新时间
    downloadReleaseDelay: 1000,
    clockInterval: 1000
};
// 键盘触发时的按钮高亮时长，真实脉冲不等待动画
const PULSE_SETTINGS = { feedbackDuration: 160 };

// 电路结构、真实仿真状态和界面预览分别保存，动画不会改变逻辑电平
const state = {
    project: emptyProject(),
    runtime: createRuntime(),
    result: null,
    tool: "wire",
    wireColor: WIRE_COLORS[1],
    selected: null,
    selection: [],
    pinnedChip: "",
    fixedChip: "",
    placing: "",
    pending: null,
    pointer: null,
    hovered: "",
    showInternals: false,
    showLevels: false,
    zoom: 1,
    targetZoom: 1,
    undo: [],
    redo: [],
    activeTab: "inspect",
    notesEditing: false,
    previousIssues: new Set(),
    saveFailed: false,
    pressedPulse: "",
    visual: { switches: [], leds: {}, internals: 0 }
};
const endpoints = allEndpoints();
let canvas = null;
let zoomAnchor = null;
let lastPinnedChip = "";
let lastInputCount = 0;
let boardTransitionFirst = null;
let boardTransitionLast = null;
let readOnly = false;
let workspace = { version: 1, activeId: "", projects: {} };
let activeExperiment = "";
let circuitDiagnostics = { issues: [], chips: [], power: false, stable: false };
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
let routingBusy = false;
const expandedSelection = new Set();

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
function confirmAction(title, message, action, acceptLabel = "确认删除", destructive = true) {
    confirmationAction = action;
    element("confirm-title").textContent = title;
    element("confirm-message").textContent = message;
    const accept = element("confirm-accept");
    accept.textContent = acceptLabel;
    accept.classList.toggle("danger", destructive);
    accept.classList.toggle("primary", !destructive);
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
    refreshSelect(picker);
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
    calculate(false);
    render();
    renderLibrary();
}

// 打开当前实验的通用诊断，只读取现有结果，不额外触发时钟
function diagnoseCurrentCircuit() {
    circuitDiagnostics = inspectCircuit(state.project, state.result);
    state.activeTab = "diagnostics";
    if (circuitDiagnostics.issues.length > 0) {
        toast("发现 " + circuitDiagnostics.issues.length + " 项诊断，请查看右侧详情", "warning");
    } else if (!state.project.power) {
        toast("电源已关闭，可查看芯片供电与接线状态", "info");
    } else {
        toast("当前未发现供电、冲突、短路或逻辑状态异常", "info");
    }
    render();
}

// 整理前说明会替换转折点，保留原电路直到全部路径计算成功
function requestWireRouting() {
    if (editingLocked()) {
        return;
    }
    if (routingBusy) {
        return;
    }
    if (state.project.wires.length === 0) {
        toast("当前实验还没有导线", "info");
        return;
    }
    confirmAction("整理走线？", "程序会调整当前电路的导线路径，绕开芯片并减少重叠；接线端点、线色和备注保持不变。手动转折点将被替换，你可以撤销这次整理", applyWireRouting, "确认整理", false);
}

// 完成全部寻路后一次替换路径，计算期间切换或编辑实验时放弃本次结果
async function applyWireRouting() {
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    routingBusy = true;
    render();
    try {
        // 标准示例复用已验证路径，其他电路使用同一套寻路算法
        if (!restorePresetRoutes(candidate)) {
            const routes = await routeWires(candidate);
            for (const wire of candidate.wires) {
                wire.bends = routes[wire.id];
            }
        }
        if (activeExperiment !== experiment || JSON.stringify(state.project) !== signature || readOnly) {
            toast("实验已切换或修改，本次整理结果未应用", "info");
            return;
        }
        validateProject(candidate);
        remember();
        state.project = candidate;
        state.pending = null;
        state.placing = "";
        state.tool = "select";
        commit();
        toast("走线已整理，电气连接保持不变", "info");
    } catch (error) {
        toast("原接线已保留，" + error.message, "warning");
    } finally {
        routingBusy = false;
        render();
    }
}

// 显示提示并更新状态栏，提示的节点与计时交给独立组件处理
function toast(message, kind) {
    showToast(message, kind);
    recentAction = message;
    updateActionStatus();
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
    circuitDiagnostics = inspectCircuit(state.project, state.result);
    const current = new Set();
    const newIssues = [];
    for (const issue of circuitDiagnostics.issues) {
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
    if (!isPhysicalHole(first) || !isPhysicalHole(second)) {
        toast("导线只能插在面包板或电源轨的孔中，K、L、P 是板载信号名称", "error");
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
        const subtitle = node("small", "", "");
        subtitle.append(document.createTextNode(specification.title + " · "), node("span", "DIP-" + specification.count, "chip-package"));
        description.append(node("strong", model, ""), subtitle);
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

// 选择芯片后同时展示资料并准备放置，只读时仅展示资料
function chooseChip(event) {
    const model = event.currentTarget.dataset.model;
    if (catalogModel === model) {
        catalogModel = "";
        state.placing = "";
        if (state.tool === "place") {
            state.tool = "select";
        }
        renderLibrary();
        render();
        return;
    }
    catalogModel = model;
    state.placing = "";
    if (!readOnly) {
        state.placing = model;
    }
    ignoreClick = false;
    drag = null;
    state.selected = null;
    state.selection = [];
    state.pinnedChip = "";
    state.pending = null;
    state.tool = "place";
    if (readOnly) {
        state.tool = "select";
    }
    state.activeTab = "inspect";
    renderLibrary();
    render();
}

// 从资料面板或工具栏重新进入当前型号的放置状态
function placeCatalogChip() {
    if (editingLocked() || catalogModel === "") {
        return;
    }
    state.placing = catalogModel;
    state.tool = "place";
    ignoreClick = false;
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
    state.tool = "select";
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
    if (Math.hypot(point.x - cycle.x, point.y - cycle.y) < SETTINGS.clickTolerance && signature === cycle.signature && candidates.length > 1) {
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
    if (state.placing !== "" || state.tool === "place") {
        return;
    }
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
    if (!drag.moved && Math.hypot(point.x - drag.origin.x, point.y - drag.origin.y) <= SETTINGS.dragThreshold) {
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
    if (state.tool === "place") {
        state.tool = "select";
    }
    renderLibrary();
    render();
}

// 切换编辑工具，参数来自按钮事件中的工具名称
function chooseTool(event) {
    if (event.currentTarget.id === "tool-place") {
        if (catalogModel === "") {
            toast("请先从左侧器件库选择芯片", "info");
            return;
        }
        placeCatalogChip();
        return;
    }
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

// 确认删除当前所选对象，实际删除时只建立一次撤销记录
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
            delete state.runtime.devices[chip.id];
            if (state.fixedChip === chip.id) {
                state.fixedChip = "";
            }
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
    if (state.tool === "place") {
        state.tool = "select";
    }
    state.selected = null;
    catalogModel = "";
    state.selection = [];
    state.pinnedChip = "";
    lastPinnedChip = "";
    state.fixedChip = "";
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
    commit();
    renderLibrary();
}

// 载入已经核对的补码运算器示例，寄存器需要再次清零
function loadPreset() {
    keepExperiment(workspace, activeExperiment, state.project);
    for (const id of Object.keys(workspace.projects)) {
        if (workspace.projects[id].name === "双符号位补码运算器" && restorePresetRoutes(copyProject(workspace.projects[id]))) {
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
    window.setTimeout(revokeDownload.bind(null, url), SETTINGS.downloadReleaseDelay);
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
        delta = delta * SETTINGS.wheelLinePixels;
    } else if (event.deltaMode === 2) {
        delta = delta * element("board-viewport").clientHeight;
    }
    const scale = Math.exp(-delta * SETTINGS.wheelSpeed);
    changeZoom(state.targetZoom * scale, anchor);
}

// 将面包板调整到工作区可用宽度
function fitBoard() {
    const width = element("board-viewport").clientWidth - SETTINGS.fitPadding;
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
    state.selection = [];
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
    const pin = node("button", "", "icon-button");
    pin.id = "pin-chip-info";
    pin.addEventListener("click", togglePinnedChip);
    heading.append(pin);
    updatePinButton(pin, chip.id);
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
    column.max = String(BOARD.columns);
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
    section.setAttribute("aria-label", "芯片所在板块");
    refreshSelect(section);
    appendChipPinTable(container, chip);
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
    delete state.runtime.devices[chip.id];
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
            let message = "引脚信息显示在上方";
            if (state.fixedChip !== "" && state.fixedChip !== chip.id) {
                message = "上方正在固定显示 " + state.fixedChip + " 的引脚信息";
            }
            container.append(node("h2", chip.id + " · " + chip.model, ""), node("p", message, "inspection-meta"));
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
        const value = readEndpoint(state.result, name);
        let level = "Z · 悬空";
        if (value === 1) {
            level = "1 · 高电平";
        } else if (value === 0) {
            level = "0 · 低电平";
        } else if (value === "X") {
            level = "X · 未知或冲突";
        }
        container.append(node("h2", endpointLabel(name), ""), node("p", name, "inspection-meta"), node("div", level, "node-value"));
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
        } else if (model.bidirectional && model.bidirectional.includes(pin)) {
            kind = "输入/输出";
        } else if (model.outputs.includes(pin)) {
            kind = "输出";
        } else if (!model.inputs.includes(pin)) {
            kind = "空脚 NC";
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
    container.append(node("h2", "当前电路诊断", ""));
    container.append(node("p", "供电、输入、驱动冲突、短路与离散时序状态；不评估纳秒级建立保持时间", "inspection-meta"));
    if (circuitDiagnostics.issues.length === 0) {
        const item = node("div", "", "diagnostic success");
        let message = "当前未发现供电、冲突、短路或逻辑状态异常";
        if (!state.project.power) {
            message = "电源已关闭";
        } else if (state.project.chips.length === 0) {
            message = "当前没有芯片";
        }
        item.append(icon("circle-check"), node("span", message, ""));
        container.append(item);
    }
    for (const issue of circuitDiagnostics.issues) {
        const item = node("div", "", "diagnostic " + issue.severity);
        item.dataset.code = issue.code;
        item.append(icon("triangle-alert"), node("span", issue.message, ""));
        container.append(item);
    }
    for (const chip of circuitDiagnostics.chips) {
        const item = node("section", "", "diagnostic-chip");
        item.dataset.chip = chip.id;
        const heading = node("div", "", "diagnostic-chip-heading");
        heading.append(node("h3", chip.id + " · " + chip.model, ""), node("span", chip.status, "logic-level " + chip.severity));
        item.append(heading, node("p", chip.detail, "inspection-meta"));
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

// 显示固定芯片，未固定时跟随最近选择；固定状态优先于多选和资料查看
function renderPinnedChip() {
    if (state.fixedChip !== "" && !findChip(state.fixedChip)) {
        state.fixedChip = "";
    }
    if (state.fixedChip !== "") {
        state.pinnedChip = state.fixedChip;
    } else if (state.selected && state.selected.kind === "chip") {
        state.pinnedChip = state.selected.id;
    }
    const container = element("pinned-chip");
    if (state.selection.length > 1 && state.fixedChip === "") {
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
        updatePinButton(element("pin-chip-info"), chip.id);
        for (const cell of container.querySelectorAll("[data-pin]")) {
            const value = readEndpoint(state.result, pinHole(chip, Number(cell.dataset.pin)));
            cell.textContent = String(value);
            cell.classList.toggle("high", value === 1);
            cell.classList.toggle("unknown", value === "X" || value === "Z");
        }
    }
}

// 同步固定按钮的图标、提示和按下状态，不改变对象选择
function updatePinButton(button, chipId) {
    const fixed = state.fixedChip === chipId;
    let label = "固定引脚信息";
    let symbol = "pin";
    if (fixed) {
        label = "取消固定引脚信息";
        symbol = "pin-off";
    }
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(fixed));
    button.dataset.tip = label;
    button.classList.toggle("selected", fixed);
    button.replaceChildren(icon(symbol));
}

// 固定时记住当前芯片，取消后恢复跟随选择，不删除芯片或改变接线
function togglePinnedChip() {
    if (state.fixedChip === "") {
        state.fixedChip = state.pinnedChip;
    } else {
        state.fixedChip = "";
        state.pinnedChip = "";
        if (state.selected && state.selected.kind === "chip") {
            state.pinnedChip = state.selected.id;
        }
    }
    lastPinnedChip = "";
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
        toast("显示位数必须为 1～" + IO_LIMIT + "，请输入整数", "warning");
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
    for (const id of ["tool-place", "tool-wire", "tool-delete", "arrange-wires", "connect-endpoints", "input-count", "output-count", "notes-edit-button"]) {
        element(id).disabled = readOnly;
    }
    element("arrange-wires").disabled = readOnly || routingBusy;
    element("arrange-wires").setAttribute("aria-busy", String(routingBusy));
    element("project-name").value = state.project.name;
    element("power-toggle").checked = state.project.power;
    element("undo").disabled = readOnly || state.undo.length === 0;
    element("redo").disabled = readOnly || state.redo.length === 0;
    element("cancel-wire").disabled = !state.pending && state.placing === "";
    for (const name of ["place", "wire", "select", "delete"]) {
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
    element("issue-count").textContent = String(circuitDiagnostics.issues.length);
    element("circuit-count").textContent = state.project.chips.length + " 片芯片 · " + state.project.wires.length + " 根导线";
    let status = "电路稳定";
    if (!state.project.power) {
        status = "电源关闭";
    } else if (circuitDiagnostics.issues.length > 0) {
        status = circuitDiagnostics.issues.length + " 项诊断";
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
    cleanSelectPanels();
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
    element("tool-place").addEventListener("click", chooseTool);
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
    element("diagnose-circuit").addEventListener("click", diagnoseCurrentCircuit);
    element("arrange-wires").addEventListener("click", requestWireRouting);
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
    // 输入约束读取共享配置，HTML 中的初值仅作为加载前的回退
    element("project-name").maxLength = LIMITS.nameLength;
    element("notes-editor").maxLength = NOTES_LIMIT;
    element("input-count").max = String(IO_LIMIT);
    element("output-count").max = String(IO_LIMIT);
    canvas.width = BOARD.width * DRAW.pixelRatio;
    canvas.height = BOARD.height * DRAW.pixelRatio;
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
    window.setInterval(updateClock, SETTINGS.clockInterval);
    if (loadError !== "") {
        toast(loadError, "warning");
    }
    if (removedCount > 0) {
        toast("已整理 " + removedCount + " 份重复空白或补码实验，整理前的列表已备份", "info");
    }
}

start();
