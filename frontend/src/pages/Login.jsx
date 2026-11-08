import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import SocialLogin from "../components/SocialLogin";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục đọc và chia sẻ bài viết."
      footer={<>Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link></>}
    >
      <SocialLogin />
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Tên đăng nhập</span>
          <input name="username" placeholder="Nhập tên đăng nhập"
                 value={form.username} onChange={onChange} required autoComplete="username" />
        </label>
        <PasswordField label="Mật khẩu" name="password" placeholder="Nhập mật khẩu"
                       value={form.password} onChange={onChange} required autoComplete="current-password" />
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  );
}