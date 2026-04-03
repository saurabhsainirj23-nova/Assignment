import axiosInstance from "./axiosInstance";

export const getRecommendations = async (limit = 5) => {
  const response = await axiosInstance.get(`/ai/recommendations?limit=${limit}`);
  return response.data;
};

export const getSimilarEvents = async (eventId, limit = 5) => {
  const response = await axiosInstance.get(`/ai/similar/${eventId}?limit=${limit}`);
  return response.data;
};

export const forecastDemand = async (eventId) => {
  const response = await axiosInstance.get(`/ai/forecast/${eventId}`);
  return response.data;
};

export const getDemandTrends = async (days = 30) => {
  const response = await axiosInstance.get(`/ai/demand-trends?days=${days}`);
  return response.data;
};

export const getDynamicPricing = async (eventId) => {
  const response = await axiosInstance.get(`/ai/pricing/${eventId}`);
  return response.data;
};

export const getPricingRecommendations = async () => {
  const response = await axiosInstance.get('/ai/pricing-recommendations');
  return response.data;
};

export const analyzeFraud = async (registrationData) => {
  const response = await axiosInstance.post('/ai/fraud-analyze', registrationData);
  return response.data;
};

export const getFlaggedRegistrations = async () => {
  const response = await axiosInstance.get('/ai/flagged-registrations');
  return response.data;
};

export const chatWithBot = async (query) => {
  const response = await axiosInstance.post('/ai/chatbot', { query });
  return response.data;
};

export const getQuickReplies = async (context = 'general') => {
  const response = await axiosInstance.get(`/ai/chatbot/quick-replies?context=${context}`);
  return response.data;
};
