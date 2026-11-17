import { AvoidLib } from "libavoid-js";
import { AVOID_WASM_URL } from "../../vendor/libavoid-wasm.mjs";

// 浏览器布线引擎单独打包，只在接线或整理走线时初始化本地WebAssembly
export async function loadRouting() {
    await AvoidLib.load(AVOID_WASM_URL);
    return AvoidLib.getInstance();
}
