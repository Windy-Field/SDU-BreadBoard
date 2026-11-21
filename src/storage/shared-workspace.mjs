import { SHARED_WORKSPACE, SHARED_WEB_ORIGIN } from "./workspace-settings.mjs";

// 只有本机共享入口使用配对凭证，普通网页沿用自己的浏览器存储
const PAIRING_KEY = "breadboard-shared-web-key";
const PAIRING_TOKEN = /^[a-f0-9-]{72}$/;

// 读取配对网址中的凭证，随后从地址栏移除该片段
function webToken() {
    const prefix = SHARED_WORKSPACE.pairingPrefix;
    if (location.hash.startsWith(prefix)) {
        const token = location.hash.slice(prefix.length);
        if (PAIRING_TOKEN.test(token)) {
            localStorage.setItem(PAIRING_KEY, token);
            history.replaceState(null, "", location.pathname + location.search);
            return token;
        }
    }
    return localStorage.getItem(PAIRING_KEY) || "";
}

// 桌面用 IPC，本机网页用同源请求，两者返回相同的读写接口
export function sharedWorkspaceClient() {
    if (window.breadboardWorkspace) {
        return window.breadboardWorkspace;
    }
    if (location.origin !== SHARED_WEB_ORIGIN) {
        return null;
    }
    const token = webToken();

    // 访问本机工作区并在连接失败或超时时给出可读结果
    async function request(method, change) {
        const options = {
            method: method,
            headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(SHARED_WORKSPACE.timeout),
            cache: "no-store"
        };
        if (change) {
            options.body = JSON.stringify(change);
        }
        const response = await fetch(SHARED_WORKSPACE.route, options);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error);
        }
        return result;
    }

    // 读取最新修订的工作区
    function read() {
        return request("GET");
    }

    // 保存时把读取到的版本一起带回服务
    function write(change) {
        return request("PUT", change);
    }

    return { read: read, write: write };
}
