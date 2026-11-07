import { useEffect, useMemo, useState } from 'react';
import { fetchAllPosts, summarizePost } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCards';

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
  </svg>
);

const PostList = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [summarizingId, setSummarizingId] = useState(null);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPosts(await fetchAllPosts());
      } catch {
        setErrorMessage('Không tải được bài viết. Kiểm tra xem backend đã chạy chưa.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSummarize = async (postId) => {
    try {
      setSummarizingId(postId);
      const updated = await summarizePost(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      alert('Tóm tắt thất bại. Vui lòng thử lại.');
    } finally {
      setSummarizingId(null);
    }
  };

  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => Array.from(p.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => {
        const tags = Array.from(p.tags || []);
        const matchesQuery =
          !q ||
          [p.title, p.content, p.authorName, ...tags].some((v) => (v || '').toLowerCase().includes(q));
        const matchesTag = !activeTag || tags.includes(activeTag);
        return matchesQuery && matchesTag;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [posts, query, activeTag]);

  return (
    <>
      <section className="hero">
        <svg className="hero-curve" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M610 0 C 640 60, 600 150, 540 230" fill="none" stroke="#ff2a2a" strokeWidth="3" />
          <path d="M500 330 C 560 400, 700 420, 820 440" fill="none" stroke="#ff2a2a" strokeWidth="3" />
        </svg>
        <h1>University Blog</h1>
        <p>Chia sẻ trải nghiệm, kiến thức và thông báo từ cộng đồng sinh viên.</p>
      </section>

      <div className="crumbs">
        <a href="/">Trang chủ</a>
        <span className="sep">▸</span>
        <em>Bài viết</em>
      </div>

      <main className="container">
        <div className="toolbar">
          <h2>{filtered.length} kết quả</h2>

          <div className="toolbar-right">
            <form className="search" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Tìm bài viết, ví dụ: hackathon"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" aria-label="Tìm kiếm">
                <SearchIcon />
              </button>
            </form>

            <button
              className={`filter-btn ${showFilters ? 'open' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon /> Lọc bài viết
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <span className="label">Thẻ:</span>
            {allTags.length === 0 && <span>Chưa có thẻ nào.</span>}
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`chip ${activeTag === tag ? 'active' : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button className="chip-clear" onClick={() => setActiveTag(null)}>
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {loading && <p className="state-msg">Đang tải bài viết...</p>}
        {errorMessage && <p className="state-msg error-msg">{errorMessage}</p>}
        {!loading && !errorMessage && filtered.length === 0 && (
          <p className="state-msg">Không có bài viết nào phù hợp.</p>
        )}

        <div className="grid">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              canSummarize={!!user}
              summarizing={summarizingId === post.id}
              onSummarize={handleSummarize}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default PostList;