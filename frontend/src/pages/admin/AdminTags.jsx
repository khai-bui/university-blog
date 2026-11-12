import { useCallback, useEffect, useState } from "react";
import { createTag, deleteTag, getTags } from "../../services/tagService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import "../ui.css";

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTags = useCallback(() => {
    setLoading(true);
    setError("");
    getTags()
      .then(setTags)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const tagName = name.trim();
    if (!tagName) return;

    setSaving(true);
    try {
      const created = await createTag(tagName);
      setTags((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setSuccess(`Added “${created.name}” to the available tags.`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (tag) => {
    if (!window.confirm(`Delete the "${tag.name}" tag? It will also be removed from tagged posts.`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteTag(tag.id);
      setTags((current) => current.filter((item) => item.id !== tag.id));
      setSuccess(`Deleted "${tag.name}".`);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="page">
      <h1>Manage post tags</h1>
      <p className="muted">Only administrators can add tags. Authors can select these tags when submitting a post.</p>
      <form className="card form" onSubmit={onSubmit}>
        <label>
          <span>New tag</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
        </label>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <button className="btn primary" disabled={saving}>{saving ? "Adding..." : "Add tag"}</button>
      </form>
      <section className="card">
        <div className="page-header">
          <h2>Available tags</h2>
          <button type="button" className="link" onClick={loadTags}>Refresh</button>
        </div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && !error && tags.length === 0 && <p className="muted">No tags have been added.</p>}
        {!loading && tags.length > 0 && (
          <div className="tag-admin-list">
            {tags.map((tag) => (
              <div className="tag-admin-item" key={tag.id}>
                <span className="tag">{tag.name}</span>
                <button className="btn danger" onClick={() => onDelete(tag)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
