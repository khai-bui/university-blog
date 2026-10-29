import React from 'react';
import PostList from './components/PostList';

function App() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>University Blogger</h1>
      </header>
      <main>
        <PostList />
      </main>
    </div>
  );
}

export default App;