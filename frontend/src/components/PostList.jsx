import React, { useEffect, useState } from 'react';
import { fetchAllPosts, summarizePost } from '../services/postService';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (error) {
      setErrorMessage('Failed to fetch posts. Please check if backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (postId) => {
    try {
      setSummarizingId(postId);
      const updatedPost = await summarizePost(postId);
      
      // Update local state with new AI summary
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (error) {
      alert('Failed to generate AI summary. Please try again.');
    } finally {
      setSummarizingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2>University Community Posts</h2>
      
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {posts.length === 0 ? (
        <p>No posts available yet.</p>
      ) : (
        posts.map((post) => (
          <article
            key={post.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#1a202c' }}>{post.title}</h3>
            
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
              <span>Author: <strong>{post.authorName || 'Anonymous'}</strong></span>
              {post.createdAt && (
                <span style={{ marginLeft: '1rem' }}>
                  Date: {new Date(post.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{post.content}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                {Array.from(post.tags).map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#edf2f7',
                      color: '#4a5568',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      marginRight: '0.5rem',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* AI Summary Box */}
            {post.aiSummary && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  borderLeft: '4px solid #22c55e',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                }}
              >
                <strong style={{ color: '#15803d', display: 'block', marginBottom: '0.5rem' }}>
                  🤖 AI Summary:
                </strong>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>
                  {post.aiSummary}
                </p>
              </div>
            )}

            {/* Summarize Action Button */}
            <button
              onClick={() => handleSummarize(post.id)}
              disabled={summarizingId === post.id}
              style={{
                backgroundColor: summarizingId === post.id ? '#cbd5e1' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: summarizingId === post.id ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {summarizingId === post.id ? 'Generating Summary...' : 'Summarize with AI ✨'}
            </button>
          </article>
        ))
      )}
    </div>
  );
};

export default PostList;