import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-nav">
      <Link to="/" className="brand">
        <span className="brand-mark">UB</span>
        <span>University<br />Blog</span>
      </Link>

      <nav className="nav-actions">
        {user ? (
          <>
            <span>Xin chào, <strong>{user.username}</strong></span>
            <button className="nav-btn" onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;