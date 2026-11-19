import { element } from "./dom.mjs";
import { markdownFragment } from "./notes.mjs";
import { showToast } from "./toast.mjs";

// 更新公告正文时可换一个编号，让已经关闭旧公告的用户看到新内容
const ANNOUNCEMENT_ID = "experiment-wiring-1";
const DISMISSED_KEY = "breadboard-lab-dismissed-announcement";
const ANNOUNCEMENT_MARKDOWN = [
    "本项目提供的实验存档**仅供参考**！",
    "",
    "做计算机组成原理实验时，建议对照课程课件核对存档。有疑问时，可以把存档和对应的课件一起交给 AI 辅助复查。",
    "",
    "> **实际接线以课程要求和实物实验板为准！**"
].join("\n");

// 返回当前公告是否已关闭自动提醒，浏览器拒绝读取时仍可显示公告
function isAnnouncementDismissed() {
    try {
        return localStorage.getItem(DISMISSED_KEY) === ANNOUNCEMENT_ID;
    } catch {
        return false;
    }
}

// 打开公告并带出已保存的选项，手动查看不受提醒设置限制
function openAnnouncement() {
    const checkbox = element("announcement-dismiss");
    checkbox.checked = isAnnouncementDismissed();
    element("announcement-dialog").showModal();
}

// 确认后保存选项并关闭，按 Esc 关闭不会更改提醒设置
function confirmAnnouncement() {
    const checkbox = element("announcement-dismiss");
    const dialog = element("announcement-dialog");
    dialog.close();
    if (checkbox.checked === isAnnouncementDismissed()) {
        return;
    }
    try {
        if (checkbox.checked) {
            localStorage.setItem(DISMISSED_KEY, ANNOUNCEMENT_ID);
        } else {
            localStorage.removeItem(DISMISSED_KEY);
        }
    } catch {
        showToast("浏览器未能保存公告提醒设置", "warning");
    }
}

// 渲染公告、绑定查看入口，并在用户未关闭提醒时自动打开
export function startAnnouncement() {
    const content = element("announcement-content");
    const fragment = markdownFragment(ANNOUNCEMENT_MARKDOWN);
    content.replaceChildren(fragment);
    element("announcement-button").addEventListener("click", openAnnouncement);
    element("announcement-confirm").addEventListener("click", confirmAnnouncement);
    if (!isAnnouncementDismissed()) {
        openAnnouncement();
    }
}
