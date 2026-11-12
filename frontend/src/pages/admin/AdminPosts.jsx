import { useEffect, useState } from "react";
import { getAdminPosts, approvePost, rejectPost, deleteAdminPost } from "../../services/adminService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getImageUrl } from "../../utils/getImageUrl";
import PostContent from "../../components/PostContent";
import "../ui.css";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Published" },
  { key: "REJECTED", label: "Rejected" },
];

export default function AdminPosts() {
  const [status, setStatus] = useState("PENDING");
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (s) => {
    setLoading(true);
    setError("");
    getAdminPosts(s)
      .then(setPosts)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(status); }, [status]);

  const removeFromList = (id) => setPosts((list) => list.filter((p) => p.id !== id));

  const onApprove = async (id) => {
    try { await approvePost(id); removeFromList(id); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  const onReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return; // user cancelled
    try { await rejectPost(id, reason); removeFromList(id); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  const onDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    setError("");
    try {
      await deleteAdminPost(post.id);
      removeFromList(post.id);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="page">
      <h1>Review posts</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${status === t.key ? "active" : ""}`}
                  onClick={() => setStatus(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && posts.length === 0 && <p className="muted">There are no posts.</p>}
      {posts.map((p) => (
        <div key={p.id} className="card item">
          <div className="item-head">
            <h3>{p.title}</h3>
            <span className="muted">by {p.authorName ?? "unknown"}</span>
          </div>
          {p.imageUrl && (
            <img className="review-image" src={getImageUrl(p.imageUrl)} alt={p.imageAlt || p.title} />
          )}
          <div className="content">
            {open === p.id ? <PostContent content={p.content} /> : p.content.replace(/<[^>]*>/g, " ").slice(0, 300)}
          </div>
          {p.content.length > 300 && (
            <button className="link" onClick={() => setOpen(open === p.id ? null : p.id)}>
              {open === p.id ? "Collapse" : "Read more"}
            </button>
          )}
          {p.status === "REJECTED" && p.rejectReason && (
            <p className="muted">Rejection reason: {p.rejectReason}</p>
          )}
          <div className="actions">
            {p.status !== "APPROVED" && (
              <button className="btn primary" onClick={() => onApprove(p.id)}>Approve</button>
            )}
            {p.status !== "REJECTED" && (
              <button className="btn danger" onClick={() => onReject(p.id)}>Reject</button>
            )}
            <button className="btn danger" onClick={() => onDelete(p)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}