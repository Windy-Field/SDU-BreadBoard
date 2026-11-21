import { copyProject, GENERAL_NOTES, PROJECT_DEFAULTS } from "../board/board.mjs";
import { STORAGE_KEY, validateProject } from "./storage.mjs";
import { ramPreset, RAM_EXPERIMENT_ID, RAM_EXPERIMENT_NAME } from "../experiments/ram-preset.mjs";
import { COMPLEMENT_NAME, complementPreset, isComplementPreset } from "../experiments/presets.mjs";
import { centerSavedPresets } from "../experiments/preset-layout.mjs";
import { timingPreset, TIMING_EXPERIMENT_ID, TIMING_EXPERIMENT_NAME } from "../experiments/timing-preset.mjs";

// 本地列表、只读设置和清理前备份的存储键，修改前需安排旧数据迁移
export const WORKSPACE_KEY = "breadboard-lab-workspace-v1";
export const READ_ONLY_KEY = "breadboard-lab-read-only";
export const CLEANUP_BACKUP_KEY = "sdu-breadboard-before-cleanup-v1";
// 多实验文件的格式版本和编号规则与接线布局版本分别维护
const WORKSPACE_VERSION = 1;
const EXPERIMENT_ID_PATTERN = /^[a-zA-Z0-9-]{1,80}$/;

// 建立空的实验列表，调用方可通过 keepExperiment 加入当前实验
function emptyWorkspace() {
    return { version: WORKSPACE_VERSION, activeId: "", projects: {} };
}

// 迁移已保存的实验，写回前先备份原列表，并返回删除的重复项数量
function migrateSavedWorkspace(workspace, storage) {
    const beforeCleanup = JSON.stringify(workspace);
    const centered = centerSavedPresets(workspace);
    const removed = cleanWorkspace(workspace);
    if (centered || removed.length > 0) {
        storage.setItem(CLEANUP_BACKUP_KEY, beforeCleanup);
        storage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
    }
    return removed.length;
}

// 从窗口的本地存储恢复工作区，返回启动所需的实验、设置和提示
export function loadWorkspace(storageOwner) {
    let workspace = emptyWorkspace();
    let project = null;
    let readOnly = false;
    let warning = "";
    let removedCount = 0;
    let initializePreset = false;
    let hasSavedWorkspace = false;
    try {
        // 获取存储对象本身也可能失败，和读写失败一起使用默认实验
        const storage = storageOwner.localStorage;
        readOnly = storage.getItem(READ_ONLY_KEY) === "true";
        const savedWorkspace = storage.getItem(WORKSPACE_KEY);
        const savedProject = storage.getItem(STORAGE_KEY);
        hasSavedWorkspace = Boolean(savedWorkspace || savedProject);
        if (savedWorkspace) {
            workspace = validateWorkspace(JSON.parse(savedWorkspace));
            removedCount = migrateSavedWorkspace(workspace, storage);
            project = copyProject(workspace.projects[workspace.activeId]);
        } else if (savedProject) {
            project = validateProject(JSON.parse(savedProject));
        }
    } catch (error) {
        warning = "本地电路无法恢复，已打开示例。原文件可重新导入";
    }
    if (!project) {
        project = complementPreset();
        initializePreset = true;
        keepExperiment(workspace, newExperimentId(), project);
    } else {
        if (workspace.activeId === "") {
            keepExperiment(workspace, newExperimentId(), project);
        }
        initializePreset = project.power && isComplementPreset(project);
    }
    ensureRamExperiment(workspace);
    ensureTimingExperiment(workspace);
    return {
        workspace: workspace, project: project, readOnly: readOnly, warning: warning,
        removedCount: removedCount, initializePreset: initializePreset, hasSavedWorkspace: hasSavedWorkspace
    };
}

