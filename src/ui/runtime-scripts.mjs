// 同一路径只加载一次，首次操作期间的并发请求共用同一个任务
const loadingScripts = new Map();

// 按需载入本地引擎脚本，失败时清除任务以便下一次操作重试
export function loadRuntimeScript(filename) {
    if (loadingScripts.has(filename)) {
        return loadingScripts.get(filename);
    }
    // 脚本来自构建产物，保持普通script加载以兼容双击打开的离线页面
    function startLoading(resolve, reject) {
        const script = document.createElement("script");
        script.src = filename;
        script.async = true;
        // 本地脚本已执行完成，调用方可以读取其导出的引擎
        function loaded() {
            resolve();
        }
        // 不保留失败脚本，避免一次缺失文件让后续操作永久无法重试
        function failed() {
            loadingScripts.delete(filename);
            script.remove();
            reject(new Error("无法加载本地运行文件：" + filename));
        }
        script.addEventListener("load", loaded, { once: true });
        script.addEventListener("error", failed, { once: true });
        document.head.append(script);
    }
    const loading = new Promise(startLoading);
    loadingScripts.set(filename, loading);
    return loading;
}
