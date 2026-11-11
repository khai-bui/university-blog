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
      setInfo("A new code has been sent. Please check your email.");
      setSeconds(COOLDOWN);
    } catch (err) {
      console.error("Verify error:", err);
      setError(getErrorMessage(err));
    }
  };

  // If the user is not yet verified, send the code automatically once.
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
    if (code.length !== 6) return setError("Please enter all 6 digits");
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
      title="Verify email"
      subtitle={`We sent a 6-digit code to ${email}. The code is valid for 5 minutes.`}
      footer={<><Link to="/login">Back to login</Link></>}
    >
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span>Verification code</span>
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
          {loading ? "Verifying..." : "Verify"}
        </button>
        <p className="auth-footer" style={{ margin: 0 }}>
          Didn't receive the code?{" "}
          <button type="button" className="otp-resend" onClick={resend} disabled={seconds > 0}>
            {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}