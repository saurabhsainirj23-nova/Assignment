import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// -------- Tasks API --------

export const getTasks = () => api.get('/tasks');

export const getTask = (id) => api.get(`/tasks/${id}`);

export const addTask = (task) => api.post('/tasks', task);

export const updateTask = (id, task) =>
  api.put(`/tasks/${id}`, task);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);

export default api;
