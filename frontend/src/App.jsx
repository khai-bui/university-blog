import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPost';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTags from './pages/admin/AdminTags';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/posts/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/posts/:id/edit" element={<ProtectedRoute><CreatePost editMode /></ProtectedRoute>} />
        <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminPosts /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminUsers /></RoleRoute>} />
        <Route path="/admin/tags" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminTags /></RoleRoute>} />
      </Routes>
      <ChatWidget />
    </>
  );
}

export default App;