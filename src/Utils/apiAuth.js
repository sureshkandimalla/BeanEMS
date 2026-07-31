import axios from "axios";
import { API_BASE_URL } from "../config";

// The app is a mix of axios and plain fetch() calls across ~40 files (grown
// organically over time). Rather than touch every call site, this patches
// both globally, once, at app startup (imported for its side effect only —
// see index.js) — every request to our own backend gets the token attached
// automatically, and a 401 from the backend (AuthFilter rejecting an
// invalid/expired token) logs the user out uniformly regardless of which
// mechanism made the call.

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.token || null;
  } catch {
    return null;
  }
};

const handleUnauthorized = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) handleUnauthorized();
    return Promise.reject(error);
  },
);

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const isOwnApi = url.startsWith(API_BASE_URL);
  const token = getToken();

  if (isOwnApi && token) {
    init = { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } };
  }

  const response = await originalFetch(input, init);
  if (isOwnApi && response.status === 401) {
    handleUnauthorized();
  }
  return response;
};
