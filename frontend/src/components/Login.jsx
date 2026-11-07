import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2>Đăng nhập</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="username" placeholder="Username" value={form.username}
               onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Mật khẩu" value={form.password}
               onChange={handleChange} required style={styles.input} />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
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

export default Login;