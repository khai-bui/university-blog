import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import AuthLayout from "../components/AuthLayout";

const COOLDOWN = 60;

export default function VerifyOtp() {
  const { state } = useLocation();
  const email = state?.email;
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(state?.autoSend ? 0 : COOLDOWN);
  const autoSent = useRef(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      await resendOtp(email);
      setInfo("Đã gửi mã mới, hãy kiểm tra email của bạn");
      setSeconds(COOLDOWN);
    } catch (err) {
      console.error("Verify error:", err);  
      setError(getErrorMessage(err));
    }
  };

  // Đăng nhập khi chưa xác minh: tự gửi mã một lần
  useEffect(() => {
    if (state?.autoSend && !autoSent.current) {
      autoSent.current = true;
      resend();
    }
  }, []);

  if (!email) return <Navigate to="/login" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (code.length !== 6) return setError("Vui lòng nhập đủ 6 số");
    setLoading(true);
    try {
      await verifyOtp(email, code);
      navigate("/");
    } catch (err) {
      console.error("Verify error:", err);  
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Xác minh email"
      subtitle={`Chúng tôi đã gửi mã 6 số tới ${email}. Mã có hiệu lực trong 5 phút.`}
      footer={<><Link to="/login">Quay lại đăng nhập</Link></>}
    >
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Mã xác minh</span>
          <input
            className="otp-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoFocus
          />
        </label>
        {info && <div className="auth-info">{info}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={loading}>
          {loading ? "Đang xác minh..." : "Xác minh"}
        </button>
        <p className="auth-footer" style={{ margin: 0 }}>
          Chưa nhận được mã?{" "}
          <button type="button" className="otp-resend" onClick={resend} disabled={seconds > 0}>
            {seconds > 0 ? `Gửi lại sau ${seconds}s` : "Gửi lại mã"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}