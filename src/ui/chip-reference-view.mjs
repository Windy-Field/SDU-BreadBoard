import { node } from "./dom.mjs";
import { CHIP_REFERENCES } from "../chips/catalog.mjs";

// 在单选和多选检查中复用原厂引脚图、资料链接与功能说明
export function appendChipReference(container, chip) {
    const reference = CHIP_REFERENCES[chip.model];
    if (reference.pinWarning) {
        container.append(node("p", reference.pinWarning, "pin-warning"));
    }
    const figure = node("figure", "", "chip-reference");
    const imageLink = node("a", "", "");
    let imagePath = "assets/pinouts/" + reference.file + ".png";
    if (reference.image) {
        imagePath = reference.image;
    }
    imageLink.href = imagePath;
    imageLink.target = "_blank";
    imageLink.rel = "noopener";
    const image = document.createElement("img");
    image.src = imageLink.href;
    image.alt = chip.model + " DIP 引脚图";
    imageLink.append(image);
    let caption = "原厂顶视图：缺口朝上；画布中的芯片缺口朝左";
    let sourceLabel = "TI 数据手册 · 第 " + reference.page + " 页";
    if (reference.image) {
        caption = "封装引脚图";
        sourceLabel = "查看逻辑符号";
    }
    figure.append(imageLink, node("figcaption", caption, ""));
    const source = node("a", sourceLabel, "datasheet-link");
    source.href = "assets/datasheets/" + reference.file + ".pdf#page=" + reference.page;
    if (reference.logicImage) {
        source.href = reference.logicImage;
    }
    source.target = "_blank";
    source.rel = "noopener";
    container.append(figure, source, node("p", reference.summary, "chip-summary"));
}

