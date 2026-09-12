import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach the auth token (if we have one) to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("artieland_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
