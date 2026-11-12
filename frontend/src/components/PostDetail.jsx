import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPostById } from '../services/postService';
import { getImageUrl } from '../utils/getImageUrl';
import { normalizeHtmlContent, stripHtmlTags } from '../utils/normalizeHtmlContent';
import PostContent from './PostContent';
import CommentsSection from './CommentsSection';

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

  const content = normalizeHtmlContent(post.content || '');
  const plainTextContent = stripHtmlTags(content);
  const words = plainTextContent ? plainTextContent.split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / 180));
  const lead = plainTextContent.length > 180 ? plainTextContent.slice(0, 180).trim() + '...' : plainTextContent;
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
      <CommentsSection postId={post.id} />
    </>
  );
};

export default PostDetail;