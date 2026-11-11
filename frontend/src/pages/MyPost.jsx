import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMyPosts } from "../services/submissionService";
import { getErrorMessage } from "../utils/getErrorMessage";
import "./ui.css";

const LABEL = { PENDING: "Pending", APPROVED: "Published", REJECTED: "Rejected" };

export default function MyPosts() {
  const { state } = useLocation();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPosts()
      .then(setPosts)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My posts</h1>
        <Link to="/posts/new" className="btn primary">Write a new post</Link>
      </div>
      {state?.justSubmitted && (
        <div className="alert info">Your post has been submitted. It will appear after an administrator approves it.</div>
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
          {p.status === "REJECTED" && p.rejectReason && (
            <p className="muted">Reason: {p.rejectReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}