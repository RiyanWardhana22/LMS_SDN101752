const ENV_URL = import.meta.env.VITE_API_BASE_URL;
const FALLBACK_URL = "http://localhost/lms_sdn101752/literasi-backend";
export const API_BASE_URL = ENV_URL || FALLBACK_URL;

export const apiEndpoint = (path) => {
  if (!path) return API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const cleanBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${cleanBase}/${cleanPath}`;
};