// 首次打开时序功能时加入内置实验，已有存档继续使用原内容
function ensureTimingExperiment(workspace) {
    let ramId = "";
    for (const id of Object.keys(workspace.projects)) {
        const name = workspace.projects[id].name;
        if (id === TIMING_EXPERIMENT_ID || name === TIMING_EXPERIMENT_NAME) {
            return;
        }
        if (id === RAM_EXPERIMENT_ID || name === RAM_EXPERIMENT_NAME) {
            ramId = id;
        }
    }
    const projects = {};
    for (const id of Object.keys(workspace.projects)) {
        projects[id] = workspace.projects[id];
        if (id === ramId) {
            projects[TIMING_EXPERIMENT_ID] = timingPreset();
        }
    }
    if (ramId === "") {
        projects[TIMING_EXPERIMENT_ID] = timingPreset();
    }
    workspace.projects = projects;
}

// 升级时补入RAM实验并放在第二项，已有同名实验或固定编号的用户改动优先保留
export function ensureRamExperiment(workspace) {
    for (const id of Object.keys(workspace.projects)) {
        if (id === RAM_EXPERIMENT_ID || workspace.projects[id].name === RAM_EXPERIMENT_NAME) {
            return false;
        }
    }
    const projects = {};
    const ids = Object.keys(workspace.projects);
    for (let index = 0; index < ids.length; index = index + 1) {
        const id = ids[index];
        projects[id] = workspace.projects[id];
        if (index === 0) {
            projects[RAM_EXPERIMENT_ID] = ramPreset();
        }
    }
    if (ids.length === 0) {
        projects[RAM_EXPERIMENT_ID] = ramPreset();
    }
    workspace.projects = projects;
    return true;
}

// 判断实验是否仍为空白，名称变化不影响判断，已填写的备注和输入会保留
export function isBlankExperiment(project) {
    if (project.chips.length > 0 || project.wires.length > 0 || project.pullUps.length > 0) {
        return false;
    }
    if (project.notes !== GENERAL_NOTES || project.power !== PROJECT_DEFAULTS.power) {
        return false;
    }
    if (project.inputCount !== PROJECT_DEFAULTS.inputCount || project.outputCount !== PROJECT_DEFAULTS.outputCount) {
        return false;
    }
    for (const value of project.switches) {
        if (value !== 0) {
            return false;
        }
    }
    return true;
}

// 找到已有空白实验，新建操作可以直接切回这份实验
export function findBlankExperiment(workspace) {
    for (const id of Object.keys(workspace.projects)) {
        if (isBlankExperiment(workspace.projects[id])) {
            return id;
        }
    }
    return "";
}

// 只去掉内容完全相同的空白或补码副本，优先保留当前实验
export function cleanWorkspace(workspace) {
    const removed = [];
    const signatures = new Set();
    const ids = Object.keys(workspace.projects);
    if (ids.includes(workspace.activeId)) {
        ids.splice(ids.indexOf(workspace.activeId), 1);
        ids.unshift(workspace.activeId);
    }
    for (const id of ids) {
        const project = workspace.projects[id];
        if (!isBlankExperiment(project) && project.name !== COMPLEMENT_NAME) {
            continue;
        }
        const signature = JSON.stringify(project);
        if (signatures.has(signature)) {
            removed.push(id);
            delete workspace.projects[id];
        } else {
            signatures.add(signature);
        }
    }
    return removed;
}

// 生成本地实验编号，用于区分名称相同的独立实验
export function newExperimentId() {
    return crypto.randomUUID();
}

// 保存当前实验到本地实验列表，同一编号只保留最新版本
export function keepExperiment(workspace, id, project) {
    workspace.activeId = id;
    workspace.projects[id] = copyProject(project);
}

// 校验已保存的实验列表，逐一恢复电路结构
export function validateWorkspace(value) {
    if (!value || value.version !== WORKSPACE_VERSION || typeof value.activeId !== "string" || !value.projects || typeof value.projects !== "object") {
        throw new Error("本地实验列表格式不正确，请导入你保存的实验文件");
    }
    const workspace = emptyWorkspace();
    workspace.activeId = value.activeId;
    for (const id of Object.keys(value.projects)) {
        if (!EXPERIMENT_ID_PATTERN.test(id)) {
            throw new Error("实验编号格式不正确，请检查保存文件");
        }
        workspace.projects[id] = validateProject(value.projects[id]);
    }
    if (!Object.hasOwn(workspace.projects, workspace.activeId)) {
        throw new Error("当前实验不在列表中，请重新选择实验");
    }
    return workspace;
}
