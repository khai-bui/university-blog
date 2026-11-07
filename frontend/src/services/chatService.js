import apiClient from './api';

export const sendChat = async ({ message, postId, history }) => {
  const res = await apiClient.post('/chat', { message, postId, history });
  return res.data;
};