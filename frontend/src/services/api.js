import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL });

/**
 * File URLs stored in the DB are relative (e.g. "/uploads/xyz.pdf") since
 * they're served by the backend, not the Vite dev server. This resolves
 * them to an absolute URL so links/downloads work outside the /api proxy.
 */
export function resolveFileUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = baseURL.replace(/\/api\/?$/, "");
  return `${origin}${url}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("devpms:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("devpms:token");
      localStorage.removeItem("devpms:user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Something went wrong";
}
