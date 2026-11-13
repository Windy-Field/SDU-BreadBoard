import * as acorn from "acorn";
import fs from "node:fs";
import path from "node:path";

// 检查范围是当前项目目录，第三方和生成文件由下方规则跳过
const ROOT = process.cwd();
// 禁止出现在自有源码中的语法节点，可按代码规范调整
const FORBIDDEN = new Set(["ArrowFunctionExpression", "ConditionalExpression", "UpdateExpression", "SpreadElement", "RestElement", "ObjectPattern", "ArrayPattern", "ChainExpression"]);
// 三次连续调用开始妨碍逐步阅读，先把中间结果存入变量再继续
const MAX_CHAIN_CALLS = 2;

// 从声明前找到最近一条注释，导出关键字不影响说明与声明的对应关系
function checkDeclarationComment(value, source, filename) {
    let preceding = source.slice(0, value.start);
    const trimmed = preceding.trimEnd();
    if (trimmed.endsWith("export")) {
        preceding = trimmed.slice(0, -6);
    }
    const lines = preceding.trimEnd().split("\n");
    const previous = lines[lines.length - 1].trim();
    if (!previous.startsWith("//") || !/[\u4e00-\u9fff]/.test(previous)) {
        throw new Error(filename + " 的 " + value.id.name + " 缺少中文说明");
    }
}

// 统计当前表达式的连续方法调用次数，参数中的独立调用不算链式调用
function checkCallChain(value, filename) {
    let current = value;
    let count = 0;
    while (current && current.type === "CallExpression") {
        count = count + 1;
        if (current.callee.type !== "MemberExpression") {
            break;
        }
        current = current.callee.object;
    }
    if (count > MAX_CHAIN_CALLS) {
        throw new Error(filename + " 存在连续多次调用，请保存中间结果");
    }
}

// 中文说明不以句号收尾，技术术语和说明中的其他标点保持原样
function checkComments(comments, filename) {
    for (const comment of comments) {
        if (/[\u4e00-\u9fff]/.test(comment.value) && /[。．.]\s*$/.test(comment.value)) {
            throw new Error(filename + " 的中文注释末尾包含句号");
        }
    }
}

// 递归检查语法树，拒绝匿名函数、语法糖和缺少函数说明的实现
function inspectTree(value, source, filename) {
    if (!value || typeof value !== "object") {
        return;
    }
    if (FORBIDDEN.has(value.type)) {
        throw new Error(filename + " 存在不允许的写法：" + value.type);
    }
    if (value.type === "FunctionExpression" && !value.id) {
        throw new Error(filename + " 存在匿名函数");
    }
    if (value.type === "AssignmentExpression" && value.operator !== "=") {
        throw new Error(filename + " 存在复合赋值");
    }
    if (value.type === "LogicalExpression" && value.operator === "??") {
        throw new Error(filename + " 存在空值合并写法");
    }
    if (value.type === "Property" && value.shorthand) {
        throw new Error(filename + " 存在对象属性简写");
    }
    if (value.type === "FunctionDeclaration" || value.type === "ClassDeclaration") {
        checkDeclarationComment(value, source, filename);
    }
    if (value.type === "CallExpression") {
        checkCallChain(value, filename);
    }
    for (const key of Object.keys(value)) {
        if (key === "loc") {
            continue;
        }
        const child = value[key];
        if (Array.isArray(child)) {
            for (const entry of child) {
                inspectTree(entry, source, filename);
            }
        } else if (child && typeof child === "object") {
            inspectTree(child, source, filename);
        }
    }
}

// 检查自有源文件，第三方依赖和构建产物不参与源代码风格校验
function checkDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === "vendor" || entry.name.startsWith(".")) {
            continue;
        }
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            checkDirectory(filename);
        } else if (entry.name.endsWith(".mjs")) {
            const source = fs.readFileSync(filename, "utf8");
            const comments = [];
            const tree = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module", onComment: comments });
            checkComments(comments, filename);
            inspectTree(tree, source, filename);
        }
    }
}

checkDirectory(ROOT);
console.log("代码风格检查通过");
