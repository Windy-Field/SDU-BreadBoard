import { loadRuntimeScript } from "../ui/runtime-scripts.mjs";

// 布线浏览器脚本由构建程序单独生成，Node仍直接使用原依赖
const ROUTING_SCRIPT = "vendor/routing-runtime.js";
let initialization = null;

// 加载官方移植的布线引擎，浏览器使用随包提供的数据地址，Node 使用依赖内文件
async function loadRoutingRuntime() {
    if (typeof window === "undefined") {
        const runtime = await import("libavoid-js");
        await runtime.AvoidLib.load();
        return runtime.AvoidLib.getInstance();
    }
    await loadRuntimeScript(ROUTING_SCRIPT);
    return window.BreadboardRouting.loadRouting();
}

// 失败后允许再次初始化，下次接线可以在补齐离线文件后重试
function resetInitialization(error) {
    initialization = null;
    throw error;
}

// 多次请求复用一次初始化，返回可创建 Router 的 libavoid 模块
export function initializeRouting() {
    if (!initialization) {
        initialization = loadRoutingRuntime().catch(resetInitialization);
    }
    return initialization;
}
