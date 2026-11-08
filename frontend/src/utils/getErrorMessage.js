export function getErrorMessage(err) {
  const d = err.response?.data;
  return (
    (typeof d === "string" && d) ||
    d?.message ||
    d?.error ||
    (err.response ? "Có lỗi xảy ra, thử lại sau" : "Không kết nối được máy chủ")
  );
}