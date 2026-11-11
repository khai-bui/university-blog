import { useEffect, useRef, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendChat } from '../services/chatService';
import chatIcon from '../assets/chatbot.png';

const DETAIL_SUGGESTIONS = ['Summarize this post', 'List the main ideas', 'Are there any deadlines or milestones?'];
const HOME_SUGGESTIONS = ['Any upcoming competitions?', 'Posts about internships', 'Latest announcements'];

const ChatWidget = () => {
  const { user } = useAuth();
  const detailMatch = useMatch('/posts/:id');
  const homeMatch = useMatch('/');

  const postId = detailMatch ? Number(detailMatch.params.id) : null;
  const visible = Boolean(detailMatch || homeMatch);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Start a new conversation whenever the page or post changes.
  useEffect(() => {
    setMessages([]);
  }, [postId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  if (!visible) return null;

  const isDetail = postId !== null;
  const suggestions = isDetail ? DETAIL_SUGGESTIONS : HOME_SUGGESTIONS;

  const send = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChat({ message, postId, history });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply, posts: data.posts || [] }]);
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
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)}>{s}</button>
                  ))}
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