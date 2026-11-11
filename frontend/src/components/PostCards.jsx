import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/getImageUrl';

const PALETTES = [
  ['#ff7a59', '#7b2ff7'],
  ['#00c6ff', '#0072ff'],
  ['#f6d365', '#fda085'],
  ['#43e97b', '#2bb6a8'],
  ['#fa709a', '#f9a03f'],
  ['#a18cd1', '#5b7be0'],
];

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
  </svg>
);

const PostCard = ({ post }) => {
  const tags = Array.from(post.tags || []);
  const content = (post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const detailUrl = `/posts/${post.id}`;

  const [c1, c2] = PALETTES[hash(post.title || String(post.id)) % PALETTES.length];
  const letter = (post.title || '?').trim().charAt(0).toUpperCase();

  return (
    <article className="card">
      <Link to={detailUrl} className="card-cover">
        {post.imageUrl ? (
          <img src={getImageUrl(post.imageUrl)} alt={post.imageAlt || post.title} />
        ) : (
          <div className="cover-fallback" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
            {letter}
          </div>
        )}
      </Link>

      <h3>
        <Link to={detailUrl}>{post.title}</Link>
      </h3>

      <p className="card-text clamped">{content}</p>
      <Link to={detailUrl} className="link-btn">Read more →</Link>

      <div className="card-meta">
        <ChatIcon />
        <span>
          {post.authorName || 'Anonymous'}
          {post.createdAt && ` — ${formatDate(post.createdAt)}`}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
};

export default PostCard;