// 动效时长单位为毫秒，电路计算不等待动画
export const MOTION = { duration: 180, zoomDuration: 160, toastDuration: 180 };
const transitions = new Map();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;

// 对进行中的数值过渡计算当前值，参数为进度，返回平滑进度
function easing(progress) {
    const remaining = 1 - progress;
    return 1 - remaining * remaining * remaining;
}

// 推进所有数值过渡，回调函数直接接收当前显示值而不影响电路状态
function stepTransitions(time) {
    frame = 0;
    for (const entry of transitions) {
        const key = entry[0];
        const transition = entry[1];
        const progress = Math.min(1, (time - transition.started) / transition.duration);
        const value = transition.first + (transition.last - transition.first) * easing(progress);
        transition.update(value);
        if (progress === 1) {
            transitions.delete(key);
        }
    }
    if (transitions.size > 0) {
        frame = window.requestAnimationFrame(stepTransitions);
    }
}

// 平滑改变一个显示数值，相同名称的新过渡会替换旧过渡，避免快速操作排队
export function tween(key, first, last, update, duration) {
    transitions.delete(key);
    if (reducedMotion.matches || first === last) {
        update(last);
        return;
    }
    transitions.set(key, { first: first, last: last, update: update, duration: duration, started: performance.now() });
    if (frame === 0) {
        frame = window.requestAnimationFrame(stepTransitions);
    }
}

// 取消指定过渡，如果没有其他动效则取消下一帧回调
export function cancelTween(key) {
    transitions.delete(key);
    if (transitions.size === 0 && frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
    }
}
