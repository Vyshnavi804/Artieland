import axios from "axios";

// In local dev, requests go to "/api" and Vite's proxy forwards them to localhost:5000.
// In production (Vercel), there's no dev proxy, so we need the real backend URL,
// set via the VITE_API_URL environment variable.
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

const api = axios.create({ baseURL });

// Attach the auth token (if we have one) to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("artieland_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
