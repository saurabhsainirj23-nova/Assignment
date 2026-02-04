import axiosInstance from "./axiosInstance";

/**
 * Generic API handler
 */
const apiRequest = async (method, url, data = null) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Register a new user
 */
export const signup = (userData) => {
  const { confirmPassword, ...payload } = userData;
  return apiRequest("post", "/auth/signup", payload);
};

/**
 * Login a user
 */
export const loginUser = (credentials) => {
  return apiRequest("post", "/auth/login", credentials);
};

/**
 * Verify authentication token
 */
export const verifyAuth = () => {
  return apiRequest("get", "/auth/verify");
};
