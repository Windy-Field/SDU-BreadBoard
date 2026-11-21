import { element } from "./dom.mjs";
import { markdownFragment } from "./notes.mjs";
import { showToast } from "./toast.mjs";

// 更新公告正文时可换一个编号，让已经关闭旧公告的用户看到新内容
const ANNOUNCEMENT_ID = "experiment-wiring-2";
const DISMISSED_KEY = "breadboard-lab-dismissed-announcement";
const ANNOUNCEMENT_MARKDOWN = [
    "欢迎使用本模拟器！你可以在**左侧栏偏下**的地方自由选择存档，打开存档后，点右侧栏最右侧的**备注**即可看到每个输入的用途、实验步骤和预期现象。",
    "",
    "在你接入实物电路前，请你务必**先检查芯片是否正常工作**！！安装时也一定要**检查芯片缺口朝向**，以及**电源线和地线是否接对**！",
    "",
    "> **如果这个项目帮到了你，欢迎到 https://github.com/Windy-Field/SDU-BreadBoard 为项目点个 Star。**"
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
