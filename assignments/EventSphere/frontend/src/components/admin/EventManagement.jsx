import React, { useState } from "react";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./AdminComponents.css";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  capacity: "",
  price: "",
  ticketsAvailable: "",
};

const EventManagement = ({
  events = [],
  searchQuery = "",
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onViewEvent,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  /* =========================
     HANDLERS
  ========================= */

  const openModal = (event = null) => {
    if (event) {
      const dateObj = new Date(event.date);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: dateObj.toISOString().split("T")[0],
        time: dateObj.toISOString().slice(11, 16),
        location: event.location || "",
        capacity: event.capacity || "",
        price: event.price || "",
        ticketsAvailable: event.ticketsAvailable || "",
      });
      setCurrentEvent(event);
    } else {
      setFormData(emptyForm);
      setCurrentEvent(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
    setCurrentEvent(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        date: `${formData.date}T${formData.time || "00:00"}:00`,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        ticketsAvailable: Number(formData.ticketsAvailable),
      };

      currentEvent
        ? await onUpdateEvent(currentEvent._id, payload)
        : await onCreateEvent(payload);

      closeModal();
    } catch {
      setError("Failed to save event. Please try again.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this event?")) {
      onDeleteEvent(id);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="admin-component-container">
      <div className="admin-component-header">
        <h2>Event Management</h2>
        <button className="btn-create" onClick={() => openModal()}>
          <FaPlus /> Create Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchQuery
                    ? "No matching events"
                    : "No events created yet"}
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                  <td>{event.capacity}</td>
                  <td>${event.price}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => onViewEvent(event._id)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => openModal(event)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(event._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentEvent ? "Edit Event" : "Create Event"}</h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {["title", "location"].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field}</label>
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="number"
                  name="ticketsAvailable"
                  placeholder="Tickets Available"
                  value={formData.ticketsAvailable}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {currentEvent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
