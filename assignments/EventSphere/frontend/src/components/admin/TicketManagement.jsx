import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaQrcode, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import {
  getAllTickets,
  generateQRCode,
  verifyTicketQRCode,
} from "../../api/tickets.api";
import "./AdminComponents.css";

/* =========================
   CONFIG
========================= */
const USE_MOCK = false;

/* =========================
   COMPONENT
========================= */
const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);

        const data = USE_MOCK
          ? mockTickets
          : await getAllTickets();

        setTickets(data);
      } catch {
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredTickets = useMemo(() => {
    if (!search) return tickets;

    const q = search.toLowerCase();
    return tickets.filter((t) =>
      [
        t.bookingId,
        t.eventId.title,
        t.userId.name,
        t.userId.email,
        t.attendeeDetails.fullName,
        t.attendeeDetails.email,
      ].some((v) => v.toLowerCase().includes(q))
    );
  }, [search, tickets]);

  /* =========================
     ACTIONS
  ========================= */
  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setQrCode(null);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setQrCode(null);
  };

  const handleGenerateQR = async (bookingId) => {
    try {
      const res = await generateQRCode(bookingId);
      setQrCode(res.qrCodeUrl);
    } catch {
      setQrCode(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}`
      );
    }
  };

  const handleVerify = async (bookingId) => {
    try {
      await verifyTicketQRCode(bookingId);
      setTickets((prev) =>
        prev.map((t) =>
          t.bookingId === bookingId ? { ...t, verified: true } : t
        )
      );
    } catch {
      alert("Verification failed");
    }
  };

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div className="error-message">{error}</div>;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="admin-component-container">
      <div className="admin-component-header">
        <h2>Ticket Management</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Event</th>
            <th>Attendee</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTickets.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-data">
                No tickets found
              </td>
            </tr>
          ) : (
            filteredTickets.map((t) => (
              <tr key={t._id}>
                <td>{t.bookingId}</td>
                <td>{t.eventId.title}</td>
                <td>{t.attendeeDetails.fullName}</td>
                <td>{t.quantity}</td>
                <td>${t.totalAmount.toFixed(2)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      t.paymentStatus === "completed"
                        ? "status-success"
                        : "status-pending"
                    }`}
                  >
                    {t.paymentStatus}
                  </span>
                </td>
                <td className="action-buttons">
                  <button className="btn-view" onClick={() => openTicket(t)}>
                    <FaEye />
                  </button>
                  <button
                    className="btn-qr"
                    onClick={() => handleGenerateQR(t.bookingId)}
                  >
                    <FaQrcode />
                  </button>
                  <button
                    className={`btn-verify ${t.verified ? "verified" : ""}`}
                    onClick={() => handleVerify(t.bookingId)}
                    disabled={t.verified}
                  >
                    {t.verified ? <FaCheck /> : <FaTimes />}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ticket Details</h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <p><b>Booking:</b> {selectedTicket.bookingId}</p>
            <p><b>Event:</b> {selectedTicket.eventId.title}</p>
            <p><b>Attendee:</b> {selectedTicket.attendeeDetails.fullName}</p>

            {qrCode && (
              <div className="qr-code-container">
                <img src={qrCode} alt="QR Code" />
              </div>
            )}

            <div className="modal-actions">
              {!qrCode && (
                <button
                  className="btn-primary"
                  onClick={() => handleGenerateQR(selectedTicket.bookingId)}
                >
                  Generate QR
                </button>
              )}
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;

/* =========================
   MOCK DATA (DEV ONLY)
========================= */
const mockTickets = [
  {
    _id: "1",
    bookingId: "EVT-123",
    eventId: { title: "Tech Conference" },
    userId: { name: "John", email: "john@test.com" },
    attendeeDetails: { fullName: "John Doe", email: "john@test.com" },
    quantity: 1,
    totalAmount: 99.99,
    paymentStatus: "completed",
  },
];
