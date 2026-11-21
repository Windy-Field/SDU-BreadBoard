// 三态模式只改变 K0～K7 的驱动强度，K8 仍是普通开关
export const TRISTATE_CONTROL = 8;
export const TRISTATE_FIRST_INPUT = 0;
export const TRISTATE_LAST_INPUT = 7;

// 判断指定开关是否只通过弱上拉或弱下拉驱动连线
export function isWeakBoardInput(project, triState, index) {
    if (!triState || project.switches[TRISTATE_CONTROL] === 1) {
        return false;
    }
    return index >= TRISTATE_FIRST_INPUT && index <= TRISTATE_LAST_INPUT;
}
