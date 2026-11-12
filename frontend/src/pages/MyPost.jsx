import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { deletePost, getMyPosts } from "../services/submissionService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getImageUrl } from "../utils/getImageUrl";
import "./ui.css";

const LABEL = { PENDING: "Pending", APPROVED: "Published", REJECTED: "Rejected" };

export default function MyPosts() {
  const { state } = useLocation();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getMyPosts()
      .then(setPosts)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setError("");
    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My posts</h1>
        <Link to="/posts/new" className="btn primary">Write a new post</Link>
      </div>
      {state?.justSubmitted && (
        <div className="alert info">Your post has been submitted. It will appear after an administrator approves it.</div>
      )}
      {state?.justUpdated && (
        <div className="alert info">Your changes have been submitted for administrator approval.</div>
      )}
      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && posts.length === 0 && <p className="muted">You have not created any posts yet.</p>}
      {posts.map((p) => (
        <div key={p.id} className="card item">
          <div className="item-head">
            <h3>{p.title}</h3>
            <span className={`badge ${p.status.toLowerCase()}`}>{LABEL[p.status]}</span>
          </div>
          {p.imageUrl && (
            <img className="post-thumbnail" src={getImageUrl(p.imageUrl)} alt={p.imageAlt || p.title} />
          )}
          {p.status === "REJECTED" && p.rejectReason && (
            <p className="muted">Reason: {p.rejectReason}</p>
          )}
          <div className="actions">
            <Link to={`/posts/${p.id}/edit`} className="btn primary">Edit</Link>
            <button
              className="btn danger"
              onClick={() => onDelete(p)}
              disabled={deletingId === p.id}
            >
              {deletingId === p.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}