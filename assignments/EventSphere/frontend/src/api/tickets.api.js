import axiosInstance from "../axiosInstance";

export const getAllTickets = async () => {
  const response = await axiosInstance.get("/tickets");
  return response.data;
};

export const generateQRCode = async (ticketId) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}/qr`);
  return response.data;
};

export const verifyTicketQRCode = async (qrData) => {
  const response = await axiosInstance.post("/tickets/verify", { qrData });
  return response.data;
};

export const getTicketsByEvent = async (eventId) => {
  const response = await axiosInstance.get(`/tickets/event/${eventId}`);
  return response.data;
};
