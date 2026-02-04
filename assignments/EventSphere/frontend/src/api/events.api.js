// events.api.js

import API from "./axiosInstance";
import { mockEvents } from "./mockData";

// Toggle mock mode here
const USE_MOCK = false;

/**
 * Fetch events (API or mock)
 */
export const fetchEvents = async () => {
  if (USE_MOCK) {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockEvents), 500);
    });
  }

  const response = await API.get("/events");
  return response.data;
};
