import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2>Đăng ký</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="username" placeholder="Username" value={form.username}
               onChange={handleChange} required minLength={3} style={styles.input} />
        <input name="email" type="email" placeholder="Email" value={form.email}
               onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)"
               value={form.password} onChange={handleChange} required minLength={6} style={styles.input} />
        <input name="confirm" type="password" placeholder="Nhập lại mật khẩu"
               value={form.confirm} onChange={handleChange} required style={styles.input} />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>
      <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
};

const styles = {
  card: { maxWidth: 380, margin: '3rem auto', padding: '2rem', border: '1px solid #e2e8f0',
          borderRadius: 8, textAlign: 'left', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { padding: '0.6rem', borderRadius: 6, border: '1px solid #cbd5e1' },
  button: { padding: '0.6rem', borderRadius: 6, border: 'none', backgroundColor: '#3b82f6',
            color: '#fff', cursor: 'pointer', fontWeight: 500 },
};

export default Register;