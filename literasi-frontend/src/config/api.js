export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiEndpoint = (path) => {
  if (!path) return API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL}/${cleanPath}`;
};
