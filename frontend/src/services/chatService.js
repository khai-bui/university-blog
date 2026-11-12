import apiClient from './api';

export const sendChat = async ({ message, postId, history, excludePostIds }) => {
  const res = await apiClient.post('/chat', { message, postId, history, excludePostIds });
  return res.data;
};