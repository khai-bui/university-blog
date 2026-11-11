import "./auth.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-side">
          <h2>Student blog community</h2>
          <p>Share learning experiences, read posts from your peers, and get AI-powered summaries.</p>
          <ul>
            <li>Save your favorite posts</li>
            <li>Read faster with AI summaries</li>
            <li>Ask the chatbot to find the right post</li>
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