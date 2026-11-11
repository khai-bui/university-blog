import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/submissionService";
import { getErrorMessage } from "../utils/getErrorMessage";
import "./ui.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createPost({ title: form.title.trim(), content: form.content.trim() });
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
        <label>
          <span>Content</span>
          <textarea name="content" rows={14} value={form.content} onChange={onChange} required />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}