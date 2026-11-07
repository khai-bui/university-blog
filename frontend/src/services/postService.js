import apiClient from './api';

export const fetchAllPosts = async () => {
  const response = await apiClient.get('/posts');
  return response.data;
};

export const createPost = async (postData) => {
  const response = await apiClient.post('/posts', postData);
  return response.data;
};

export const summarizePost = async (postId) => {
  const response = await apiClient.post(`/posts/${postId}/summarize`);
  return response.data;
};

export const fetchPostById = async (id) => {
  try {
    const res = await apiClient.get(`/posts/${id}`);
    return res.data;
  } catch (err) {
    // Dự phòng khi backend chưa có GET /posts/{id}
    const all = await fetchAllPosts();
    const found = all.find((p) => String(p.id) === String(id));
    if (!found) throw err;
    return found;
  }
};