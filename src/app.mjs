import { element, node, icon, refreshIcons } from "./ui/dom.mjs";
import { appendChipReference } from "./ui/chip-reference-view.mjs";
import { showToast, dismissToast, clearToasts } from "./ui/toast.mjs";
import { refreshSelect, cleanSelectPanels } from "./ui/select-control.mjs";
import { BOARD, WIRE_COLORS, IO_LIMIT, validIoCount, NOTES_LIMIT, copyProject, emptyProject, endpointLabel, pinHole, placementError, isPhysicalHole } from "./board/board.mjs";
import { CHIP_MODELS } from "./chips/chips.mjs";
import { createRuntime, readEndpoint, simulate } from "./simulation/engine.mjs";
import { createTimingTrace, captureTimingTrace, resetTimingCircuit } from "./simulation/timing-trace.mjs";
import { bindTimingPanel, renderTimingPanel } from "./ui/timing-panel.mjs";
import { renderBoardIo, updateIoLayout } from "./ui/board-io.mjs";
import { encodeCanvasImage } from "./ui/image-export.mjs";
import { bindExportDialog, bindFileExport } from "./ui/export-dialog.mjs";
import { bindTooltips } from "./ui/tooltip.mjs";
import { startAnnouncement } from "./ui/announcement.mjs";
import { COMPLEMENT_RESET_INPUT } from "./experiments/presets.mjs";
import { routeWires, routeNewWire } from "./board/routing.mjs";
import { DRAW, allEndpoints, renderBoard } from "./board/render.mjs";
import { hitTest, hitCandidates, wireHandleAt, nearestEndpoint, chipBounds, wireDisplayPaths } from "./board/geometry.mjs";
import { LIMITS, validateProject, validWireBend } from "./storage/storage.mjs";
import { MOTION, tween, cancelTween, wheelZoomFactor } from "./ui/motion.mjs";
import { markdownFragment } from "./ui/notes.mjs";
import { inspectCircuit } from "./simulation/diagnostics.mjs";
import { CHIP_REFERENCES, sortedChipNames } from "./chips/catalog.mjs";
import { WORKSPACE_KEY, READ_ONLY_KEY, newExperimentId, keepExperiment, validateWorkspace, findBlankExperiment, loadWorkspace } from "./storage/workspace.mjs";
import { CLOCK_SETTINGS } from "./version.mjs";
import { applyInspectionSizes, configureInspectionDivider, resetInspectionLayout } from "./ui/inspection-layout.mjs";
import { openLogicDiagram, bindLogicDiagram } from "./diagram/logic-diagram-view.mjs";
import { bindViewportPan } from "./ui/viewport-pan.mjs";
import { bindViewportSelection } from "./ui/viewport-selection.mjs";
import { rectanglesIntersect, pathIntersectsRectangle } from "./ui/selection-geometry.mjs";

// 界面操作参数：时长单位为毫秒，编辑距离为画布逻辑像素
const SETTINGS = {
    // 新打开页面时采用的走线角度，0 表示自由走线，45 表示斜角走线
    wireAngle: 45,
    // 撤销最多保留的编辑次数
    historyLimit: 80,
    // 板面的缩放上下限和按钮步长
    zoomMinimum: 0.15,
    zoomMaximum: 2,
    zoomStep: 0.15,
    // 连续点击容差与开始拖动的最小距离
    clickTolerance: 7,
    dragThreshold: 4,
    // 适应宽度时画布两侧预留的总空间
    fitPadding: 36,
    // 页脚时钟刷新时间
    clockInterval: 1000
};
// JSON 存档使用固定缩进，方便直接阅读实验文件
const PROJECT_JSON_INDENT = 2;
// 芯片归属板块的点击补偿，和可见面包板上边缘保持一致
const PLACEMENT_OFFSET = 30;
// 键盘触发时的按钮高亮时长，真实脉冲不等待动画
const PULSE_SETTINGS = { feedbackDuration: 160 };
// 面包板只接管左键平移，业务回调保留导线编辑与脉冲操作的优先级
const BOARD_PAN_OPTIONS = {
    buttons: [0],
    activeClass: "board-panning",
    canStart: canPanBoard,
    onStart: prepareBoardPan
};
// 框选只改变界面选择，不改接线或仿真，可在只读模式使用
const BOARD_SELECTION_OPTIONS = { canStart: canSelectBoardArea, onSelect: selectBoardArea };
// 面板和工具的名称同时用于绑定按钮与刷新选中状态
const INSPECTOR_TABS = ["inspect", "timing", "wires", "diagnostics", "notes"];
const BOARD_TOOLS = ["place", "wire", "select", "delete"];
const READ_ONLY_CONTROLS = ["tool-place", "tool-wire", "tool-delete", "input-count", "output-count", "notes-edit-button"];
const CLOCK_FORMATTER = new Intl.DateTimeFormat("zh-CN", CLOCK_SETTINGS);

