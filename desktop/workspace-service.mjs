import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { SHARED_WORKSPACE, SHARED_WEB_ORIGIN } from "../src/storage/workspace-settings.mjs";

// 只提供运行页面及其静态资料，存档只走单独的鉴权入口
const PUBLIC_ROOTS = ["/index.html", "/application.js", "/styles/", "/assets/", "/vendor/", "/examples/", "/docs/"];
const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".pdf": "application/pdf",
    ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json"
};

// 读取现有工作区和修订号，首次使用时返回空记录
function readWorkspace(filename) {
    try {
        return JSON.parse(readFileSync(filename, "utf8"));
    } catch (error) {
        if (error.code === "ENOENT") {
            return { revision: "", workspace: null };
        }
        throw error;
    }
}

// 只有基于当前修订的保存才能生效，同目录替换保证其他窗口只读到完整文件
function writeWorkspace(filename, change, validateWorkspace) {
    const current = readWorkspace(filename);
    if (!change || change.revision !== current.revision) {
        return { conflict: true, revision: current.revision, workspace: current.workspace };
    }
    const workspace = validateWorkspace(change.workspace);
    const next = { revision: randomUUID(), workspace: workspace };
    const content = JSON.stringify(next);
    if (Buffer.byteLength(content) > SHARED_WORKSPACE.maxBytes) {
        throw new Error("共享存档过大，请先导出备份");
    }
    const pending = filename + ".pending";
    try {
        writeFileSync(pending, content, "utf8");
        renameSync(pending, filename);
    } finally {
        rmSync(pending, { force: true });
    }
    return next;
}

// 保留浏览器的配对凭证，桌面重启后仍可连回同一份存档
function loadToken(directory) {
    const filename = path.join(directory, SHARED_WORKSPACE.tokenFile);
    try {
        return readFileSync(filename, "utf8").trim();
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
    const token = randomUUID() + randomUUID();
    writeFileSync(filename, token, { encoding: "utf8", flag: "wx" });
    return token;
}

// 输出 JSON 响应，浏览器每次读取都直接询问本机服务
function sendJson(response, status, result) {
    response.writeHead(status, { "Content-Type": CONTENT_TYPES[".json"], "Cache-Control": "no-store" });
    response.end(JSON.stringify(result));
}

// 限制请求体大小，收到完整内容后才尝试保存
async function readChange(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size = size + chunk.length;
        if (size > SHARED_WORKSPACE.maxBytes) {
            throw new Error("共享存档过大");
        }
        chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    return JSON.parse(body.toString("utf8"));
}

// 网页必须从本机入口打开并携带桌面版发出的凭证
async function serveWorkspace(service, request, response) {
    if (request.headers.authorization !== "Bearer " + service.token) {
        sendJson(response, 401, { error: "请从桌面版重新打开共享网页版" });
        return;
    }
    if (request.method === "GET") {
        sendJson(response, 200, service.read());
        return;
    }
    if (request.method === "PUT" && request.headers.origin === SHARED_WEB_ORIGIN) {
        const change = await readChange(request);
        sendJson(response, 200, service.write(change));
        return;
    }
    sendJson(response, 405, { error: "存档请求不受支持" });
}

// 将允许的网页路径映射到包内资源，路径超出应用目录时拒绝读取
function serveWebFile(root, url, response) {
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") {
        pathname = "/index.html";
    }
    for (const rootPath of PUBLIC_ROOTS) {
        const folder = rootPath.endsWith("/");
        if (pathname !== rootPath && (!folder || !pathname.startsWith(rootPath))) {
            continue;
        }
        const filename = path.resolve(root, "." + pathname);
        const relative = path.relative(root, filename);
        if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
            break;
        }
        const normalized = "/" + relative.split(path.sep).join("/");
        if (normalized !== rootPath && (!folder || !normalized.startsWith(rootPath))) {
            break;
        }
        const content = readFileSync(filename);
        const type = CONTENT_TYPES[path.extname(filename)] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
        response.end(content);
        return;
    }
    sendJson(response, 404, { error: "找不到资源" });
}

// 建立桌面 IPC 和本机网页共用的存档入口，监听范围仅限回环地址
export function startWorkspaceService(directory, root, validateWorkspace, reportError, listen = true) {
    mkdirSync(directory, { recursive: true });
    const filename = path.join(directory, SHARED_WORKSPACE.filename);
    const token = loadToken(directory);

    // 桌面进程直接读取同一个文件
    function read() {
        return readWorkspace(filename);
    }

    // 桌面与网页使用相同的修订核对和格式校验
    function write(change) {
        return writeWorkspace(filename, change, validateWorkspace);
    }

    const service = { read: read, write: write, token: token, server: null };

    // 核对 Host 后再处理请求，其他站点不能通过跨域请求读写存档
    async function handleRequest(request, response) {
        const host = SHARED_WORKSPACE.host + ":" + SHARED_WORKSPACE.port;
        if (request.headers.host !== host) {
            sendJson(response, 403, { error: "仅允许本机地址" });
            return;
        }
        try {
            const url = new URL(request.url, SHARED_WEB_ORIGIN);
            if (url.pathname === SHARED_WORKSPACE.route) {
                await serveWorkspace(service, request, response);
            } else if (request.method === "GET") {
                serveWebFile(root, url, response);
            } else {
                sendJson(response, 405, { error: "请求不受支持" });
            }
        } catch (error) {
            let status = 400;
            if (error.code === "ENOENT") {
                status = 404;
            }
            sendJson(response, status, { error: "本机请求处理失败" });
        }
    }

    if (listen) {
        const server = createServer(handleRequest);
        server.on("error", reportError);
        server.listen(SHARED_WORKSPACE.port, SHARED_WORKSPACE.host);
        service.server = server;
    }
    return service;
}
