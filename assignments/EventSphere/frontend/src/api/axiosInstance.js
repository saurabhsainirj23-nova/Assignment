import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // JWT expired or unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Network error (server down)
    if (error.code === "ERR_NETWORK") {
      return Promise.reject("Server is not reachable. Please try again later.");
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default API;
