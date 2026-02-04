import { useNavigate } from "react-router-dom";
import "./EventCard.css";

const EventCard = ({ event, registered = false }) => {
  const navigate = useNavigate();

  if (!event) return null;

  const handleRegister = () => {
    navigate(`/get-ticket?event=${event._id}`);
  };

  const handleGetTicket = () => {
    navigate(`/ticket-registration?event=${event._id}`);
  };

  return (
    <div className="event-card">
      <h3>{event.title}</h3>

      {event.description && <p>{event.description}</p>}

      <p>
        <strong>Date:</strong>{" "}
        {new Date(event.date).toLocaleDateString()}
      </p>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      <div className="event-card-actions">
        {registered ? (
          <button className="registered-btn" disabled>
            ✅ Registered
          </button>
        ) : (
          <button className="register-btn" onClick={handleRegister}>
            Register Now
          </button>
        )}

        <button className="ticket-btn" onClick={handleGetTicket}>
          Get Ticket
        </button>
      </div>
    </div>
  );
};

export default EventCard;
