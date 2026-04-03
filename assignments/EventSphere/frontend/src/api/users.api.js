import axiosInstance from "../axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get("/auth/users");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post("/auth/signup", userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axiosInstance.put(`/auth/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/auth/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put("/auth/users/role", { userId, role });
  return response.data;
};
