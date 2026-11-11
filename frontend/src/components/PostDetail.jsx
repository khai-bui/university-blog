import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPostById } from '../services/postService';
import { getImageUrl } from '../utils/getImageUrl';
import PostContent from './PostContent';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPostById(id);
        setPost(data);
        document.title = data.title;
      } catch {
        setError('Post not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <p className="state-msg">Loading post...</p>;
  if (error || !post) {
    return (
      <p className="state-msg error-msg">
        {error} <Link to="/">Back to home</Link>
      </p>
    );
  }

  const content = post.content || '';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(words / 180));
  const lead = content.length > 180 ? content.slice(0, 180).trim() + '...' : content;
  const tags = Array.from(post.tags || []);
  const author = post.authorName || 'Anonymous';
  const url = encodeURIComponent(window.location.href);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* The browser blocked clipboard access; ignore this silently. */
    }
  };

  return (
    <>
      <section className="hero detail-hero">
        <svg className="hero-curve" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M610 0 C 640 60, 600 150, 540 230" fill="none" stroke="#ff2a2a" strokeWidth="3" />
          <path d="M500 330 C 560 400, 700 420, 820 440" fill="none" stroke="#ff2a2a" strokeWidth="3" />
        </svg>
        <span className="pill">Post</span>
        <h1>{post.title}</h1>
      </section>

      <div className="crumbs">
        <Link to="/">Home</Link>
        <span className="sep">▸</span>
        <Link to="/">Posts</Link>
        <span className="sep">▸</span>
        <em>{post.title}</em>
      </div>

      <section className="meta-band">
        <div className="meta-row">
          <div className="meta-item">
            <b>Published date</b>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="avatar">{author.charAt(0).toUpperCase()}</div>
          <div className="meta-item">
            <b>Author</b>
            <span>{author}</span>
          </div>
        </div>
        <p className="lead">{lead}</p>
        <p className="readtime">Reading time: {readMinutes} minute{readMinutes > 1 ? 's' : ''}</p>
      </section>

      {post.imageUrl && (
        <div className="article-image-wrap">
          <img className="article-image" src={getImageUrl(post.imageUrl)} alt={post.imageAlt || post.title} />
        </div>
      )}

      <div className="article-wrap">
        <div className="share-rail">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on Facebook"
          >
            f
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${url}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on X"
          >
            X
          </a>
          <button onClick={copyLink} aria-label="Copy link" title="Copy link">
            {copied ? '✓' : '🔗'}
          </button>
        </div>

        <article className="article-body">
          <PostContent content={content} />

          {tags.length > 0 && (
            <div className="tags">
              {tags.map((t) => (
                <span key={t} className="tag">#{t}</span>
              ))}
            </div>
          )}
        </article>
      </div>
    </>
  );
};

export default PostDetail;