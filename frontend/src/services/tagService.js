import api from "./api";

export const getTags = () => api.get("/tags").then((r) => r.data);
export const createTag = (name) => api.post("/tags", { name }).then((r) => r.data);
export const deleteTag = (id) => api.delete(`/tags/${id}`);
