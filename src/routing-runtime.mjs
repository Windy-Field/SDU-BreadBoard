import { AvoidLib } from "libavoid-js";
import { AVOID_WASM_URL } from "../vendor/libavoid-wasm.mjs";

let initialization = null;

// 加载官方移植的布线引擎，浏览器使用随包提供的数据地址，Node 使用依赖内文件
async function loadRoutingRuntime() {
    if (typeof window === "undefined") {
        await AvoidLib.load();
    } else {
        await AvoidLib.load(AVOID_WASM_URL);
    }
    return AvoidLib.getInstance();
}

// 多次请求复用一次初始化，返回可创建 Router 的 libavoid 模块
export function initializeRouting() {
    if (!initialization) {
        initialization = loadRoutingRuntime();
    }
    return initialization;
}
