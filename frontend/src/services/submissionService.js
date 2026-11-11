import api from "./api";

export const createPost = ({ image, inlineImages = [], ...post }) => {
  const data = new FormData();
  data.append("post", new Blob([JSON.stringify(post)], { type: "application/json" }));
  if (image) data.append("image", image);
  inlineImages.forEach(({ token, file }) => {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
    data.append("images", file, `${token}.${extension}`);
  });
  return api.post("/posts", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
export const getMyPosts = () => api.get("/posts/mine").then((r) => r.data);