const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:8080")
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}/${imageUrl.replace(/^\/+/, "")}`;
};
