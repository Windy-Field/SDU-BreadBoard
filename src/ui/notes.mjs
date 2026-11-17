import { marked } from "marked";
import DOMPurify from "dompurify";

// Markdown 可保留的标签与属性，增加项目时要检查脚本注入风险
const MARKDOWN_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "del", "blockquote", "pre", "code", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "input"];
const MARKDOWN_ATTRIBUTES = ["href", "title", "type", "checked", "disabled", "start", "align"];
// 解析器格式开关与允许的链接协议，默认不加载远程图片
const MARKDOWN_OPTIONS = { gfm: true, breaks: true, async: false };
const LINK_PROTOCOLS = /^(https?:|mailto:|#)/i;

// 解析并清理 Markdown，返回安全的文档片段；不允许脚本、图片和事件属性
export function markdownFragment(source) {
    const parsed = marked.parse(source, MARKDOWN_OPTIONS);
    const fragment = DOMPurify.sanitize(parsed, { ALLOWED_TAGS: MARKDOWN_TAGS, ALLOWED_ATTR: MARKDOWN_ATTRIBUTES, RETURN_DOM_FRAGMENT: true });
    for (const anchor of fragment.querySelectorAll("a")) {
        const href = anchor.getAttribute("href");
        if (href && !LINK_PROTOCOLS.test(href)) {
            anchor.removeAttribute("href");
        }
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
    }
    for (const input of fragment.querySelectorAll("input")) {
        input.type = "checkbox";
        input.disabled = true;
    }
    return fragment;
}
