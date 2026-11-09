import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";

// Kiểm tra số phiên bản Graph API mới nhất trên Facebook for Developers và đổi tại đây
const FB_VERSION = "v23.0";
const ENABLE_FACEBOOK = import.meta.env.VITE_ENABLE_FACEBOOK === "true";

function loadFacebookSdk() {
  return new Promise((resolve) => {
    if (window.FB) return resolve(window.FB);
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: false,
        xfbml: false,
        version: FB_VERSION,
      });
      resolve(window.FB);
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    document.body.appendChild(s);
  });
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07"/>
  </svg>
);

export default function SocialLogin({ note }) {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const finish = async (provider, token) => {
    try {
      await socialLogin(provider, token);
      navigate("/");
    } catch (err) {
      console.error("Social login error:", err); 
      setError(getErrorMessage(err));
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (r) => finish("google", r.access_token),
    onError: () => setError("Đăng nhập Google thất bại"),
  });

  const onFacebook = async () => {
    setError("");
    const FB = await loadFacebookSdk();
    FB.login(
      (res) => {
        if (res.authResponse?.accessToken) finish("facebook", res.authResponse.accessToken);
        else setError("Bạn đã hủy đăng nhập Facebook");
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <div className="social">
      <button type="button" className="social-btn google" onClick={() => { setError(""); googleLogin(); }}>
        <GoogleIcon /> Tiếp tục với Google
      </button>
      {ENABLE_FACEBOOK && (
      <button type="button" className="social-btn facebook" onClick={onFacebook}>
        <FacebookIcon /> Tiếp tục với Facebook
        </button>
      )}
      {note && <p className="social-note">{note}</p>}
      {error && <div className="auth-error" role="alert">{error}</div>}
      <div className="auth-divider"><span>hoặc</span></div>
    </div>
  );
}