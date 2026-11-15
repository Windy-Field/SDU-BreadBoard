// 只检查正式版，启动后延迟片刻检查，运行期间每小时检查一次
export const UPDATE_SETTINGS = {
    provider: "github",
    owner: "Windy-Field",
    repo: "SDU-BreadBoard",
    vPrefixedTagName: false,
    startupDelay: 15000,
    interval: 3600000,
    releasePage: "https://github.com/Windy-Field/SDU-BreadBoard/releases/latest"
};

// 绑定更新器事件与定时检查，服务对象提供窗口、提示和安装接口，返回停止方法
export function startUpdates(updater, services) {
    let checking = false;
    let downloading = false;
    let downloaded = false;
    let promptedVersion = "";
    let stopped = false;
    updater.autoDownload = !services.portable;
    updater.autoInstallOnAppQuit = false;
    updater.allowPrerelease = false;
    updater.allowDowngrade = false;
    updater.setFeedURL({
        provider: UPDATE_SETTINGS.provider,
        owner: UPDATE_SETTINGS.owner,
        repo: UPDATE_SETTINGS.repo,
        vPrefixedTagName: UPDATE_SETTINGS.vPrefixedTagName
    });

    // 更新失败只记录日志，离线或 GitHub 暂时不可达时不打断电路编辑
    function updateError(error) {
        downloading = false;
        services.log(error);
    }

    // 免安装版提示下载正式安装包，标准安装版交给更新器后台下载
    function updateAvailable(info) {
        downloading = !services.portable;
        if (!services.portable || promptedVersion === info.version || stopped) {
            return;
        }
        promptedVersion = info.version;
        services.offerPortable(info.version, UPDATE_SETTINGS.releasePage).catch(updateError);
    }

    // 下载完成后只提示一次，由桌面入口先检查未保存实验再安装
    function updateDownloaded(info) {
        downloading = false;
        downloaded = true;
        if (stopped) {
            return;
        }
        services.offerInstall(info.version, installDownloaded).catch(updateError);
    }

    // 仅在用户确认且窗口已通过未保存检查后调用标准安装流程
    function installDownloaded() {
        updater.quitAndInstall(false, true);
    }

    // 检查失败后释放运行标记，下一次定时检查可以继续尝试
    async function checkUpdates() {
        if (stopped || checking || downloading || downloaded) {
            return;
        }
        checking = true;
        try {
            await updater.checkForUpdates();
        } catch (error) {
            updateError(error);
        } finally {
            checking = false;
        }
    }

    // 退出应用时移除本模块的定时器和监听，不影响更新器其他功能
    function stopUpdates() {
        stopped = true;
        services.clearTimeout(startupTimer);
        services.clearInterval(intervalTimer);
        updater.removeListener("error", updateError);
        updater.removeListener("update-available", updateAvailable);
        updater.removeListener("update-downloaded", updateDownloaded);
    }

    updater.on("error", updateError);
    updater.on("update-available", updateAvailable);
    updater.on("update-downloaded", updateDownloaded);
    const startupTimer = services.setTimeout(checkUpdates, UPDATE_SETTINGS.startupDelay);
    const intervalTimer = services.setInterval(checkUpdates, UPDATE_SETTINGS.interval);
    return { stop: stopUpdates };
}
