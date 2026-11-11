import * as acorn from "acorn";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FORBIDDEN = new Set(["ArrowFunctionExpression", "ConditionalExpression", "UpdateExpression", "SpreadElement", "RestElement", "ObjectPattern", "ArrayPattern"]);

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
    if (value.type === "FunctionDeclaration") {
        let preceding = source.slice(0, value.start);
        if (preceding.trimEnd().endsWith("export")) {
            preceding = preceding.trimEnd().slice(0, -6);
        }
        const lines = preceding.trimEnd().split("\n");
        const previous = lines[lines.length - 1].trim();
        if (!previous.startsWith("//") || !/[\u4e00-\u9fff]/.test(previous)) {
            throw new Error(filename + " 的函数 " + value.id.name + " 缺少中文说明");
        }
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
            const tree = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module" });
            inspectTree(tree, source, filename);
        }
    }
}

checkDirectory(ROOT);
console.log("代码风格检查通过");
