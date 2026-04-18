import axios from "axios";
import toast from "react-hot-toast";

// Base Axios instance — all API calls go through this
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
});

// ─── Request interceptor: attach JWT token ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle global errors ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (server down, no internet)
    if (!error.response) {
      toast.error("Cannot reach server. Check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Token expired — clear and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (status === 403 && data?.message?.includes("suspended")) {
      // Suspended user — show message and log out
      localStorage.removeItem("token");
      toast.error(data.message);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    }

    if (status === 429) {
      toast.error("Too many requests. Please slow down.");
    }

    if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;