import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// 输入输出配置和校名图片在桌面与窄屏中均需完整显示
const VIEWPORTS = [1600, 1280, 1050, 960, 768, 375, 320];
const REPORT_DIRECTORY = path.join(process.cwd(), "reports", "screenshots");
const LOGO_COLOR = { red: 166, green: 25, blue: 46 };

// 核对原图尺寸、透明背景和红色像素，图片资源不能损坏或被拉伸
async function inspectLogo(source) {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    let opaque = 0;
    let coloredPixel = null;
    for (let index = 0; index < pixels.length; index = index + 4) {
        if (pixels[index + 3] === 0) {
            transparent = transparent + 1;
        } else if (pixels[index + 3] === 255) {
            opaque = opaque + 1;
            coloredPixel = { red: pixels[index], green: pixels[index + 1], blue: pixels[index + 2] };
        }
    }
    return { width: image.naturalWidth, height: image.naturalHeight, transparent: transparent, opaque: opaque, color: coloredPixel };
}

// 图片解码完成后再检查像素，不把加载中误判为透明空图
function logoReady() {
    const image = document.querySelector(".university-logo");
    return image.complete && image.naturalWidth > 0;
}

// 检查图片位于配置上方且原比例显示，配置项不能溢出或与图片重叠
function inspectLogoLayout() {
    const failures = [];
    const image = document.querySelector(".university-logo").getBoundingClientRect();
    const settings = document.querySelector(".io-settings").getBoundingClientRect();
    const fields = document.querySelector(".io-settings-fields").getBoundingClientRect();
    const expectedWidth = image.height * 375 / 106;
    if (Math.abs(image.width - expectedWidth) > 1) {
        failures.push("图片比例改变");
    }
    if (image.bottom > fields.top || image.left < settings.left || image.right > settings.right || fields.bottom > settings.bottom) {
        failures.push("图片与输入输出配置重叠或超宽");
    }
    if (document.documentElement.scrollWidth > window.innerWidth) {
        failures.push("页面超出窗口");
    }
    return failures;
}

// 验证红色透明图片与配置区域布局，不修改展示截图和用户存档
async function main() {
    fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage();
    try {
        const url = pathToFileURL(path.join(process.cwd(), "index.html"));
        await page.goto(url.href);
        await page.waitForFunction(logoReady);
        const logoPath = path.join(process.cwd(), "assets", "branding", "sdu-logo-red.png");
        const logoFile = fs.readFileSync(logoPath);
        const logoSource = "data:image/png;base64," + logoFile.toString("base64");
        const image = await page.evaluate(inspectLogo, logoSource);
        assert.equal(image.width, 375);
        assert.equal(image.height, 106);
        assert.equal(image.transparent, 30515);
        assert.equal(image.opaque, 3491);
        assert.deepEqual(image.color, LOGO_COLOR);
        for (const width of VIEWPORTS) {
            await page.setViewportSize({ width: width, height: 1000 });
            assert.deepEqual(await page.evaluate(inspectLogoLayout), [], "图片与配置布局异常：" + width);
            await page.locator("#input-count").fill("16");
            await page.locator("#input-count").press("Tab");
            assert.equal(await page.locator("#quick-switches button").count(), 16);
            assert.deepEqual(await page.evaluate(inspectLogoLayout), [], "16位输入布局异常：" + width);
            await page.locator("#help-button").click();
            assert.equal(await page.locator("#help-dialog").isVisible(), true);
            await page.keyboard.press("Escape");
            if (width === 1600 || width === 375) {
                const filename = path.join(REPORT_DIRECTORY, "university-logo-" + width + ".png");
                await page.screenshot({ path: filename, fullPage: true });
            }
        }
        await page.locator("#save-project").click();
        console.log("校名图片验证通过：原图比例、红色与透明度、七种视口配置上方位置及16位输入");
    } finally {
        await browser.close();
    }
}

await main();
