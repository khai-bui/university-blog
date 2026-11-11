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
    if (form.password.length < 8) return setError("Password must be at least 8 characters long");
    if (form.password !== form.confirm) return setError("The confirmation password does not match");
    if (!form.agree) return setError("You must agree to the terms of use");

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate("/verify", { state: { email: form.email.trim() } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create a free account"
      subtitle="It only takes a minute to join the community."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <SocialLogin />
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Username</span>
          <input name="username" placeholder="e.g. khai123"
                 value={form.username} onChange={onChange} required autoComplete="username" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" placeholder="you@school.edu.vn"
                 value={form.email} onChange={onChange} required autoComplete="email" />
        </label>
        <PasswordField label="Password" name="password" placeholder="At least 8 characters"
                       value={form.password} onChange={onChange} required autoComplete="new-password" />
        <PasswordField label="Confirm password" name="confirm"
                       value={form.confirm} onChange={onChange} required autoComplete="new-password" />
        <label className="check">
          <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
          <span>I agree to the terms of use and privacy policy</span>
        </label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}