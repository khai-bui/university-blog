import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/submissionService";
import { getErrorMessage } from "../utils/getErrorMessage";
import "./ui.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function embedImageUrls(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (!walker.currentNode.parentElement?.closest("a")) textNodes.push(walker.currentNode);
  }

  const imageUrlPattern = /https?:\/\/[^\s<>"']+/gi;
  const imageExtensionPattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || "";
    imageUrlPattern.lastIndex = 0;
    let match;
    let cursor = 0;
    const fragment = document.createDocumentFragment();
    let changed = false;

    while ((match = imageUrlPattern.exec(text)) !== null) {
      let candidate = match[0];
      let trailing = "";
      while (/[),.!?;:]$/.test(candidate)) {
        trailing = candidate.slice(-1) + trailing;
        candidate = candidate.slice(0, -1);
      }

      let isImageUrl = false;
      try {
        const url = new URL(candidate);
        isImageUrl = ["http:", "https:"].includes(url.protocol)
          && imageExtensionPattern.test(url.pathname);
      } catch {
        isImageUrl = false;
      }
      if (!isImageUrl) continue;

      changed = true;
      fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      const imageElement = document.createElement("img");
      imageElement.src = candidate;
      imageElement.alt = "";
      fragment.append(imageElement, document.createTextNode(trailing));
      cursor = match.index + match[0].length;
    }

    if (changed) {
      fragment.append(document.createTextNode(text.slice(cursor)));
      textNode.replaceWith(fragment);
    }
  });
}

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [image, setImage] = useState(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const imageInput = useRef(null);
  const inlineImageInput = useRef(null);
  const contentEditor = useRef(null);
  const inlineImageUrls = useRef(new Set());
  const [inlineImages, setInlineImages] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => () => {
    inlineImageUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const onImageChange = (e) => {
    const selectedImage = e.target.files?.[0] || null;
    if (!selectedImage) return;

    if (!IMAGE_TYPES.includes(selectedImage.type)) {
      setImage(null);
      setImageAlt("");
      setError("Choose a JPEG, PNG, GIF, or WebP image.");
      e.target.value = "";
      return;
    }
    if (selectedImage.size > MAX_IMAGE_SIZE) {
      setImage(null);
      setImageAlt("");
      setError("Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setError("");
    setImage(selectedImage);
  };

  const removeImage = () => {
    setImage(null);
    setImageAlt("");
    if (imageInput.current) imageInput.current.value = "";
  };

  const insertInlineImage = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    const token = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    inlineImageUrls.current.add(previewUrl);
    setInlineImages((current) => ({ ...current, [token]: { file, previewUrl } }));
    setError("");

    const editor = contentEditor.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      const endRange = document.createRange();
      endRange.selectNodeContents(editor);
      endRange.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(endRange);
    }

    const imageElement = document.createElement("img");
    imageElement.src = previewUrl;
    imageElement.alt = file.name.replace(/\.[^.]+$/, "");
    imageElement.dataset.inlineToken = token;
    imageElement.className = "inline-editor-image";
    const activeRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (activeRange) {
      activeRange.deleteContents();
      activeRange.insertNode(imageElement);
      activeRange.setStartAfter(imageElement);
      activeRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(activeRange);
    } else {
      editor.append(imageElement);
    }
    setForm((current) => ({ ...current, content: editor.innerHTML }));
  };

  const onInlineImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) insertInlineImage(selectedFile);
    e.target.value = "";
  };

  const onContentPaste = (e) => {
    const pastedImage = Array.from(e.clipboardData.items || [])
      .find((item) => item.type.startsWith("image/"));
    if (pastedImage) {
      e.preventDefault();
      const file = pastedImage.getAsFile();
      if (file) insertInlineImage(file);
      return;
    }

    if (Array.from(e.clipboardData.types).includes("text/html")) {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const editorContent = contentEditor.current;
      if (editorContent) setForm((current) => ({ ...current, content: editorContent.innerHTML }));
      const content = editorContent ? editorContent.innerHTML : form.content;
      if (!editorContent?.innerText.trim() && !editorContent?.querySelector("img")) {
        setError("Content is required.");
        setLoading(false);
        return;
      }

      const contentNode = document.createElement("div");
      contentNode.innerHTML = content;
      embedImageUrls(contentNode);
      const referencedTokens = [];
      contentNode.querySelectorAll("img[data-inline-token]").forEach((inlineImage) => {
        const token = inlineImage.dataset.inlineToken;
        if (inlineImages[token]) {
          referencedTokens.push(token);
          inlineImage.setAttribute("src", `inline-image:${token}`);
        }
        inlineImage.removeAttribute("data-inline-token");
        inlineImage.removeAttribute("class");
      });

      await createPost({
        title: form.title.trim(),
        content: contentNode.innerHTML.trim(),
        image,
        imageAlt: imageAlt.trim(),
        inlineImages: [...new Set(referencedTokens)].map((token) => ({
          token,
          file: inlineImages[token].file,
        })),
      });
      navigate("/my-posts", { state: { justSubmitted: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create a new post</h1>
      <p className="muted">Your post will be sent to an administrator for review before being published.</p>
      <form onSubmit={onSubmit} className="card form">
        <label>
          <span>Title</span>
          <input name="title" value={form.title} onChange={onChange} maxLength={200} required />
        </label>
        <div className="content-field">
          <label htmlFor="post-content">Content</label>
          <div
            ref={contentEditor}
            id="post-content"
            className="content-editor"
            contentEditable
            role="textbox"
            aria-label="Post content"
            aria-multiline="true"
            data-placeholder="Write your post here. Paste an image or use the button below to insert one."
            onInput={(e) => {
              const content = e.currentTarget.innerHTML;
              setForm((current) => ({ ...current, content }));
            }}
            onPaste={onContentPaste}
          />
          <div className="editor-actions">
            <button type="button" className="btn image-insert" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => inlineImageInput.current?.click()}>
              Add image in content
            </button>
            <input
              ref={inlineImageInput}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onInlineImageChange}
              tabIndex={-1}
              aria-hidden="true"
            />
            <span className="muted image-help">Paste an image here or choose a file (max 5 MB each).</span>
          </div>
        </div>
        <div className="image-picker">
          <label>
            <span>Cover image (optional)</span>
            <input
              ref={imageInput}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onImageChange}
            />
          </label>
          <p className="muted image-help">JPEG, PNG, GIF, or WebP; maximum 5 MB.</p>
          {image && (
            <>
              {imagePreview && <img className="image-preview" src={imagePreview} alt="Selected cover preview" />}
              <label>
                <span>Image description</span>
                <input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  maxLength={300}
                  placeholder="Describe the image for readers using screen readers"
                />
              </label>
              <button type="button" className="btn danger image-remove" onClick={removeImage}>
                Remove image
              </button>
            </>
          )}
        </div>
        {error && <div className="alert error">{error}</div>}
        <button className="btn primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}