import api from "./api";

export const createPost = (data) => api.post("/posts", data).then((r) => r.data);
export const getMyPosts = () => api.get("/posts/mine").then((r) => r.data);