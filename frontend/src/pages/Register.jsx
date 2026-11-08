import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import SocialLogin from "../components/SocialLogin";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "", agree: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Mật khẩu tối thiểu 8 ký tự");
    if (form.password !== form.confirm) return setError("Mật khẩu nhập lại không khớp");
    if (!form.agree) return setError("Bạn cần đồng ý với điều khoản sử dụng");

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản miễn phí"
      subtitle="Chỉ mất một phút để tham gia cộng đồng."
      footer={<>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>}
    >
      <SocialLogin />
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Tên đăng nhập</span>
          <input name="username" placeholder="vd: khai123"
                 value={form.username} onChange={onChange} required autoComplete="username" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" placeholder="ban@truong.edu.vn"
                 value={form.email} onChange={onChange} required autoComplete="email" />
        </label>
        <PasswordField label="Mật khẩu" name="password" placeholder="Tối thiểu 8 ký tự"
                       value={form.password} onChange={onChange} required autoComplete="new-password" />
        <PasswordField label="Nhập lại mật khẩu" name="confirm"
                       value={form.confirm} onChange={onChange} required autoComplete="new-password" />
        <label className="check">
          <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
          <span>Tôi đồng ý với điều khoản sử dụng và chính sách quyền riêng tư</span>
        </label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={loading}>
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </AuthLayout>
  );
}