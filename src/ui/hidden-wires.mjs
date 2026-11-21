import { baseNode, endpointLabel, IO_LIMIT, pinHole } from "../board/board.mjs";
import { CHIP_MODELS } from "../chips/chips.mjs";
import { element, icon, node, refreshIcons } from "./dom.mjs";

// 编号和端口按完整名称匹配，避免搜 W1 时也显示 W10
const EXACT_IDENTIFIER = /^(?:[wukl]\d+|u\d+-\d+|p[+-])$/;

// 按面包板自身的连通组记录端口名，搜索时不沿导线扩散到整个电路
function endpointAliases(project) {
    const aliases = new Map();
    for (const prefix of ["K", "L"]) {
        for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
            addAlias(aliases, prefix + bit, prefix + bit, project.wiringVersion);
        }
    }
    for (const name of ["P+", "P-", "GND", "VCC"]) {
        addAlias(aliases, name, name, project.wiringVersion);
    }
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            const hole = pinHole(chip, pin);
            const name = chip.id + "-" + pin;
            addAlias(aliases, hole, name, project.wiringVersion);
        }
    }
    return aliases;
}

// 把可搜索的端口或脚号加入对应孔组，参数为名称表、端点和接线布局版本
function addAlias(aliases, endpoint, name, wiringVersion) {
    const group = baseNode(endpoint, wiringVersion);
    if (!aliases.has(group)) {
        aliases.set(group, []);
    }
    const names = aliases.get(group);
    names.push(name);
}

// 返回一端的孔位和同组端口名，用于区分编号相近的导线
function describeEndpoint(endpoint, aliases, wiringVersion) {
    const group = baseNode(endpoint, wiringVersion);
    const names = aliases.get(group);
    const label = endpointLabel(endpoint);
    if (names) {
        return names.join(" / ") + " · " + label;
    }
    return label;
}

// 按电路中的原顺序整理隐藏导线，保留线号、颜色和两端孔位
function hiddenRows(state) {
    const rows = [];
    if (state.hiddenWires.size === 0) {
        return rows;
    }
    const aliases = endpointAliases(state.project);
    const wiringVersion = state.project.wiringVersion;
    for (const wire of state.project.wires) {
        if (!state.hiddenWires.has(wire.id)) {
            continue;
        }
        const first = describeEndpoint(wire.from, aliases, wiringVersion);
        const last = describeEndpoint(wire.to, aliases, wiringVersion);
        rows.push({ id: wire.id, detail: first + " → " + last, holes: wire.from + " " + wire.to, color: wire.color });
    }
    return rows;
}

// 创建一行导线信息和恢复按钮，点击按钮只恢复这一根
function createHiddenRow(row, restore) {
    const item = node("li", "", "hidden-object-row");
    const swatch = node("span", "", "hidden-wire-swatch");
    swatch.style.backgroundColor = row.color;
    item.append(swatch);
    const description = node("span", "", "hidden-object-description");
    description.append(node("strong", row.id, ""), node("small", row.detail, ""));
    const button = node("button", "", "icon-button");
    button.type = "button";
    button.setAttribute("aria-label", "恢复 " + row.id);
    button.dataset.tip = "恢复 " + row.id;
    button.append(icon("eye"));
    button.addEventListener("click", restore.bind(null, row.id));
    item.append(description, button);
    return item;
}

// 返回该行是否匹配全部关键词，普通文字仍可按片段搜索
function matchesSearch(row, terms) {
    const text = row.id + " " + row.detail + " " + row.holes;
    const searchable = text.toLowerCase();
    const identifiers = searchable.split(/[\s/·→]+/);
    for (const term of terms) {
        if (EXACT_IDENTIFIER.test(term)) {
            if (!identifiers.includes(term)) {
                return false;
            }
        } else if (!searchable.includes(term)) {
            return false;
        }
    }
    return true;
}

// 绑定隐藏导线面板，两个回调分别恢复一根线和全部导线
export function bindHiddenWires(state, onRestore, onRestoreAll) {
    const dialog = element("hidden-objects-dialog");
    const search = element("hidden-objects-search");
    const list = element("hidden-objects-list");
    const empty = element("hidden-objects-empty");
    let rows = [];
    let matches = [];

    // 关闭面板后恢复并定位指定导线，其他隐藏导线保持原状
    function restore(id) {
        dialog.close();
        onRestore(id);
    }

    // 按所有输入的词过滤，允许同时填写两个端点缩小范围
    function filterRows() {
        const query = search.value.trim();
        const lowerCaseQuery = query.toLowerCase();
        const terms = lowerCaseQuery.split(/\s+/);
        const items = document.createDocumentFragment();
        matches = [];
        for (const row of rows) {
            if (matchesSearch(row, terms)) {
                matches.push(row);
                items.append(createHiddenRow(row, restore));
            }
        }
        list.replaceChildren(items);
        list.scrollTop = 0;
        empty.hidden = matches.length > 0;
        empty.textContent = "没有匹配的导线";
        if (rows.length === 0) {
            empty.textContent = "当前没有隐藏导线";
        }
        refreshIcons();
    }

    // 每次打开时按当前电路生成列表，同一个入口也可用快捷键打开
    function openList() {
        rows = hiddenRows(state);
        search.value = "";
        element("restore-all-objects").disabled = rows.length === 0;
        filterRows();
        dialog.showModal();
        search.focus();
    }

    // 搜索结果唯一时可回车恢复，多个匹配时保留选择权
    function restoreMatch(event) {
        if (event.key === "Enter" && !event.isComposing && matches.length === 1) {
            event.preventDefault();
            const row = matches[0];
            restore(row.id);
        }
    }

    // 关闭面板，不改变当前显示状态
    function closeList() {
        dialog.close();
    }

    // 关闭面板后恢复此实验里的所有隐藏导线
    function restoreAll() {
        dialog.close();
        onRestoreAll();
    }

    element("hidden-objects").addEventListener("click", openList);
    element("close-hidden-objects").addEventListener("click", closeList);
    element("restore-all-objects").addEventListener("click", restoreAll);
    search.addEventListener("input", filterRows);
    search.addEventListener("keydown", restoreMatch);
    return openList;
}
