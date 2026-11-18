import * as acorn from "acorn";
import fs from "node:fs";
import path from "node:path";

// 只检查自有模块，依赖、发布包和浏览器构建产物不属于手写代码
const ROOT = process.cwd();
const SOURCE_DIRECTORIES = ["src", "desktop", "scripts", "tests"];
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const ENGLISH_FILENAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*\.(?:js|mjs|cjs)$/;
const UNCLEAR_NAME = /^(?:[a-z]|[a-z]\d+|tmp|data\d+)$/;
// 禁止出现在自有源码中的语法节点，可按代码规范调整
const FORBIDDEN = new Set([
    "ArrowFunctionExpression", "ConditionalExpression", "UpdateExpression", "SpreadElement",
    "RestElement", "ObjectPattern", "ArrayPattern", "ChainExpression", "SequenceExpression"
]);
// 三次连续调用开始妨碍逐步阅读，先把中间结果存入变量再继续
const MAX_CHAIN_CALLS = 2;

// 把语法树位置写入错误消息，方便直接定位不符合规范的代码
function reportStyleError(filename, value, message) {
    const position = value.loc.start;
    throw new Error(filename + ":" + position.line + ":" + (position.column + 1) + " " + message);
}

// 从声明前找到最近一条注释，导出关键字不影响说明与声明的对应关系
function checkDeclarationComment(value, source, filename) {
    let preceding = source.slice(0, value.start);
    const trimmed = preceding.trimEnd();
    if (trimmed.endsWith("export")) {
        preceding = trimmed.slice(0, -6);
    }
    const before = preceding.trimEnd();
    const lines = before.split("\n");
    const previous = lines[lines.length - 1].trim();
    if (!previous.startsWith("//") || !/[\u4e00-\u9fff]/.test(previous)) {
        reportStyleError(filename, value, value.id.name + " 缺少中文说明");
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
        reportStyleError(filename, value, "存在连续多次调用，请保存中间结果");
    }
}

// 中文说明不以句号收尾，技术术语和说明中的其他标点保持原样
function checkComments(comments, filename) {
    for (const comment of comments) {
        if (/[\u4e00-\u9fff]/.test(comment.value) && /[。．.]\s*$/.test(comment.value)) {
            reportStyleError(filename, comment, "中文注释末尾包含句号");
        }
    }
}

// 检查局部变量和参数的名称，SVG 属性名等外部约定不在此列
function checkName(identifier, filename) {
    if (!identifier || identifier.type !== "Identifier") {
        return;
    }
    if (UNCLEAR_NAME.test(identifier.name)) {
        reportStyleError(filename, identifier, "名称 " + identifier.name + " 没有说明用途");
    }
}

// 同一代码块里的一行只处理一条独立语句，循环头中的分号不算独立语句
function checkStatementLines(statements, filename) {
    let previous = null;
    for (const statement of statements) {
        if (previous && previous.loc.end.line === statement.loc.start.line) {
            reportStyleError(filename, statement, "请把同一行的独立语句分开");
        }
        previous = statement;
    }
}

// 检查单个语法节点是否用了禁止的写法，函数还要检查说明与参数名
function checkSyntax(value, source, filename) {
    if (FORBIDDEN.has(value.type)) {
        reportStyleError(filename, value, "存在不允许的写法：" + value.type);
    }
    if (value.type === "FunctionExpression" && !value.id) {
        reportStyleError(filename, value, "存在匿名函数");
    }
    if (value.type === "AssignmentExpression" && value.operator !== "=") {
        reportStyleError(filename, value, "存在复合赋值");
    }
    if (value.type === "LogicalExpression" && value.operator === "??") {
        reportStyleError(filename, value, "存在空值合并写法");
    }
    if (value.type === "Property" && value.shorthand) {
        reportStyleError(filename, value, "存在对象属性简写");
    }
    const isFunction = value.type === "FunctionDeclaration" || value.type === "FunctionExpression";
    if (isFunction || value.type === "ClassDeclaration") {
        checkDeclarationComment(value, source, filename);
    }
    if (isFunction) {
        for (const parameter of value.params) {
            let name = parameter;
            if (parameter.type === "AssignmentPattern") {
                name = parameter.left;
            }
            checkName(name, filename);
        }
    }
    if (value.type === "VariableDeclarator") {
        checkName(value.id, filename);
    }
    if (value.type === "VariableDeclaration" && value.declarations.length > 1) {
        reportStyleError(filename, value, "请分别声明每个变量");
    }
    if (value.type === "Program" || value.type === "BlockStatement") {
        checkStatementLines(value.body, filename);
    } else if (value.type === "SwitchCase") {
        checkStatementLines(value.consequent, filename);
    }
    if (value.type === "CallExpression") {
        checkCallChain(value, filename);
    }
}

// 递归检查语法树，位置信息不属于需要审查的子节点
function inspectTree(value, source, filename) {
    if (!value || typeof value !== "object") {
        return;
    }
    checkSyntax(value, source, filename);
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

// 读取自有模块并检查名称、注释、句子位置及语法
function checkFile(filename, name) {
    if (!ENGLISH_FILENAME.test(name)) {
        throw new Error(filename + " 请使用英文文件名");
    }
    const source = fs.readFileSync(filename, "utf8");
    const comments = [];
    let sourceType = "module";
    if (name.endsWith(".cjs")) {
        sourceType = "commonjs";
    }
    const tree = acorn.parse(source, {
        ecmaVersion: "latest", sourceType: sourceType, onComment: comments, locations: true
    });
    checkComments(comments, filename);
    inspectTree(tree, source, filename);
}

// 检查一个自有目录中的全部模块，返回已检查文件数
function checkDirectory(directory) {
    let count = 0;
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === "vendor" || entry.name.startsWith(".")) {
            continue;
        }
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            count = count + checkDirectory(filename);
        } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
            checkFile(filename, entry.name);
            count = count + 1;
        }
    }
    return count;
}

let checkedFiles = 0;
for (const directory of SOURCE_DIRECTORIES) {
    const sourceDirectory = path.join(ROOT, directory);
    checkedFiles = checkedFiles + checkDirectory(sourceDirectory);
}
console.log("代码风格检查通过，共检查 " + checkedFiles + " 个自有模块");
