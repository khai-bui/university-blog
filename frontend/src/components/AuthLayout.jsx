import "./auth.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-side">
          <h2>Cộng đồng blog sinh viên</h2>
          <p>Chia sẻ kinh nghiệm học tập, đọc bài viết từ các bạn và nhận tóm tắt thông minh bằng AI.</p>
          <ul>
            <li>Lưu những bài viết yêu thích</li>
            <li>Đọc nhanh với tóm tắt AI</li>
            <li>Hỏi chatbot để tìm đúng bài cần đọc</li>
          </ul>
        </aside>

        <section className="auth-main">
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </section>
      </div>
    </div>
  );
}