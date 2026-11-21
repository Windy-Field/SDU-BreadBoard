import { element, node } from "./dom.mjs";
import { readEndpoint } from "../simulation/engine.mjs";
import { isWeakBoardInput, TRISTATE_CONTROL } from "../simulation/board-signals.mjs";

// 二进制输出每四位分组，便于从右向左核对端口
const BINARY_GROUP_SIZE = 4;

// 为指定输入位创建开关和灯，点击时由工作台处理电路变更
function createInputControl(bit, onToggle) {
    const name = "K" + bit;
    const wrapper = node("div", "", "quick-input");
    const label = node("span", name, "quick-port-label");
    const led = node("span", "", "io-led");
    led.dataset.inputLed = String(bit);
    led.setAttribute("role", "img");
    const button = node("button", "0", "bit-button");
    button.dataset.bit = String(bit);
    button.setAttribute("aria-label", "切换 " + name);
    button.addEventListener("click", onToggle.bind(null, bit));
    wrapper.append(label, led, button);
    return wrapper;
}

// 仅在输入位数改变时重建开关，以保留平时操作的焦点和动画
function ensureInputControls(count, onToggle) {
    const container = element("quick-switches");
    if (container.children.length === count) {
        return;
    }
    container.replaceChildren();
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
        container.append(createInputControl(bit, onToggle));
    }
}

// 为输入或输出灯设置显示值与读屏名称，只有确定的高电平才点亮
function setLedState(led, name, value) {
    const text = name + "：" + value;
    led.classList.toggle("on", value === 1);
    led.dataset.value = String(value);
    led.setAttribute("aria-label", text);
    led.title = text;
}

// 根据实验当前的输入位数更新开关、指示灯和十进制输入值
function renderInputs(project, result, onToggle, triState) {
    let count = project.inputCount;
    if (triState) {
        count = Math.max(count, TRISTATE_CONTROL + 1);
    }
    ensureInputControls(count, onToggle);
    const switches = element("quick-switches");
    let number = 0;
    for (const button of switches.querySelectorAll("button")) {
        const bit = Number(button.dataset.bit);
        const value = project.switches[bit];
        button.textContent = String(value);
        button.setAttribute("aria-pressed", String(value === 1));
        const led = button.parentElement.querySelector(".io-led");
        const name = "K" + bit;
        led.classList.toggle("weak", isWeakBoardInput(project, triState, bit));
        setLedState(led, name, readEndpoint(result, name));
        number = number * 2 + value;
    }
    element("input-decimal").textContent = String(number);
    element("input-label").textContent = "输入 K" + (count - 1) + "…K0";
}

// 保留输出灯节点以延续点亮动画，位数改变时才重建端口
function renderOutputLeds(count, result) {
    const container = element("output-leds");
    if (container.children.length !== count) {
        container.replaceChildren();
        for (let bit = count - 1; bit >= 0; bit = bit - 1) {
            const wrapper = node("div", "", "output-port");
            const led = node("span", "", "io-led");
            led.dataset.outputLed = String(bit);
            led.setAttribute("role", "img");
            wrapper.append(led, node("span", "L" + bit, "quick-port-label"));
            container.append(wrapper);
        }
    }
    for (const led of container.querySelectorAll("[data-output-led]")) {
        const name = "L" + led.dataset.outputLed;
        setLedState(led, name, readEndpoint(result, name));
    }
}

// 从高位到低位读取输出，只有每位都确定时才显示十进制值
function renderOutputs(project, result) {
    const count = project.outputCount;
    let binary = "";
    let known = true;
    let number = 0;
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
        const value = readEndpoint(result, "L" + bit);
        binary = binary + String(value);
        if (bit > 0 && bit % BINARY_GROUP_SIZE === 0) {
            binary = binary + " ";
        }
        if (value !== 0 && value !== 1) {
            known = false;
        } else {
            number = number * 2 + value;
        }
    }
    element("output-label").textContent = "输出 L" + (count - 1) + "…L0";
    const display = element("binary-result");
    display.textContent = binary;
    display.classList.add("general-binary");
    renderOutputLeds(count, result);
    let meaning = "未知 / 悬空";
    if (!project.power) {
        meaning = "电源关闭";
    } else if (known) {
        meaning = String(number);
    }
    element("result-meaning").textContent = meaning;
}

// 计算快速输入保持单排需要的宽度，包含间距和右侧的十进制数
function inputRowWidth(switches, buttons) {
    const switchStyle = getComputedStyle(switches);
    const input = document.querySelector(".input-block");
    const inputStyle = getComputedStyle(input);
    const switchGap = Number.parseFloat(switchStyle.columnGap);
    const numberGap = Number.parseFloat(inputStyle.columnGap);
    let width = (buttons.length - 1) * switchGap;
    for (const button of buttons) {
        width = width + button.getBoundingClientRect().width;
    }
    const number = element("input-decimal");
    const numberWidth = number.getBoundingClientRect().width;
    return width + numberGap + numberWidth;
}

// 可用宽度不足时先叠放脉冲按钮，再由样式决定是否换行输入开关
export function updateIoLayout() {
    const switches = element("quick-switches");
    const buttons = switches.querySelectorAll(".quick-input");
    if (buttons.length === 0) {
        return;
    }
    const strip = document.querySelector(".io-strip");
    const stripStyle = getComputedStyle(strip);
    const paddingStart = Number.parseFloat(stripStyle.paddingInlineStart);
    const paddingEnd = Number.parseFloat(stripStyle.paddingInlineEnd);
    const groupGap = Number.parseFloat(stripStyle.columnGap);
    const inputWidth = inputRowWidth(switches, buttons);
    const settings = document.querySelector(".io-settings");
    const settingsWidth = settings.getBoundingClientRect().width;
    const output = document.querySelector(".result-block");
    const outputWidth = output.getBoundingClientRect().width;
    const pulseGroup = document.querySelector(".operation-block");
    const pulseStyle = getComputedStyle(pulseGroup);
    const pulseGap = Number.parseFloat(pulseStyle.columnGap);
    const positive = element("pulse-positive");
    const negative = element("pulse-negative");
    const positiveWidth = positive.getBoundingClientRect().width;
    const negativeWidth = negative.getBoundingClientRect().width;
    const pulseWidth = positiveWidth + negativeWidth + pulseGap;
    const requiredWidth = settingsWidth + outputWidth + inputWidth + pulseWidth + groupGap * 3;
    const availableWidth = strip.clientWidth - paddingStart - paddingEnd;
    strip.classList.toggle("pulses-stacked", requiredWidth > availableWidth);
}

// 按当前实验和仿真结果刷新输入输出条，onToggle 接收被点击的输入位编号
export function renderBoardIo(project, result, onToggle, triState, updateLayout = true) {
    renderInputs(project, result, onToggle, triState);
    renderOutputs(project, result);
    if (updateLayout) {
        element("input-count").value = String(project.inputCount);
        element("output-count").value = String(project.outputCount);
        updateIoLayout();
    }
}
