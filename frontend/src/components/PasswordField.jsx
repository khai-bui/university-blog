import { useState } from "react";

export default function PasswordField({ label, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-password">
        <input type={show ? "text" : "password"} {...props} />
        <button type="button" onClick={() => setShow(!show)} aria-label="Hiện hoặc ẩn mật khẩu">
          {show ? "Ẩn" : "Hiện"}
        </button>
      </div>
    </label>
  );
}