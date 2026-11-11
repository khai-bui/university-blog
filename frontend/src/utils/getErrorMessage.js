export function getErrorMessage(err) {
  const d = err.response?.data;
  return (
    (typeof d === "string" && d) ||
    d?.message ||
    d?.error ||
    (err.response ? "Something went wrong. Please try again later." : "Unable to connect to the server.")
  );
}