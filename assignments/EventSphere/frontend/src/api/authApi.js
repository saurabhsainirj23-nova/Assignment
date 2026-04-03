import axiosInstance from "./axiosInstance";

export const signup = async (userData) => {
  const { confirmPassword, ...payload } = userData;
  const response = await axiosInstance.post("/auth/signup", payload);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  return response.data;
};

export const verifyAuth = async () => {
  const response = await axiosInstance.get("/auth/verify");
  return response.data;
};
