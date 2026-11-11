import { copyProject, GENERAL_NOTES } from "./board.mjs";
import { validateProject } from "./storage.mjs";

export const WORKSPACE_KEY = "breadboard-lab-workspace-v1";
export const READ_ONLY_KEY = "breadboard-lab-read-only";
export const CLEANUP_BACKUP_KEY = "sdu-breadboard-before-cleanup-v1";

// 判断实验是否仍为空白，名称变化不影响判断，已填写的备注和输入会保留
export function isBlankExperiment(project) {
    if (project.chips.length > 0 || project.wires.length > 0 || project.pullUps.length > 0) {
        return false;
    }
    if (project.notes !== GENERAL_NOTES || project.inputCount !== 8 || project.outputCount !== 8 || !project.power) {
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

// 去掉多余空白和完全相同的补码副本，保留有独立编辑内容的实验
export function cleanWorkspace(workspace) {
    const removed = [];
    let blank = "";
    const signatures = new Map();
    const ids = Object.keys(workspace.projects);
    if (ids.includes(workspace.activeId)) {
        ids.splice(ids.indexOf(workspace.activeId), 1);
        ids.unshift(workspace.activeId);
    }
    for (const id of ids) {
        const project = workspace.projects[id];
        let duplicate = "";
        if (isBlankExperiment(project)) {
            duplicate = blank;
            if (blank === "") {
                blank = id;
            }
        } else if (project.name === "双符号位补码运算器") {
            const signature = JSON.stringify({ chips: project.chips, wires: project.wires, notes: project.notes, inputCount: project.inputCount, outputCount: project.outputCount, pullUps: project.pullUps });
            if (signatures.has(signature)) {
                duplicate = signatures.get(signature);
            } else {
                signatures.set(signature, id);
            }
        }
        if (duplicate !== "") {
            removed.push(id);
            delete workspace.projects[id];
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
    if (!value || value.version !== 1 || typeof value.activeId !== "string" || !value.projects || typeof value.projects !== "object") {
        throw new Error("本地实验列表格式不正确，请导入你保存的实验文件");
    }
    const workspace = { version: 1, activeId: value.activeId, projects: {} };
    for (const id of Object.keys(value.projects)) {
        if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) {
            throw new Error("实验编号格式不正确，请检查保存文件");
        }
        workspace.projects[id] = validateProject(value.projects[id]);
    }
    if (!Object.hasOwn(workspace.projects, workspace.activeId)) {
        throw new Error("当前实验不在列表中，请重新选择实验");
    }
    return workspace;
}