// 电路结构、真实仿真状态和界面预览分别保存，动画不会改变逻辑电平
const state = {
    project: emptyProject(),
    runtime: createRuntime(),
    result: null,
    timing: createTimingTrace(),
    tool: "wire",
    wireColor: WIRE_COLORS[1],
    wireAngle: SETTINGS.wireAngle,
    selected: null,
    selection: [],
    fixedItems: [],
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
let boardTransitionFirst = null;
let boardTransitionLast = null;
let readOnly = false;
let workspace = null;
let activeExperiment = "";
let circuitDiagnostics = { issues: [], chips: [], power: false, stable: false };
const dirtyExperiments = new Set();
const importedExperiments = new Set();
let savedExperiments = null;
let autoSave = false;
let confirmationAction = null;
let switchAction = null;
let drag = null;
let boardPan = null;
let boardSelection = null;
let ignoreClick = false;
let cycle = { x: -100, y: -100, signature: "", index: 0 };
let catalogModel = "";
let heldPulse = "";
let pulsePointerId = null;
let pulsePointerTarget = null;
let pulseTimer = 0;
let recentAction = "";
let diagnosticToastId = "";
let saveToastId = "";
let powerToastId = "";
let hoverFrame = 0;
let hoverPoint = null;
let routingBusy = false;
const expandedSelection = new Set();

// 更新时间栏，统一使用模块开头的北京时间格式
function updateClock() {
    element("current-time").textContent = CLOCK_FORMATTER.format(new Date());
}

// 把编辑留在内存中；只有手动保存或开启自动保存时才写入浏览器
function stageChanges() {
    keepExperiment(workspace, activeExperiment, state.project);
    dirtyExperiments.add(activeExperiment);
    if (autoSave) {
        saveLocal();
    } else {
        renderSaveStatus();
    }
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
    if (dirtyExperiments.size > 0) {
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
    importedExperiments.delete(activeExperiment);
    const ids = Object.keys(workspace.projects);
    if (ids.length === 0) {
        activeExperiment = newExperimentId();
        state.project = emptyProject();
    } else {
        activeExperiment = ids[0];
        state.project = copyProject(workspace.projects[activeExperiment]);
    }
    keepExperiment(workspace, activeExperiment, state.project);
    const savedIds = Object.keys(savedExperiments.projects);
    if (savedIds.length > 0) {
        savedExperiments.activeId = savedIds[0];
    } else {
        // 没有已保存的实验时，为下次启动保留一份独立空白实验
        const blankId = newExperimentId();
        keepExperiment(savedExperiments, blankId, emptyProject());
    }
    state.saveFailed = false;
    resetExperiment();
    try {
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify(savedExperiments));
    } catch (error) {
        state.saveFailed = true;
        renderSaveStatus();
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

// 选择不同的实验时先恢复下拉框，用户确认后才更新当前实验
function switchExperiment(event) {
    const id = event.currentTarget.value;
    if (id === activeExperiment || !Object.hasOwn(workspace.projects, id)) {
        return;
    }
    renderExperiments();
    requestExperimentSwitch(openExperiment.bind(null, id));
}

// 离开有未保存改动的实验前先询问，action 是确认后执行的切换操作
function requestExperimentSwitch(action) {
    if (!dirtyExperiments.has(activeExperiment)) {
        action();
        return;
    }
    switchAction = action;
    let name = state.project.name.trim();
    if (name === "") {
        name = "未命名实验";
    }
    const message = element("switch-message");
    if (Object.hasOwn(savedExperiments.projects, activeExperiment)) {
        message.textContent = "“" + name + "”有未保存的改动。不保存就切换，切回来时将恢复到上次保存的内容。";
    } else {
        message.textContent = "“" + name + "”还未保存。不保存就切换，这份实验将从列表中移除。";
    }
    element("switch-dialog").showModal();
}

// 取消切换，保留当前实验、撤销记录和未保存的更改
function cancelExperimentSwitch() {
    switchAction = null;
    element("switch-dialog").close();
}

// 关闭确认框并执行待切换操作，保存与否由调用方处理
function finishExperimentSwitch() {
    const action = switchAction;
    cancelExperimentSwitch();
    if (action) {
        action();
    }
}

// 放弃当前改动，不写入存档，也不影响其他待保存的实验
function switchWithoutSaving() {
    const saved = savedExperiments.projects[activeExperiment];
    if (saved) {
        workspace.projects[activeExperiment] = copyProject(saved);
    } else {
        // 没有存档可恢复，也不能在下次保存备份时写入已放弃的实验
        delete workspace.projects[activeExperiment];
        importedExperiments.delete(activeExperiment);
    }
    dirtyExperiments.delete(activeExperiment);
    finishExperimentSwitch();
}

// 写入成功后才切换，失败时留在当前实验以便重试或导出
function saveAndSwitch() {
    if (saveLocal()) {
        finishExperimentSwitch();
        toast("上一份实验已保存", "info");
    } else {
        const message = element("switch-message");
        const failure = "保存失败，可重试，或取消切换后导出 JSON 备份。";
        const warning = "不保存并切换会丢弃本次改动。";
        if (Object.hasOwn(savedExperiments.projects, activeExperiment)) {
            message.textContent = failure + warning;
        } else {
            message.textContent = failure + "不保存并切换会从列表中移除这份实验。";
        }
    }
}

// 打开列表中的实验，切换时不会写入本地存储
function openExperiment(id) {
    activeExperiment = id;
    workspace.activeId = id;
    state.project = copyProject(workspace.projects[id]);
    state.saveFailed = false;
    resetExperiment();
}

// 切换实验后清空上一份的历史记录，重新计算易失状态
function resetExperiment() {
    resetRuntime();
    state.result = null;
    state.timing = createTimingTrace();
    state.undo = [];
    state.redo = [];
    state.notesEditing = false;
    recentAction = "";
    diagnosticToastId = "";
    saveToastId = "";
    powerToastId = "";
    clearToasts();
    calculate(false);
    renderLibrary();
    render();
}

// 打开当前实验的通用诊断，只读取现有结果，不额外触发时钟
function diagnoseCurrentCircuit() {
    circuitDiagnostics = inspectCircuit(state.project, state.result);
    state.activeTab = "diagnostics";
    dismissToast(diagnosticToastId);
    if (circuitDiagnostics.issues.length > 0) {
        diagnosticToastId = showToast("发现 " + circuitDiagnostics.issues.length + " 项诊断，请查看详情", "warning");
    } else if (!state.project.power) {
        diagnosticToastId = showToast("电源已关闭，可查看芯片供电与接线状态", "info");
    } else {
        diagnosticToastId = showToast("当前未发现供电、冲突、短路或逻辑状态异常", "info");
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
    confirmAction("整理走线？", "将按当前走线模式重新计算路径，并替换手动转折点。导线端点、颜色和备注不会改变。此操作可以撤销", applyWireRouting, "确认整理", false);
}

// 完成全部寻路后一次替换路径，计算期间切换或编辑实验时放弃本次结果
async function applyWireRouting() {
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    const angle = state.wireAngle;
    routingBusy = true;
    const waiting = showToast("正在整理走线，请稍候", "info", true);
    render();
    try {
        // 所有实验与逐根接线共用 libavoid 引擎
        const routes = await routeWires(candidate, angle);
        for (const wire of candidate.wires) {
            wire.bends = routes[wire.id];
        }
        for (const wire of candidate.wires) {
            delete wire.angle;
            if (angle === 45) {
                wire.angle = 45;
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
        dismissToast(waiting);
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

// 保存当前实验和待保存的导入批次，返回写入是否成功
function saveLocal() {
    try {
        validateProject(state.project);
        keepExperiment(workspace, activeExperiment, state.project);
        const nextSaved = copyProject(savedExperiments);
        // 导入整份备份时一起保存列表中尚未写入的实验
        for (const id of importedExperiments) {
            if (id !== activeExperiment) {
                const project = workspace.projects[id];
                keepExperiment(nextSaved, id, project);
            }
        }
        keepExperiment(nextSaved, activeExperiment, state.project);
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify(nextSaved));
        savedExperiments = nextSaved;
        for (const id of importedExperiments) {
            dirtyExperiments.delete(id);
        }
        importedExperiments.clear();
        dirtyExperiments.delete(activeExperiment);
        dismissToast(saveToastId);
        saveToastId = "";
        state.saveFailed = false;
        renderSaveStatus();
        return true;
    } catch {
        if (!state.saveFailed) {
            dismissToast(saveToastId);
            saveToastId = showToast("保存失败，当前改动未写入本机。请重试，或导出 JSON 备份。", "warning");
            state.saveFailed = true;
        }
        renderSaveStatus();
        return false;
    }
}

// 手动保存成功时给出反馈，自动保存只更新状态文字
function saveCurrentExperiment() {
    if (saveLocal()) {
        toast("当前实验已保存", "info");
    }
}

// 区分当前实验的未保存改动和仍未写入的导入批次
function renderSaveStatus() {
    const status = element("save-status");
    if (state.saveFailed) {
        status.textContent = "本地保存失败";
    } else if (dirtyExperiments.has(activeExperiment)) {
        status.textContent = "当前实验未保存";
    } else if (importedExperiments.size > 0) {
        status.textContent = "导入的备份未保存";
    } else {
        status.textContent = "无未保存更改";
    }
}

// 更新仿真，按操作名记录电平变化，并按需提示新增的诊断问题
function calculate(notify, action = "仿真更新") {
    const previousResult = state.result;
    state.result = simulate(state.project, state.runtime);
    if (previousResult && previousResult.signature !== state.result.signature) {
        resetTimingCircuit(state.timing, state.project, "接线或器件已更改，原记录已清除");
    } else {
        captureTimingTrace(state.timing, state.result, action);
    }
    updateDiagnostics(notify);
    animateBoard();
}

// 保留本次诊断结果，旧问题解决后撤下提示，只在需要时提示新增问题
function updateDiagnostics(notify) {
    const previousPower = circuitDiagnostics.power;
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
    const previous = state.previousIssues;
    const issuesChanged = previousPower !== circuitDiagnostics.power || current.size !== previous.size || newIssues.length > 0;
    if (issuesChanged) {
        dismissToast(diagnosticToastId);
        diagnosticToastId = "";
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
        diagnosticToastId = showToast(message, kind);
    }
    state.previousIssues = current;
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
        boardTransitionLast = target;
        return;
    }
    if (boardTransitionLast && sameBoardVisual(boardTransitionLast, target)) {
        return;
    }
    boardTransitionFirst = state.visual;
    boardTransitionLast = target;
    tween("board", 0, 1, updateBoardTransition, MOTION.duration);
}

// 比较开关、灯和内部连通的目标，只在画面确实变化时开启动画
function sameBoardVisual(first, second) {
    if (first.internals !== second.internals) {
        return false;
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        if (first.switches[index] !== second.switches[index]) {
            return false;
        }
    }
    for (const name of Object.keys(first.leds)) {
        if (first.leds[name] !== second.leds[name]) {
            return false;
        }
    }
    return true;
}

// 完成编辑后计算并刷新界面，可为时序记录提供本次操作的名称
function commit(action) {
    calculate(true, action);
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

// 检查新导线的孔位和数量，失败时说明原因并返回假
function canConnectWire(first, second) {
    if (editingLocked()) {
        return false;
    }
    if (routingBusy) {
        toast("正在计算走线，请稍候", "info");
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
    return true;
}

// 在合法空孔之间自动寻路，计算成功后一次提交并保留撤销记录
async function connectWire(first, second, bends) {
    if (!canConnectWire(first, second)) {
        return false;
    }
    const wire = { id: nextId(state.project.wires, "W"), from: first, to: second, color: state.wireColor, bends: bends };
    const angle = state.wireAngle;
    if (angle === 45) {
        wire.angle = 45;
    }
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    routingBusy = true;
    const waiting = showToast("正在计算新导线，请稍候", "info", true);
    render();
    try {
        wire.bends = await routeNewWire(candidate, wire, angle);
        if (activeExperiment !== experiment || JSON.stringify(state.project) !== signature || readOnly) {
            toast("实验已切换或修改，本次接线未应用", "info");
            return false;
        }
        const completed = copyProject(candidate);
        completed.wires.push(wire);
        validateProject(completed);
        remember();
        state.project = completed;
        state.pending = null;
        commit();
        return true;
    } catch (error) {
        toast("接线未完成，" + error.message, "warning");
        return false;
    } finally {
        dismissToast(waiting);
        routingBusy = false;
        render();
    }
}

// 切换后续接线与整理使用的角度，已有导线保持当前路径
function changeWireAngle(event) {
    state.wireAngle = 0;
    if (event.currentTarget.value === "45") {
        state.wireAngle = 45;
    }
    renderBoard(canvas, state, endpoints);
}

// 创建器件库按钮，根据搜索词筛选型号
function renderLibrary() {
    const container = element("chip-library");
    container.replaceChildren();
    const searchText = element("chip-search").value.trim();
    const query = searchText.toUpperCase();
    let count = 0;
    for (const model of sortedChipNames()) {
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
function placeCatalogChip(event) {
    if (editingLocked()) {
        return;
    }
    let modelName = catalogModel;
    if (event && event.currentTarget.dataset.model) {
        modelName = event.currentTarget.dataset.model;
    }
    if (modelName === "") {
        return;
    }
    state.placing = modelName;
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
    const section = Math.floor((point.y - BOARD.startY + PLACEMENT_OFFSET) / BOARD.sectionHeight);
    const column = Math.round((point.x - BOARD.startX) / BOARD.pitch) + 1;
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

// 返回对象在当前多选列表中的位置，单击、框选和资料面板共用同一种匹配方式
function selectedTargetIndex(target) {
    for (let index = 0; index < state.selection.length; index = index + 1) {
        const selected = state.selection[index];
        if (selected.kind === target.kind && selected.id === target.id) {
            return index;
        }
    }
    return -1;
}

// 从选择列表移除一个对象，当前对象切换到剩余列表末项，没有剩余时清空
function removeSelectedTarget(target) {
    const index = selectedTargetIndex(target);
    if (index >= 0) {
        state.selection.splice(index, 1);
    }
    state.selected = null;
    if (state.selection.length > 0) {
        state.selected = state.selection[state.selection.length - 1];
    }
}

// 点击已选对象只移除这一项，Ctrl 点击新对象追加，普通点击新对象替换选择
function selectTarget(target, multiple) {
    catalogModel = "";
    const same = target && state.selected && target.kind === state.selected.kind && target.id === state.selected.id;
    if (target && (target.kind === "chip" || target.kind === "wire") && selectedTargetIndex(target) >= 0) {
        removeSelectedTarget(target);
        return;
    }
    if (same && !multiple) {
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
        state.selection.push({ kind: target.kind, id: target.id });
    }
    if (target.kind === "chip") {
        state.activeTab = "inspect";
        lastPinnedChip = "";
    }
}

// 只在选择模式下记录拖线起点，实际移动超过阈值后才建立撤销记录
function pointerDown(event) {
    if (event.button !== 0) {
        return;
    }
    if (state.placing !== "" || state.tool === "place") {
        return;
    }
    const target = hitTest(canvasPoint(event), state, endpoints);
    if (target && target.kind === "pulse") {
        startPointerPulse(event, target.id);
        return;
    }
    if (state.tool !== "select" || readOnly || event.ctrlKey || event.metaKey) {
        return;
    }
    const point = canvasPoint(event);
    const handle = wireHandleAt(point, state.project, state.selected);
    if (handle) {
        if (handle.handle > 0 && handle.handle < handle.points.length - 1 && handle.points.length - 2 > LIMITS.bends) {
            toast("这根线的转折点较多，请先整理走线再调整节点", "info");
            return;
        }
        drag = { wire: handle.wire, handle: handle.handle, points: handle.points, origin: point, moved: false, original: copyProject(state.project) };
        canvas.setPointerCapture(event.pointerId);
    }
}

// 导线节点拖动、脉冲和组合键选择优先，其他鼠标拖动可用于平移
function canPanBoard(event) {
    if (drag || heldPulse !== "" || boardSelection.isSelecting()) {
        return false;
    }
    return !event.ctrlKey && !event.metaKey;
}

// 开始平移时清除孔位提示和接线预览，电路结构与当前选择保持不变
function prepareBoardPan() {
    canvas.title = "";
    leaveBoard();
}

// 导线编辑和左键平移期间不再开始框选，避免同一鼠标同时改变两种状态
function canSelectBoardArea() {
    return !drag && heldPulse === "" && !boardPan.isDragging();
}

// 将屏幕选框换算到面包板坐标，命中芯片外壳或实际导线段时纳入选择
function selectBoardArea(rectangle, multiple) {
    const first = canvasPoint({ clientX: rectangle.left, clientY: rectangle.top });
    const last = canvasPoint({ clientX: rectangle.right, clientY: rectangle.bottom });
    const area = { left: first.x, top: first.y, right: last.x, bottom: last.y };
    const targets = [];
    for (const chip of state.project.chips) {
        const bounds = chipBounds(chip);
        const chipArea = { left: bounds.x, top: bounds.y, right: bounds.x + bounds.width, bottom: bounds.y + bounds.height };
        if (rectanglesIntersect(area, chipArea)) {
            targets.push({ kind: "chip", id: chip.id });
        }
    }
    const paths = wireDisplayPaths(state.project.wires);
    for (let index = 0; index < paths.length; index = index + 1) {
        if (pathIntersectsRectangle(paths[index], area)) {
            targets.push({ kind: "wire", id: state.project.wires[index].id });
        }
    }
    if (!multiple) {
        state.selection = [];
        state.selected = null;
    }
    // 追加时只加入新对象，已经选中的对象不会因为再次框住而取消
    for (const target of targets) {
        if (selectedTargetIndex(target) < 0) {
            state.selection.push(target);
        }
    }
    if (state.selection.length > 0) {
        state.selected = state.selection[state.selection.length - 1];
    }
    catalogModel = "";
    state.activeTab = "inspect";
    lastPinnedChip = "";
    render();
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
        const location = { x: Math.round(point.x), y: Math.round(point.y) };
        if (!validWireBend(location) || point.y > BOARD.height) {
            return;
        }
        const bends = [];
        for (let index = 1; index < drag.points.length - 1; index = index + 1) {
            let bend = drag.points[index];
            if (index === drag.handle) {
                bend = location;
            }
            bends.push(bend);
        }
        wire.bends = bends;
        if (state.wireAngle === 45) {
            wire.angle = 45;
        }
    }
    renderBoard(canvas, state, endpoints);
}

// 松开拖动时检查插孔占用，失败恢复原路径，成功后保存为一次编辑
function pointerUp(event) {
    if (releasePointerPulse(event)) {
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
    const point = canvasPoint(event);
    if (end) {
        const name = nearestEndpoint(point, endpoints);
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
        if (state.wireAngle === 45) {
            wire.angle = 45;
        }
    } else if (!validWireBend(point) || point.y > BOARD.height) {
        state.project = current.original;
        toast("请在画布内放置转折点，原接线已保留", "warning");
        render();
        return;
    }
    state.undo.push(current.original);
    state.redo = [];
    commit();
}

// 浏览器取消手势时恢复原来的导线路径
function cancelPointer(event) {
    releasePointerPulse(event);
    if (drag && drag.moved) {
        state.project = drag.original;
    }
    drag = null;
    renderBoard(canvas, state, endpoints);
}

// 鼠标移动时只重绘画布和孔位文字，不重新计算电路
function movePointer(event) {
    if (boardPan.isDragging() || boardSelection.isSelecting()) {
        return;
    }
    if (drag) {
        dragPointer(event);
        return;
    }
    hoverPoint = { clientX: event.clientX, clientY: event.clientY };
    if (hoverFrame === 0) {
        hoverFrame = window.requestAnimationFrame(updateBoardHover);
    }
}

// 一帧只处理最新的悬停位置，只有高亮或待接导线变化时重绘画布
function updateBoardHover() {
    hoverFrame = 0;
    const point = canvasPoint(hoverPoint);
    state.pointer = point;
    const target = hitTest(point, state, endpoints);
    let hovered = "";
    let status = "面包板";
    let title = "";
    if (target && target.kind === "node") {
        hovered = target.id;
        const value = readEndpoint(state.result, target.id);
        status = endpointLabel(target.id) + " · " + value;
        title = status;
    } else if (target && target.kind === "chip") {
        status = target.id;
        title = target.id;
    }
    setPointerStatus(status, title);
    if (state.hovered !== hovered || state.pending) {
        state.hovered = hovered;
        renderBoard(canvas, state, endpoints);
    }
}

// 只改动实际变化的悬停文字，避免连续移动触发重复的页面更新
function setPointerStatus(status, title) {
    const label = element("pointer-status");
    if (label.textContent !== status) {
        label.textContent = status;
    }
    if (canvas.title !== title) {
        canvas.title = title;
    }
}

// 取消待处理的悬停并清空文字，适用于移出画布或切换实验
function clearBoardHover() {
    if (hoverFrame !== 0) {
        window.cancelAnimationFrame(hoverFrame);
        hoverFrame = 0;
    }
    hoverPoint = null;
    state.hovered = "";
    state.pointer = null;
    setPointerStatus("面包板", "");
}

// 离开画布后移除悬停标记和接线预览
function leaveBoard() {
    const repaint = state.hovered !== "" || Boolean(state.pending && state.pointer);
    clearBoardHover();
    if (repaint) {
        renderBoard(canvas, state, endpoints);
    }
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
            removeFixedItem("chip", chip.id);
        }
    }
    state.project.wires = wires;
    state.project.chips = chips;
    state.selected = null;
    state.selection = [];
    commit();
}

// 删除按钮所属面板中的芯片，不误删上方固定的另一片芯片
function deletePanelChip(event) {
    const chipId = event.currentTarget.dataset.chip;
    if (findChip(chipId)) {
        const target = { kind: "chip", id: chipId };
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
    commit("切换 K" + index);
}

// 让指定脉冲进入有效电平，返回是否真的开始了新脉冲
function startPulse(kind) {
    if (!state.project.power) {
        powerToastId = showToast("电源已关闭，请先打开电源再发脉冲", "warning");
        return false;
    }
    if (heldPulse !== "") {
        return false;
    }
    window.clearTimeout(pulseTimer);
    heldPulse = kind;
    state.pressedPulse = kind;
    if (kind === "P+") {
        state.runtime.pulses.positive = 1;
    } else {
        state.runtime.pulses.negative = 0;
    }
    calculate(true, "按下 " + kind);
    render();
    return true;
}

// 松开时恢复默认电平，P− 在此时产生上升沿
function finishPulse() {
    if (heldPulse === "") {
        return;
    }
    const kind = heldPulse;
    heldPulse = "";
    pulsePointerId = null;
    pulsePointerTarget = null;
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
    calculate(true, "松开 " + kind);
    recentAction = kind + " 单脉冲已完成";
    render();
    pulseTimer = window.setTimeout(clearPulseFeedback, PULSE_SETTINGS.feedbackDuration);
}

// 恢复脉冲按钮的外观，不修改已经完成的逻辑时序
function clearPulseFeedback() {
    state.pressedPulse = "";
    renderPulseButtons();
    updateActionStatus();
    renderBoard(canvas, state, endpoints);
}

// 键盘激活或程序触发点击时也能发出一次完整脉冲
function pulse(kind) {
    if (startPulse(kind)) {
        finishPulse();
    }
}

// 只接受主按键，记录发出脉冲的指针和控件以便正确释放
function startPointerPulse(event, kind) {
    if (event.button !== 0 || !startPulse(kind)) {
        return;
    }
    pulsePointerId = event.pointerId;
    pulsePointerTarget = event.currentTarget;
    pulsePointerTarget.setPointerCapture(pulsePointerId);
}

// 外部脉冲按钮将自己的信号名交给公共指针处理函数
function pressPulseButton(event) {
    const kind = event.currentTarget.dataset.pulse;
    startPointerPulse(event, kind);
}

// 只有发出脉冲的指针及控件可以结束它，返回此次事件是否释放了脉冲
function releasePointerPulse(event) {
    if (event.pointerId !== pulsePointerId || event.currentTarget !== pulsePointerTarget) {
        return false;
    }
    finishPulse();
    return true;
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
    if (state.project.power) {
        dismissToast(powerToastId);
        powerToastId = "";
    }
    let action = "关闭电源";
    if (state.project.power) {
        action = "打开电源";
    }
    commit(action);
}

// 从一侧历史取出实验，恢复前把当前实验留在另一侧
function restoreHistory(source, destination) {
    if (editingLocked()) {
        return;
    }
    if (source.length === 0) {
        return;
    }
    const current = copyProject(state.project);
    destination.push(current);
    state.project = source.pop();
    // 历史只保存接线和开关，不恢复旧寄存器及波形
    resetRuntime();
    resetTimingCircuit(state.timing, state.project, "仿真已重置，原记录已清除");
    state.result = null;
    commit();
}

// 撤销最近的编辑，并将撤销前的实验留给重做
function undoEdit() {
    restoreHistory(state.undo, state.redo);
}

// 重做已撤销的编辑
function redoEdit() {
    restoreHistory(state.redo, state.undo);
}

// 清除易失仿真状态和未完成的操作
function resetRuntime() {
    heldPulse = "";
    pulsePointerId = null;
    pulsePointerTarget = null;
    drag = null;
    ignoreClick = false;
    clearBoardHover();
    cancelTween("board");
    boardTransitionLast = null;
    state.visual.switches = [];
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
    lastPinnedChip = "";
    state.previousIssues = new Set();
    state.fixedItems = [];
    resetInspectionLayout();
}

// 新建或打开一份空白实验前，先处理当前实验的未保存内容
function newProject() {
    const blank = findBlankExperiment(workspace);
    if (blank === activeExperiment) {
        toast("当前实验已经是空白实验", "info");
        return;
    }
    if (blank !== "") {
        requestExperimentSwitch(openExperiment.bind(null, blank));
        return;
    }
    requestExperimentSwitch(createBlankExperiment);
}

// 创建一份独立的空白实验，按当前自动保存设置处理新实验
function createBlankExperiment() {
    const project = emptyProject();
    const count = Object.keys(workspace.projects).length + 1;
    project.name = "空白实验 " + count;
    openNewExperiment(project);
}

// 输入名称时立即更新草稿，让未离开标题框的 Ctrl+S 也能写入新名
function renameProject(event) {
    if (editingLocked()) {
        render();
        return;
    }
    state.project.name = event.currentTarget.value;
    stageChanges();
    renderExperiments();
}

// 保存 JSON 时保留接线和输入状态，选择图片时复用面包板绘图
function createCircuitFile(format) {
    if (format !== "json") {
        return createBoardImage(format);
    }
    const content = JSON.stringify(state.project, null, PROJECT_JSON_INDENT);
    return new Blob([content], { type: "application/json" });
}

// 打开原生文件选择器
function chooseImport() {
    element("import-file").click();
}

// 将新建或导入的电路作为独立实验打开，并更新未保存标记
function openNewExperiment(project) {
    activeExperiment = newExperimentId();
    state.project = project;
    state.saveFailed = false;
    stageChanges();
    resetExperiment();
}

// 导入整份备份时保留当前实验，给新增实验各分配一个独立编号
function importWorkspaceBackup(parsed) {
    const imported = validateWorkspace(parsed);
    for (const id of Object.keys(imported.projects)) {
        const newId = newExperimentId();
        const project = imported.projects[id];
        workspace.projects[newId] = copyProject(project);
        importedExperiments.add(newId);
        dirtyExperiments.add(newId);
    }
    let saved = false;
    if (autoSave) {
        saved = saveLocal();
    }
    render();
    if (saved) {
        toast("实验备份已导入并保存，可在“我的实验”中查看", "info");
    } else if (autoSave) {
        recordPendingImport("实验备份已导入，但自动保存失败。请重试保存", "warning");
    } else {
        recordPendingImport("实验备份已导入，可在“我的实验”中查看。按 Ctrl+S 保存尚未写入的备份", "info");
    }
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
            throw new Error("电路文件过大，最多支持 " + LIMITS.fileBytes + " 字节");
        }
        const content = await file.text();
        const parsed = JSON.parse(content);
        if (parsed.projects) {
            importWorkspaceBackup(parsed);
        } else {
            const candidate = validateProject(parsed);
            requestExperimentSwitch(openNewExperiment.bind(null, candidate));
        }
    } catch (error) {
        let message = "电路文件无法解析，请检查 JSON 格式";
        if (!(error instanceof SyntaxError)) {
            message = error.message;
        }
        toast(message, "error");
    }
    input.value = "";
}

// 保存后撤下需要用户再次保存的导入提示，避免留下已经过期的操作建议
function recordPendingImport(message, kind) {
    dismissToast(saveToastId);
    saveToastId = showToast(message, kind);
}

// 按系统窗口确认的格式编码整张面包板，不包括工具栏
function createBoardImage(format) {
    renderBoard(canvas, state, endpoints);
    return encodeCanvasImage(canvas, format);
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
    const viewport = element("board-viewport");
    const scale = wheelZoomFactor(event, viewport);
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
    renderBoard(canvas, state, endpoints);
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

// 创建统一的芯片资料标题，参数为标题、按钮编号、固定目标和点击处理函数
function createChipHeading(title, buttonId, target, handler) {
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", title, ""));
    const pin = node("button", "", "icon-button");
    pin.id = buttonId;
    pin.dataset.model = target;
    pin.addEventListener("click", handler);
    updatePinButton(pin, target);
    heading.append(pin);
    return heading;
}

// 显示指定芯片的完整详情；prefix 用于区分各份资料的控件编号
function renderChipPanel(container, chip, prefix = "") {
    const title = chip.id + " · " + chip.model;
    const heading = createChipHeading(title, prefix + "pin-chip-info", chip.id, togglePinnedChip);
    heading.lastElementChild.dataset.chip = chip.id;
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "删除芯片");
    remove.append(icon("trash-2"));
    remove.dataset.chip = chip.id;
    remove.addEventListener("click", deletePanelChip);
    heading.insertBefore(remove, heading.lastElementChild);
    container.append(heading, node("p", CHIP_MODELS[chip.model].title + " · 缺口朝左", "inspection-meta"));
    appendChipReference(container, chip);
    const controls = node("div", "", "move-fields");
    controls.dataset.chip = chip.id;
    const sectionLabel = node("label", "板块", "");
    const section = document.createElement("select");
    section.id = prefix + "move-section";
    section.dataset.field = "section";
    for (let index = 0; index < BOARD.sections; index = index + 1) {
        const option = node("option", "第 " + (index + 1) + " 块", "");
        option.value = String(index);
        section.append(option);
    }
    section.value = String(chip.section);
    sectionLabel.append(section);
    const columnLabel = node("label", "起始列", "");
    const column = document.createElement("input");
    column.id = prefix + "move-column";
    column.dataset.field = "column";
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

// 根据按钮所在面板的位置控件移动对应芯片，保留导线在原物理孔
function moveChip(event) {
    if (editingLocked()) {
        return;
    }
    const controls = event.currentTarget.closest(".move-fields");
    const chip = findChip(controls.dataset.chip);
    const section = Number(controls.querySelector("[data-field='section']").value);
    const column = Number(controls.querySelector("[data-field='column']").value);
    const candidate = { id: chip.id, model: chip.model, section: section, column: column };
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

// 判断器件库资料是否已经在上方显示，避免同一份资料占用两块面板
function catalogAlreadyShown() {
    if (hasFixedItem("model", catalogModel)) {
        return true;
    }
    if (state.fixedItems.length > 0 || element("pinned-chip").hidden) {
        return false;
    }
    const selected = state.selected;
    if (!selected || selected.kind !== "chip") {
        return false;
    }
    const chip = findChip(selected.id);
    return chip !== null && chip.model === catalogModel;
}

// 展示单根导线的孔位、电平和删除入口
function renderSelectedWire(container, wire) {
    const route = endpointLabel(wire.from) + " → " + endpointLabel(wire.to);
    const level = readEndpoint(state.result, wire.from);
    const remove = node("button", "删除导线", "button");
    remove.addEventListener("click", deleteSelected);
    container.append(node("h2", wire.id, ""), node("p", route, "inspection-meta"));
    container.append(node("div", String(level), "node-value"), remove);
}

// 展示选中孔的电平、上拉控制以及插在该孔中的芯片脚
function renderSelectedNode(container, name) {
    const value = readEndpoint(state.result, name);
    let level = "Z · 悬空";
    if (value === 1) {
        level = "1 · 高电平";
    } else if (value === 0) {
        level = "0 · 低电平";
    } else if (value === "X") {
        level = "X · 未知或冲突";
    }
    container.append(node("h2", endpointLabel(name), ""), node("p", name, "inspection-meta"));
    container.append(node("div", level, "node-value"));
    const pullUp = node("button", "为此节点添加上拉", "button");
    if (state.project.pullUps.includes(name)) {
        pullUp.textContent = "移除此节点上拉";
    }
    pullUp.disabled = readOnly;
    pullUp.dataset.endpoint = name;
    pullUp.addEventListener("click", togglePullUp);
    container.append(pullUp);
    for (const chip of state.project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (pinHole(chip, pin) === name) {
                const description = chip.id + " 第 " + pin + " 脚 · " + model.labels[pin];
                container.append(node("p", description, "inspection-meta"));
            }
        }
    }
}

// 未选中对象时列出当前电路的器件，仍可从列表跳到某片芯片
function renderInspectionSummary(container) {
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

// 依据选中类型刷新检查面板，更新芯片或多选信息时保留阅读位置
function renderInspection() {
    const container = element("inspect-panel");
    const scrollTop = container.scrollTop;
    container.replaceChildren();
    container.classList.remove("inspection-duplicate");
    if (catalogModel !== "") {
        if (catalogAlreadyShown()) {
            container.classList.add("inspection-duplicate");
        } else {
            renderCatalogInfo(container, catalogModel);
        }
        return;
    }
    if (state.selection.length > 1) {
        renderMultiInspection(container);
        container.scrollTop = scrollTop;
        return;
    }
    const selected = state.selected;
    if (selected && selected.kind === "chip") {
        const chip = findChip(selected.id);
        if (chip) {
            if (hasFixedItem("chip", chip.id) || state.fixedItems.length === 0) {
                container.classList.add("inspection-duplicate");
            } else {
                renderChipPanel(container, chip, "selected-");
                container.scrollTop = scrollTop;
            }
            return;
        }
    } else if (selected && selected.kind === "wire") {
        const wire = findWire(selected.id);
        if (wire) {
            renderSelectedWire(container, wire);
            return;
        }
    } else if (selected && selected.kind === "node") {
        renderSelectedNode(container, selected.id);
        return;
    }
    renderInspectionSummary(container);
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

// 展示型号资料；prefix 区分置顶项的控件编号，不混入芯片的实时电平
function renderCatalogInfo(container, modelName, prefix = "") {
    const model = CHIP_MODELS[modelName];
    const buttonId = prefix + "pin-catalog-info";
    const heading = createChipHeading(modelName, buttonId, modelName, togglePinnedModel);
    container.append(heading, node("p", model.title + " · DIP-" + model.count, "inspection-meta"));
    appendChipReference(container, { model: modelName });
    const place = node("button", "", "button catalog-place");
    place.id = prefix + "place-catalog-chip";
    place.dataset.model = modelName;
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
    removeSelectedTarget({ kind: kind, id: id });
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
    element("inspection-stack").hidden = state.activeTab !== "inspect";
    renderPinnedChip();
    for (const name of INSPECTOR_TABS) {
        const active = name === state.activeTab;
        element(name + "-panel").hidden = !active;
        element("tab-" + name).classList.toggle("active", active);
        element("tab-" + name).setAttribute("aria-selected", String(active));
    }
    renderInspection();
    const inspection = element("inspect-panel");
    const pinned = element("pinned-chip");
    const onlyPinned = inspection.classList.contains("inspection-duplicate");
    const divider = element("inspection-divider");
    divider.hidden = pinned.hidden || onlyPinned || state.activeTab !== "inspect";
    if (!divider.hidden) {
        configureInspectionDivider(divider, pinned.lastElementChild, inspection);
    }
    applyInspectionSizes();
    if (state.activeTab === "wires") {
        renderWireList();
    }
    if (state.activeTab === "diagnostics") {
        renderDiagnostics();
    }
    if (state.activeTab === "notes") {
        renderNotes();
    }
    if (state.activeTab === "timing") {
        renderTimingPanel(state);
    }
    refreshIcons();
}

// 查找指定资料的固定记录，未固定时返回空值
function findFixedItem(kind, id) {
    for (const item of state.fixedItems) {
        if (item.kind === kind && item.id === id) {
            return item;
        }
    }
    return null;
}

// 判断一份型号资料或芯片详情是否已经固定
function hasFixedItem(kind, id) {
    return findFixedItem(kind, id) !== null;
}

// 删除指定固定记录，保留其他资料和各自的高度比例
function removeFixedItem(kind, id) {
    const kept = [];
    for (const item of state.fixedItems) {
        if (item.kind !== kind || item.id !== id) {
            kept.push(item);
        }
    }
    state.fixedItems = kept;
}

// 删除失效的固定条目；没有固定资料时返回当前单选芯片作为预览
function visiblePinnedItems() {
    const items = [];
    for (const item of state.fixedItems) {
        if (item.kind === "model" || findChip(item.id)) {
            items.push(item);
        }
    }
    state.fixedItems = items;
    const shown = items.slice();
    if (shown.length === 0 && state.selection.length <= 1 && state.selected && state.selected.kind === "chip") {
        const chip = findChip(state.selected.id);
        if (chip) {
            shown.push({ kind: "chip", id: chip.id });
        }
    }
    return shown;
}

// 重新排列固定资料及分隔条，并恢复每一项自己的滚动位置
function rebuildPinnedPanes(container, items) {
    const scrollPositions = {};
    for (const pane of container.querySelectorAll(".inspection-pane")) {
        scrollPositions[pane.dataset.key] = pane.scrollTop;
    }
    container.replaceChildren();
    let previous = null;
    for (const item of items) {
        const pane = node("section", "", "inspection-pane");
        pane.dataset.key = item.kind + ":" + item.id;
        pane.dataset.kind = item.kind;
        pane.dataset.id = item.id;
        pane.id = "pane-" + item.kind + "-" + item.id;
        if (previous) {
            const divider = node("div", "", "");
            configureInspectionDivider(divider, previous, pane);
            container.append(divider);
        }
        container.append(pane);
        let prefix = "fixed-" + item.id + "-";
        if (item.kind === "chip") {
            if (!container.querySelector("#pin-chip-info")) {
                prefix = "";
            }
            renderChipPanel(pane, findChip(item.id), prefix);
        } else {
            renderCatalogInfo(pane, item.id, prefix);
        }
        if (Object.hasOwn(scrollPositions, pane.dataset.key)) {
            pane.scrollTop = scrollPositions[pane.dataset.key];
        }
        previous = pane;
    }
}

// 仿真更新时只改引脚的显示值，不重建固定资料及其控件
function refreshPinnedLevels(container) {
    for (const pane of container.querySelectorAll(".inspection-pane[data-kind='chip']")) {
        const chip = findChip(pane.dataset.id);
        for (const cell of pane.querySelectorAll("[data-pin]")) {
            const pin = Number(cell.dataset.pin);
            const value = readEndpoint(state.result, pinHole(chip, pin));
            cell.textContent = String(value);
            cell.classList.toggle("high", value === 1);
            cell.classList.toggle("unknown", value === "X" || value === "Z");
        }
    }
}

// 固定或预览对象改变时重建面板，其他情况下只同步实时电平
function renderPinnedChip() {
    const container = element("pinned-chip");
    if (state.activeTab !== "inspect") {
        container.hidden = true;
        return;
    }
    const items = visiblePinnedItems();
    container.hidden = items.length === 0;
    if (container.hidden) {
        container.replaceChildren();
        lastPinnedChip = "";
        return;
    }
    let key = String(readOnly);
    for (const item of items) {
        const fixed = hasFixedItem(item.kind, item.id);
        key = key + ":" + item.kind + ":" + item.id + ":" + fixed;
    }
    if (lastPinnedChip !== key) {
        rebuildPinnedPanes(container, items);
        lastPinnedChip = key;
    }
    refreshPinnedLevels(container);
}

// 同步固定按钮的图标、提示和按下状态，不改变对象选择
function updatePinButton(button, chipId) {
    const fixed = hasFixedItem("chip", chipId) || hasFixedItem("model", chipId);
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

// 添加或移除一份固定资料，不替换已经固定的其他资料
function toggleFixedItem(kind, id) {
    if (hasFixedItem(kind, id)) {
        removeFixedItem(kind, id);
    } else {
        state.fixedItems.push({ kind: kind, id: id });
    }
    lastPinnedChip = "";
    render();
}

// 根据按钮所属型号固定或取消这一份型号资料
function togglePinnedModel(event) {
    const modelName = event.currentTarget.dataset.model;
    toggleFixedItem("model", modelName);
}

// 固定时记住当前芯片，取消后恢复跟随选择，不删除芯片或改变接线
function togglePinnedChip(event) {
    const chipId = event.currentTarget.dataset.chip;
    toggleFixedItem("chip", chipId);
}

// 更新输入输出的显示位数，物理板仍保留全部 24 个输入和输出端口
function changeIoCount(event) {
    if (editingLocked()) {
        renderBoardIo(state.project, state.result, toggleSwitch);
        return;
    }
    const count = Number(event.currentTarget.value);
    if (!validIoCount(count)) {
        toast("显示位数必须为 1～" + IO_LIMIT + "，请输入整数", "warning");
        renderBoardIo(state.project, state.result, toggleSwitch);
        return;
    }
    remember();
    if (event.currentTarget.id === "input-count") {
        state.project.inputCount = count;
    } else {
        state.project.outputCount = count;
    }
    commit();
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
}

// 切换到清理后的 Markdown 预览
function previewNotes() {
    state.notesEditing = false;
    renderNotes();
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

// 刷新两个脉冲按钮的按下样式和读屏状态
function renderPulseButtons() {
    for (const button of document.querySelectorAll(".pulse-button")) {
        const pressed = button.dataset.pulse === state.pressedPulse;
        button.classList.toggle("pressed", pressed);
        button.setAttribute("aria-pressed", String(pressed));
    }
}

// 同步工具、调色板和只读限制，不改变当前选择或接线
function renderBoardControls() {
    element("read-only-toggle").checked = readOnly;
    element("project-name").readOnly = readOnly;
    for (const id of READ_ONLY_CONTROLS) {
        element(id).disabled = readOnly;
    }
    const arrangement = element("arrange-wires");
    arrangement.disabled = readOnly || routingBusy;
    arrangement.setAttribute("aria-busy", String(routingBusy));
    element("connect-endpoints").disabled = readOnly || routingBusy;
    element("project-name").value = state.project.name;
    element("power-toggle").checked = state.project.power;
    element("undo").disabled = readOnly || state.undo.length === 0;
    element("redo").disabled = readOnly || state.redo.length === 0;
    element("cancel-wire").disabled = !state.pending && state.placing === "";
    for (const name of BOARD_TOOLS) {
        const active = state.tool === name;
        const button = element("tool-" + name);
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", String(active));
    }
    for (const button of element("wire-palette").children) {
        const active = button.dataset.color === state.wireColor;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    }
    element("custom-color").value = state.wireColor;
    const angle = element("wire-angle");
    angle.value = "free";
    if (state.wireAngle === 45) {
        angle.value = "45";
    }
    refreshSelect(angle);
}

// 更新电路计数和模拟状态，接线或放置中的操作优先显示
function renderCircuitStatus() {
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
}

// 刷新整个工作台的可见状态，不在此函数里改变电路
function render() {
    updateActionStatus();
    renderPulseButtons();
    renderSaveStatus();
    renderBoardControls();
    renderCircuitStatus();
    renderBoardIo(state.project, state.result, toggleSwitch);
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
}

// 关闭实验说明对话框
function closeHelp() {
    element("help-dialog").close();
}

// 打开当前项目的逻辑连接图，不修改接线或仿真状态
function showLogicDiagram() {
    openLogicDiagram(state.project, state.result);
}

// 处理全局快捷键，文本输入时不抢占普通编辑操作
function keyDown(event) {
    if (element("announcement-dialog").open) {
        return;
    }
    if (element("export-dialog").open) {
        return;
    }
    const tag = event.target.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (element("switch-dialog").open) {
            saveAndSwitch();
            return;
        }
        saveCurrentExperiment();
        return;
    }
    if (element("confirm-dialog").open || element("switch-dialog").open) {
        return;
    }
    if (element("logic-diagram-dialog").open) {
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

// 连接板面指针、接线工具和缩放控件，平移和框选仍使用通用手势处理
function bindBoardEvents() {
    const viewport = element("board-viewport");
    boardPan = bindViewportPan(viewport, BOARD_PAN_OPTIONS);
    boardSelection = bindViewportSelection(viewport, BOARD_SELECTION_OPTIONS);
    for (const name of BOARD_TOOLS) {
        element("tool-" + name).addEventListener("click", chooseTool);
    }
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", cancelPointer);
    canvas.addEventListener("lostpointercapture", releasePointerPulse);
    canvas.addEventListener("click", clickBoard);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerleave", leaveBoard);
    viewport.addEventListener("wheel", wheelBoard, { passive: false });
    element("arrange-wires").addEventListener("click", requestWireRouting);
    element("connect-endpoints").addEventListener("click", connectByName);
    element("chip-search").addEventListener("input", renderLibrary);
    element("custom-color").addEventListener("input", chooseCustomColor);
    element("wire-angle").addEventListener("change", changeWireAngle);
    element("cancel-wire").addEventListener("click", cancelWire);
    element("zoom-in").addEventListener("click", zoomIn);
    element("zoom-out").addEventListener("click", zoomOut);
    element("fit-board").addEventListener("click", fitBoard);
    element("show-internals").addEventListener("change", changeDisplayOptions);
    element("show-levels").addEventListener("change", changeDisplayOptions);
}

// 绑定会打开、修改或保存实验的操作，以及切换与删除确认
function bindWorkspaceEvents() {
    element("save-project").addEventListener("click", saveCurrentExperiment);
    element("autosave-toggle").addEventListener("change", changeAutoSave);
    element("quick-delete").addEventListener("click", quickDelete);
    element("confirm-cancel").addEventListener("click", cancelConfirmation);
    element("confirm-accept").addEventListener("click", acceptConfirmation);
    element("switch-cancel").addEventListener("click", cancelExperimentSwitch);
    element("switch-dialog").addEventListener("cancel", cancelExperimentSwitch);
    element("switch-without-saving").addEventListener("click", switchWithoutSaving);
    element("switch-save").addEventListener("click", saveAndSwitch);
    window.addEventListener("beforeunload", beforeLeave);
    element("read-only-toggle").addEventListener("change", changeReadOnly);
    element("new-experiment").addEventListener("click", newProject);
    element("experiment-picker").addEventListener("change", switchExperiment);
    element("undo").addEventListener("click", undoEdit);
    element("redo").addEventListener("click", redoEdit);
    element("new-project").addEventListener("click", newProject);
    bindFileExport("export-project", "circuit", createCircuitFile);
    element("import-project").addEventListener("click", chooseImport);
    element("import-file").addEventListener("change", importProject);
    element("project-name").addEventListener("input", renameProject);
    bindFileExport("export-image", "board", createBoardImage);
}

// 脉冲由同一指针按下和释放，窗口失焦时也要恢复默认电平
function bindPulseEvents() {
    for (const button of document.querySelectorAll(".pulse-button")) {
        button.addEventListener("pointerdown", pressPulseButton);
        button.addEventListener("pointerup", releasePointerPulse);
        button.addEventListener("pointercancel", releasePointerPulse);
        button.addEventListener("lostpointercapture", releasePointerPulse);
        button.addEventListener("click", clickPulseButton);
    }
    window.addEventListener("blur", finishPulse);
    element("power-toggle").addEventListener("change", changePower);
    element("input-count").addEventListener("change", changeIoCount);
    element("output-count").addEventListener("change", changeIoCount);
}

// 绑定检查、诊断、时序、备注和逻辑图入口
function bindPanelEvents() {
    for (const name of INSPECTOR_TABS) {
        element("tab-" + name).addEventListener("click", changeTab);
    }
    element("diagnose-circuit").addEventListener("click", diagnoseCurrentCircuit);
    element("notes-edit-button").addEventListener("click", editNotes);
    element("notes-preview-button").addEventListener("click", previewNotes);
    element("notes-editor").addEventListener("focus", rememberNotes);
    element("notes-editor").addEventListener("input", updateNotes);
    element("help-button").addEventListener("click", showHelp);
    element("close-help").addEventListener("click", closeHelp);
    element("view-logic-diagram").addEventListener("click", showLogicDiagram);
    bindLogicDiagram();
    bindTimingPanel(state);
}

// 启动时一次绑定各区域的事件，共用全局快捷键入口
function bindEvents() {
    bindExportDialog();
    bindTooltips();
    bindBoardEvents();
    bindWorkspaceEvents();
    bindPulseEvents();
    bindPanelEvents();
    document.addEventListener("keydown", keyDown);
}

// 启动标准示例时先清零寄存器，再恢复用户保存的清零开关，不改其他输入
function initializeDefaultPreset() {
    const resetValue = state.project.switches[COMPLEMENT_RESET_INPUT];
    state.project.switches[COMPLEMENT_RESET_INPUT] = 0;
    calculate(false);
    state.project.switches[COMPLEMENT_RESET_INPUT] = resetValue;
    calculate(false);
}

// 在 HTML 初始值之外应用项目约束，并准备面包板的绘图尺寸
function prepareWorkbench() {
    canvas = element("board-canvas");
    // 输入约束读取共享配置，HTML 中的初值仅作为加载前的回退
    element("project-name").maxLength = LIMITS.nameLength;
    element("notes-editor").maxLength = NOTES_LIMIT;
    element("input-count").max = String(IO_LIMIT);
    element("output-count").max = String(IO_LIMIT);
    canvas.width = BOARD.width * DRAW.pixelRatio;
    canvas.height = BOARD.height * DRAW.pixelRatio;
    canvas.style.height = BOARD.height + "px";
}

// 恢复本地工程，标准示例启动时清零，其他电路保留上电未知状态
function start() {
    prepareWorkbench();
    const restored = loadWorkspace(window);
    workspace = restored.workspace;
    readOnly = restored.readOnly;
    activeExperiment = workspace.activeId;
    state.project = restored.project;
    savedExperiments = copyProject(workspace);
    bindEvents();
    createPalette();
    calculate(false);
    if (restored.initializePreset) {
        initializeDefaultPreset();
    }
    renderLibrary();
    fitBoard();
    render();
    const inspectionObserver = new ResizeObserver(applyInspectionSizes);
    inspectionObserver.observe(element("inspection-stack"));
    const ioObserver = new ResizeObserver(updateIoLayout);
    ioObserver.observe(document.querySelector(".io-strip"));
    refreshIcons();
    updateClock();
    window.setInterval(updateClock, SETTINGS.clockInterval);
    if (restored.warning !== "") {
        toast(restored.warning, "warning");
    }
    if (restored.removedCount > 0) {
        toast("已整理 " + restored.removedCount + " 份重复空白或补码实验，整理前的列表已备份", "info");
    }
    startAnnouncement();
}

start();
