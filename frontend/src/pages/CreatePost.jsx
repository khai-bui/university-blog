import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPost, getPostForEdit, updatePost } from "../services/submissionService";
import { getTags } from "../services/tagService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getImageUrl } from "../utils/getImageUrl";
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

export default function CreatePost({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = editMode && Boolean(id);
  const [form, setForm] = useState({ title: "", content: "" });
  const [image, setImage] = useState(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState("");
  const [postLoading, setPostLoading] = useState(editing);
  const [postError, setPostError] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingPost, setExistingPost] = useState(null);
  const imageInput = useRef(null);
  const inlineImageInput = useRef(null);
  const contentEditor = useRef(null);
  const inlineImageUrls = useRef(new Set());
  const [inlineImages, setInlineImages] = useState({});

  const loadTags = useCallback(() => {
    setTagsLoading(true);
    setTagsError("");
    getTags()
      .then(setTags)
      .catch((e) => setTagsError(getErrorMessage(e)))
      .finally(() => setTagsLoading(false));
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    if (!editing) return;
    getPostForEdit(id)
      .then((post) => {
        setExistingPost(post);
        setForm({ title: post.title, content: post.content });
        setImageAlt(post.imageAlt || "");
        setExistingImageUrl(post.imageUrl || "");
        setSelectedTagIds(post.tagIds || []);
      })
      .catch((e) => setPostError(getErrorMessage(e)))
      .finally(() => setPostLoading(false));
  }, [editing, id]);

  useEffect(() => {
    if (existingPost && contentEditor.current) {
      contentEditor.current.innerHTML = existingPost.content;
    }
  }, [existingPost]);

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

      const postData = {
        title: form.title.trim(),
        content: contentNode.innerHTML.trim(),
        image,
        imageAlt: imageAlt.trim(),
        tagIds: selectedTagIds,
        inlineImages: [...new Set(referencedTokens)].map((token) => ({
          token,
          file: inlineImages[token].file,
        })),
      };
      if (editing) await updatePost(id, postData);
      else await createPost(postData);
      navigate("/my-posts", { state: { justSubmitted: !editing, justUpdated: editing } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>{editing ? "Edit post" : "Create a new post"}</h1>
      <p className="muted">
        {editing
          ? "Your changes will be sent to an administrator for approval. The post will be hidden until approved."
          : "Your post will be sent to an administrator for review before being published."}
      </p>
      {postLoading && <p className="muted">Loading post...</p>}
      {postError && <div className="alert error">{postError}</div>}
      {!postLoading && !postError && (
      <form onSubmit={onSubmit} className="card form">
        <label>
          <span>Title</span>
          <input name="title" value={form.title} onChange={onChange} maxLength={200} required />
        </label>
        <fieldset className="tag-picker">
          <legend>Post tags</legend>
          {tagsLoading && <p className="muted">Loading available tags...</p>}
          {tagsError && (
            <div className="alert error">
              Could not load tags: {tagsError} <button type="button" className="link" onClick={loadTags}>Try again</button>
            </div>
          )}
          {!tagsLoading && !tagsError && tags.length === 0 && (
            <p className="muted">No tags are available yet.</p>
          )}
          {!tagsLoading && !tagsError && tags.length > 0 && (
            <div className="tag-options">
              {tags.map((tag) => (
                <label key={tag.id} className="tag-option">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={(e) => setSelectedTagIds((current) => (
                      e.target.checked
                        ? [...current, tag.id]
                        : current.filter((id) => id !== tag.id)
                    ))}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
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
            <input
              ref={inlineImageInput}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onInlineImageChange}
              tabIndex={-1}
              aria-hidden="true"
            />
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
          {(image || existingImageUrl) && (
            <>
              {(imagePreview || existingImageUrl) && (
                <img
                  className="image-preview"
                  src={imagePreview || getImageUrl(existingImageUrl)}
                  alt={image ? "Selected cover preview" : imageAlt || form.title}
                />
              )}
              <label>
                <span>Image description</span>
                <input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  maxLength={300}
                  placeholder="Describe the image for readers using screen readers"
                />
              </label>
              {image && (
                <button type="button" className="btn danger image-remove" onClick={removeImage}>
                  Remove selected image
                </button>
              )}
            </>
          )}
        </div>
        {error && <div className="alert error">{error}</div>}
        <button className="btn primary" disabled={loading || tagsLoading || !!tagsError}>
          {loading ? (editing ? "Saving..." : "Submitting...") : tagsLoading ? "Loading tags..." : editing ? "Save and send for approval" : "Submit for review"}
        </button>
      </form>
      )}
    </div>
  );
}