import { useEffect, useRef, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendChat } from '../services/chatService';
import chatIcon from '../assets/chatbot.png';


const DETAIL_SUGGESTIONS = ['Tóm tắt bài viết này', 'Nêu các ý chính', 'Có mốc thời gian hay hạn chót nào không?'];
const HOME_SUGGESTIONS = ['Có cuộc thi nào sắp diễn ra?', 'Bài viết về thực tập', 'Thông báo mới nhất'];

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

  // Đổi trang/bài thì bắt đầu cuộc trò chuyện mới
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
      const msg = err.response?.data?.message || 'Chatbot đang bận, bạn thử lại sau nhé.';
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
              <strong>{isDetail ? 'Trợ lý đọc bài' : 'Trợ lý tìm bài viết'}</strong>
              <span>{isDetail ? 'Hỏi đáp & tóm tắt bài này' : 'Cho mình biết bạn cần tìm gì'}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
          </div>

          <div className="chat-body">
            {messages.length === 0 && (
              <div className="bubble assistant">
                {isDetail
                  ? 'Chào bạn! Mình có thể tóm tắt bài viết này hoặc trả lời câu hỏi về nội dung bài.'
                  : 'Chào bạn! Hãy mô tả nội dung bạn muốn tìm, mình sẽ gợi ý các bài viết phù hợp.'}
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

            {loading && <div className="bubble assistant typing">Đang trả lời...</div>}
            <div ref={bottomRef} />
          </div>

          {!user ? (
            <div className="chat-login">
              <Link to="/login">Đăng nhập</Link> để dùng chatbot.
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
                  placeholder={isDetail ? 'Hỏi về bài viết...' : 'Bạn muốn tìm bài gì?'}
                  maxLength={1000}
                />
                <button type="submit" disabled={loading || !input.trim()}>Gửi</button>
              </form>
            </>
          )}
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Mở chatbot">
        {open ? '✕' : <img src={chatIcon} alt="" />}
      </button>
    </>
  );
};

export default ChatWidget;