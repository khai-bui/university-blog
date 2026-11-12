import api from "./api";

const postFormData = ({ image, inlineImages = [], ...post }) => {
  const data = new FormData();
  data.append("post", new Blob([JSON.stringify(post)], { type: "application/json" }));
  if (image) data.append("image", image);
  inlineImages.forEach(({ token, file }) => {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
    data.append("images", file, `${token}.${extension}`);
  });
  return data;
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

export const createPost = (post) =>
  api.post("/posts", postFormData(post), multipartConfig).then((r) => r.data);
export const updatePost = (id, post) =>
  api.put(`/posts/${id}`, postFormData(post), multipartConfig).then((r) => r.data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const getPostForEdit = (id) => api.get(`/posts/${id}/edit`).then((r) => r.data);
export const getMyPosts = () => api.get("/posts/mine").then((r) => r.data);