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
      const data = err.response?.data;
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify", { state: { email: data.email, autoSend: true } });
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue reading and sharing posts."
      footer={<>Don't have an account? <Link to="/register">Register for free</Link></>}
    >
      <SocialLogin />
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Username</span>
          <input name="username" placeholder="Enter your username"
                 value={form.username} onChange={onChange} required autoComplete="username" />
        </label>
        <PasswordField label="Password" name="password" placeholder="Enter your password"
                       value={form.password} onChange={onChange} required autoComplete="current-password" />
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}