import axiosInstance from "./axiosInstance";

/**
 * Generic API handler (DRY principle)
 */
const apiRequest = async (method, url, data = null) => {
  try {
    const response = await axiosInstance({ method, url, data });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/* ============================
   TICKET APIs
============================ */

/** Create a new ticket (Admin/Dashboard) */
export const createTicket = (ticketData) =>
  apiRequest("post", "/tickets/create", ticketData);

/** Register ticket for an event */
export const registerTicket = (eventId, ticketData) =>
  apiRequest("post", `/tickets/${eventId}/register`, ticketData);

/** Get tickets of a specific user */
export const getUserTickets = (userId) =>
  apiRequest("get", `/tickets/user/${userId}`);

/** Get ticket using booking ID */
export const getTicketByBookingId = (bookingId) =>
  apiRequest("get", `/tickets/booking/${bookingId}`);

/** Generate QR code for a booking */
export const generateQRCode = (bookingId) =>
  apiRequest("get", `/tickets/qr-code/${bookingId}`);

/** Verify ticket QR code */
export const verifyTicketQRCode = (bookingId) =>
  apiRequest("post", "/tickets/read-qr-code", { bookingId });
