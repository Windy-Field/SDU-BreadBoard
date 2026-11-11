import { marked } from "marked";
import DOMPurify from "dompurify";

const MARKDOWN_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "del", "blockquote", "pre", "code", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "input"];

// 解析并清理 Markdown，返回安全的文档片段；不允许脚本、图片和事件属性
export function markdownFragment(source) {
    const parsed = marked.parse(source, { gfm: true, breaks: true, async: false });
    const fragment = DOMPurify.sanitize(parsed, { ALLOWED_TAGS: MARKDOWN_TAGS, ALLOWED_ATTR: ["href", "title", "type", "checked", "disabled", "start", "align"], RETURN_DOM_FRAGMENT: true });
    for (const anchor of fragment.querySelectorAll("a")) {
        const href = anchor.getAttribute("href");
        if (href && !/^(https?:|mailto:|#)/i.test(href)) {
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
