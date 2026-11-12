import api from "./api";

export const getAdminPosts = (status = "PENDING") =>
  api.get("/admin/posts", { params: { status } }).then((r) => r.data);
export const approvePost = (id) => api.patch(`/admin/posts/${id}/approve`).then((r) => r.data);
export const rejectPost = (id, reason) =>
  api.patch(`/admin/posts/${id}/reject`, { reason }).then((r) => r.data);
export const getUsers = () => api.get("/admin/users").then((r) => r.data);
export const changeRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data);
export const setUserActive = (id, active) =>
  api.patch(`/admin/users/${id}/active`, { active }).then((r) => r.data);
export const deleteAdminPost = (id) => api.delete(`/posts/${id}`);