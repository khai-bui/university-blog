import api from "./api";

export const getComments = (postId) =>
  api.get(`/posts/${postId}/comments`).then((response) => response.data);

export const createComment = (postId, content) =>
  api.post(`/posts/${postId}/comments`, { content }).then((response) => response.data);

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);
