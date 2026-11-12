import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendChat } from '../services/chatService';
import { fetchAllPosts, fetchPostById } from '../services/postService';
import chatIcon from '../assets/chatbot.png';

const DEFAULT_DETAIL_SUGGESTIONS = [
  'Summarize this post',
  'List the main ideas',
  'Are there any deadlines or milestones?',
];

const makeDetailSuggestions = (post) => {
  if (!post) return DEFAULT_DETAIL_SUGGESTIONS;

  const title = (post.title || 'this post').trim();
  const shortTitle = title.length > 48 ? `${title.slice(0, 45).trim()}...` : title;
  const tags = Array.from(post.tags || [])
    .filter((tag) => typeof tag === 'string' && tag.trim())
    .map((tag) => tag.trim());
  const content = (post.content || '').toLowerCase();
  const hasTimeInfo = /\b(deadline|due date|registration|register|application|apply by|schedule|date|time|upcoming)\b/i
    .test(content);

  const suggestions = [
    `Summarize "${shortTitle}"`,
    tags.length > 0
      ? `What does this post say about ${tags[0]}?`
      : `What are the key points in "${shortTitle}"?`,
    hasTimeInfo
      ? 'What dates or deadlines are mentioned?'
      : tags.length > 1
        ? `How does this post relate to ${tags[1]}?`
        : 'Who would find this post useful?',
  ];

  return [...new Set(suggestions)];
};

const makeHomeSuggestions = (posts) => {
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
  const suggestions = [];

  const addSuggestion = (text) => {
    if (text && !suggestions.includes(text) && suggestions.length < 3) {
      suggestions.push(text);
    }
  };

  if (sortedPosts[0]?.title) {
    const title = sortedPosts[0].title.trim();
    const shortTitle = title.length > 42 ? `${title.slice(0, 39).trim()}...` : title;
    addSuggestion(`What's new in "${shortTitle}"?`);
  }

  const tagCounts = new Map();
  sortedPosts.forEach((post) => {
    Array.from(post.tags || []).forEach((tag) => {
      const name = typeof tag === 'string' ? tag.trim() : '';
      if (name) tagCounts.set(name, (tagCounts.get(name) || 0) + 1);
    });
  });
  [...tagCounts.entries()]
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB))
    .forEach(([tag]) => addSuggestion(`Show me posts about ${tag}`));

  sortedPosts.forEach((post) => {
    if (post.title) addSuggestion(`Tell me about "${post.title.trim()}"`);
  });

  return suggestions;
};

const ChatWidget = () => {
  const { user } = useAuth();
  const detailMatch = useMatch('/posts/:id');
  const homeMatch = useMatch('/');

  const postId = detailMatch ? Number(detailMatch.params.id) : null;
  const isHome = Boolean(homeMatch);
  const visible = Boolean(detailMatch || isHome);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [recommendedPostIds, setRecommendedPostIds] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [homePosts, setHomePosts] = useState([]);
  const [homePostsLoading, setHomePostsLoading] = useState(false);
  const [homePostsError, setHomePostsError] = useState('');
  const [homePostsReload, setHomePostsReload] = useState(0);
  const [detailPost, setDetailPost] = useState(null);
  const [detailPostLoading, setDetailPostLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (postId === null) {
      setDetailPost(null);
      return undefined;
    }

    let active = true;
    setDetailPost(null);
    setDetailPostLoading(true);
    fetchPostById(postId)
      .then((post) => {
        if (active) setDetailPost(post);
      })
      .catch(() => {
        if (active) setDetailPost(null);
      })
      .finally(() => {
        if (active) setDetailPostLoading(false);
      });

    return () => { active = false; };
  }, [postId]);

  useEffect(() => {
    if (!isHome) return undefined;

    let active = true;
    setHomePostsLoading(true);
    setHomePostsError('');
    fetchAllPosts()
      .then((posts) => {
        if (active) setHomePosts(posts);
      })
      .catch(() => {
        if (active) setHomePostsError('Could not load post-based suggestions.');
      })
      .finally(() => {
        if (active) setHomePostsLoading(false);
      });

    return () => { active = false; };
  }, [isHome, homePostsReload]);

  // Start a new conversation whenever the page or post changes.
  useEffect(() => {
    setMessages([]);
    setRecommendedPostIds([]);
  }, [postId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const isDetail = postId !== null;
  const homeSuggestions = useMemo(() => makeHomeSuggestions(homePosts), [homePosts]);
  const detailSuggestions = useMemo(() => makeDetailSuggestions(detailPost), [detailPost]);
  const suggestions = isDetail ? detailSuggestions : homeSuggestions;

  if (!visible) return null;

  const send = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChat({
        message,
        postId,
        history,
        excludePostIds: recommendedPostIds,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply, posts: data.posts || [] }]);
      setRecommendedPostIds((prev) => [
        ...new Set([...prev, ...(data.posts || []).map((post) => post.id)]),
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'The chatbot is busy. Please try again later.';
      setMessages((prev) => [...prev, { role: 'assistant', text: msg, posts: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chatbot">
          <div className="chat-header">
            <div>
              <strong>{isDetail ? 'Post reader assistant' : 'Post search assistant'}</strong>
              <span>{isDetail ? 'Ask questions and summarize this post' : 'Tell me what you want to find'}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="chat-body">
            {messages.length === 0 && (
              <div className="bubble assistant">
                {isDetail
                  ? 'Hi there! I can summarize this article or answer questions about its content.'
                  : 'Hi there! Describe what you want to find, and I will suggest relevant posts.'}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                {m.posts?.length > 0 && (
                  <ul className="chat-links">
                    {m.posts.map((p) => (
                      <li key={p.id}>
                        <Link to={`/posts/${p.id}`} onClick={() => setOpen(false)}>
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {loading && <div className="bubble assistant typing">Responding...</div>}
            <div ref={bottomRef} />
          </div>

          {!user ? (
            <div className="chat-login">
              <Link to="/login">Log in</Link> to use the chatbot.
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="chat-suggest">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>
                  ))}
                  {isDetail && detailPostLoading && <span className="muted">Preparing post suggestions...</span>}
                  {!isDetail && homePostsLoading && <span className="muted">Finding suggestions...</span>}
                  {!isDetail && homePostsError && (
                    <span className="muted">
                      {homePostsError}{' '}
                      <button type="button" onClick={() => setHomePostsReload((value) => value + 1)}>
                        Retry
                      </button>
                    </span>
                  )}
                  {!isDetail && !homePostsLoading && !homePostsError && suggestions.length === 0 && (
                    <span className="muted">No published posts to suggest yet.</span>
                  )}
                </div>
              )}
              <form className="chat-input" onSubmit={onSubmit}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isDetail ? 'Ask about the post...' : 'What are you looking for?'}
                  maxLength={1000}
                />
                <button type="submit" disabled={loading || !input.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Open chatbot">
        {open ? '✕' : <img src={chatIcon} alt="" />}
      </button>
    </>
  );
};

export default ChatWidget;