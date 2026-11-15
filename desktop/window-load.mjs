// 加载指定窗口的页面，仅在窗口仍存在时报告失败，关闭中的加载中断不再弹窗
export async function loadDesktopPage(window, address, reportError) {
    try {
        await window.loadURL(address);
    } catch (error) {
        if (window.isDestroyed() || window.webContents.isDestroyed()) {
            return;
        }
        reportError(error);
    }
}
