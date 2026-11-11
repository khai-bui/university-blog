import { createElement, useMemo } from "react";
import { getImageUrl } from "../utils/getImageUrl";

const ALLOWED_TAGS = new Set([
  "a", "b", "blockquote", "br", "div", "em", "h2", "h3",
  "i", "img", "li", "ol", "p", "strong", "u", "ul",
]);

const safeLink = (value) => /^(https?:|mailto:)/i.test(value || "");

function renderNode(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = node.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    return Array.from(node.childNodes).map((child, index) => renderNode(child, `${key}-${index}`));
  }

  if (tag === "img") {
    const src = node.getAttribute("src") || "";
    if (!src.startsWith("/uploads/posts/") && !/^https?:\/\//i.test(src)) return null;
    return createElement("img", {
      key,
      className: "content-image",
      src: getImageUrl(src),
      alt: node.getAttribute("alt") || "",
      loading: "lazy",
    });
  }

  const props = { key };
  if (tag === "a") {
    const href = node.getAttribute("href");
    if (safeLink(href)) props.href = href;
  }
  const children = Array.from(node.childNodes).map((child, index) =>
    renderNode(child, `${key}-${index}`));
  return createElement(tag, props, ...children);
}

export default function PostContent({ content }) {
  const rendered = useMemo(() => {
    const documentNode = new DOMParser().parseFromString(content || "", "text/html");
    return Array.from(documentNode.body.childNodes).map((node, index) =>
      renderNode(node, `content-${index}`));
  }, [content]);

  return <div className="post-content">{rendered}</div>;
}
