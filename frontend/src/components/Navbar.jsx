import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/university.png';

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
        <span className="brand-mark">
          <img src={logo} alt="University Blog" />
        </span>
        <span>University<br />Blog</span>
      </Link>

      <nav className="nav-actions">
        {user ? (
          <>
            {user && <Link to="/posts/new">Write a post</Link>}
            {user && <Link to="/my-posts">My posts</Link>}
            {user?.role === 'ROLE_ADMIN' && (
              <>
                <Link to="/admin/posts">Review posts</Link>
                <Link to="/admin/users">Users</Link>
              </>
            )}
            <span>Welcome, <strong>{user.username}</strong></span>
            <button className="nav-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;