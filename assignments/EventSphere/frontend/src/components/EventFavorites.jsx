import {
  FaTrash,
  FaCalendarDay,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useFavorites } from "../../hooks/useFavorites";
import "./EventFavorites.css";

const EventFavorites = ({ events = [] }) => {
  const { favorites, removeFromFavorites } = useFavorites();
  const [showAll, setShowAll] = useState(false);

  const visibleFavorites = useMemo(() => {
    if (!events.length) return favorites;
    const ids = events.map((e) => e._id);
    return favorites.filter((f) => ids.includes(f._id));
  }, [favorites, events]);

  const display = showAll ? visibleFavorites : visibleFavorites.slice(0, 3);

  return (
    <div className="event-favorites">
      <div className="favorites-header">
        <h3>Favorite Events</h3>
        {visibleFavorites.length > 3 && (
          <button
            className="toggle-favorites"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      {display.length ? (
        <ul className="favorites-list">
          {display.map((event) => (
            <li key={event._id} className="favorite-item">
              <div className="favorite-content">
                <Link
                  to={`/events/${event._id}`}
                  className="favorite-title"
                >
                  {event.title}
                </Link>

                <div className="favorite-details">
                  <span>
                    <FaCalendarDay />
                    {new Date(event.date).toLocaleDateString()}
                  </span>

                  {event.location && (
                    <span>
                      <FaMapMarkerAlt />
                      {event.location}
                    </span>
                  )}

                  {event.category && (
                    <span>
                      <FaTag />
                      {event.category}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="remove-favorite"
                onClick={() => removeFromFavorites(event._id)}
                title="Remove from favorites"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-favorites">
          <p>No favorite events yet</p>
          <p className="empty-favorites-hint">
            Click the ⭐ icon to add favorites
          </p>
        </div>
      )}
    </div>
  );
};

export default EventFavorites;
