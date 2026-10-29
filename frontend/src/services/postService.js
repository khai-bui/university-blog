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