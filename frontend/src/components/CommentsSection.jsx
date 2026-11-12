import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createComment, deleteComment, getComments } from "../services/commentService";
import { getErrorMessage } from "../utils/getErrorMessage";

const formatDate = (value) => new Date(value).toLocaleString();

export default function CommentsSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadComments = useCallback(() => {
    setLoading(true);
    setError("");
    getComments(postId)
      .then(setComments)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    getComments(postId)
      .then(setComments)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [postId]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const text = content.trim();
    if (!text) return;

    setError("");
    setSubmitting(true);
    try {
      const created = await createComment(postId, text);
      setComments((current) => [...current, created]);
      setContent("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;
    setError("");
    setDeletingId(comment.id);
    try {
      await deleteComment(comment.id);
      setComments((current) => current.filter((item) => item.id !== comment.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <h2 id="comments-heading">Comments ({comments.length})</h2>
      {error && <div className="alert error">{error}</div>}
      {user ? (
        <form className="comment-form" onSubmit={onSubmit}>
          <label htmlFor="comment-content">Add a comment</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Write a comment..."
            required
          />
          <div className="comment-form-footer">
            <span className="muted">{content.length}/2000</span>
            <button className="btn primary" disabled={submitting || !content.trim()}>
              {submitting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="muted"><Link to="/login">Log in</Link> to leave a comment.</p>
      )}

      {loading && <p className="muted">Loading comments...</p>}
      {!loading && !error && comments.length === 0 && (
        <p className="muted">No comments yet. Start the conversation.</p>
      )}
      {!loading && comments.length > 0 && (
        <div className="comment-list">
          {comments.map((comment) => (
            <article className="comment-card" key={comment.id}>
              <div className="comment-header">
                <strong>{comment.authorName}</strong>
                <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
              </div>
              <p>{comment.content}</p>
              {(isAdmin || comment.authorName === user?.username) && (
                <button
                  type="button"
                  className="link comment-delete"
                  onClick={() => onDelete(comment)}
                  disabled={deletingId === comment.id}
                >
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {!loading && error && (
        <button type="button" className="link" onClick={loadComments}>Retry loading comments</button>
      )}
    </section>
  );
}
