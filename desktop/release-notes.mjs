// 发布说明请求超时后继续显示更新窗口，避免网络问题阻塞安装
const RELEASE_NOTES_SETTINGS = {
    apiRoot: "https://api.github.com",
    timeout: 5000,
    accept: "application/vnd.github.text+json",
    apiVersion: "2022-11-28"
};

// 从GitHub读取指定版本的最新纯文本说明，参数为版本、仓库配置和请求函数
export async function readReleaseNotes(version, settings, request) {
    let tag = version;
    if (settings.vPrefixedTagName) {
        tag = "v" + version;
    }
    const owner = encodeURIComponent(settings.owner);
    const repository = encodeURIComponent(settings.repo);
    const encodedTag = encodeURIComponent(tag);
    const address = RELEASE_NOTES_SETTINGS.apiRoot + "/repos/" + owner + "/" + repository + "/releases/tags/" + encodedTag;
    const response = await request(address, {
        headers: {
            Accept: RELEASE_NOTES_SETTINGS.accept,
            "X-GitHub-Api-Version": RELEASE_NOTES_SETTINGS.apiVersion,
            "Cache-Control": "no-cache"
        },
        cache: "no-store",
        signal: AbortSignal.timeout(RELEASE_NOTES_SETTINGS.timeout)
    });
    if (!response.ok) {
        throw new Error("读取发布说明失败，HTTP " + response.status);
    }
    const release = await response.json();
    if (!release || typeof release !== "object") {
        throw new Error("发布说明接口返回的内容不正确");
    }
    if (release.tag_name !== tag || release.draft || release.prerelease) {
        throw new Error("发布说明与待更新的正式版本不一致");
    }
    if (typeof release.body_text !== "string" || release.body_text.trim() === "") {
        return "此版本暂未填写更新说明";
    }
    return release.body_text.trim();
}

// 每次弹窗前重新读取说明，失败时保留更新操作并明确告知说明暂不可用
export async function updateDialogDetail(version, introduction, settings, request, log, readFallback) {
    let notes;
    try {
        notes = await readReleaseNotes(version, settings, request);
    } catch (error) {
        log(error);
        notes = "暂时无法读取更新说明，可稍后在该版本的 GitHub Release 页面查看";
        if (readFallback) {
            try {
                const previous = await readFallback();
                if (previous.trim() !== "") {
                    notes = previous + "\n\n当前无法刷新，以上为本次检查更新时取得的说明";
                }
            } catch (fallbackError) {
                log(fallbackError);
            }
        }
    }
    return introduction + "\n\n本次更新\n" + notes;
}

// 只选择待更新版本的备用说明，兼容更新库返回字符串或多版本列表
export function selectReleaseNotes(version, releaseNotes) {
    if (typeof releaseNotes === "string") {
        return releaseNotes;
    }
    if (Array.isArray(releaseNotes)) {
        for (const release of releaseNotes) {
            if (release && release.version === version && typeof release.note === "string") {
                return release.note;
            }
        }
    }
    return "";
}

// 在浏览器内用原生解析器将备用HTML转为文本，模板内容不插入页面或执行脚本
export function plainReleaseNotes(source) {
    const template = document.createElement("template");
    template.innerHTML = source;
    for (const element of template.content.querySelectorAll("script, style, iframe, object, embed, img, video, audio, source, link")) {
        element.remove();
    }
    for (const element of template.content.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li, tr, pre, blockquote, br, hr")) {
        element.prepend(document.createTextNode("\n"));
        element.append(document.createTextNode("\n"));
    }
    const text = template.content.textContent;
    const lines = text.split("\n");
    const cleaned = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed !== "") {
            cleaned.push(trimmed);
        }
    }
    return cleaned.join("\n");
}
