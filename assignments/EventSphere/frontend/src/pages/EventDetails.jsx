import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchEventById, checkEventRegistration } from '../api/eventApi';
import LoadingState from '../components/LoadingState';
import SeatSelection from '../components/SeatSelection';
import { useAuth } from '../context/AuthContext';
import { FaEdit } from 'react-icons/fa';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketType, setTicketType] = useState('standard');
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const data = await fetchEventById(eventId);
        setEvent(data);
        setError(null);
        
        // Check if user is registered for this event
        if (isAuthenticated) {
          try {
            const registrationData = await checkEventRegistration(eventId);
            setIsRegistered(registrationData.isRegistered);
            if (registrationData.isRegistered) {
              setRegistrationDetails(registrationData.registrationDetails);
            }
          } catch (regErr) {
            console.debug('Error checking registration:', regErr);
            // Don't set error state for registration check failures
          }
        }
      } catch (err) {
        console.error('Failed to load event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, isAuthenticated]);
  
  const handleSeatSelection = (seats) => {
    setSelectedSeats(seats);
  };
  
  const handleTicketTypeChange = (e) => {
    setTicketType(e.target.value);
  };
  
  const handleGetTickets = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    setShowSeatSelection(true);
  };
  
  const handleProceedToCheckout = () => {
    if (event.hasSeating && selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    
    // Navigate to ticket registration page with selected seats and event info
    navigate(`/ticket-registration?event=${eventId}`, {
      state: {
        selectedSeats: event.hasSeating ? selectedSeats : [],
        ticketType,
        quantity: event.hasSeating ? selectedSeats.length : 1
      }
    });
  };
  
  // Generate available seats based on event data
  const generateAvailableSeats = () => {
    if (event?.hasSeating && event?.availableSeats) {
      // Use available seats from the event data
      return event.availableSeats.map(seat => seat);
    } else {
      // Fallback for events without seating data
      const totalSeats = 100; // 10x10 grid
      const unavailableSeats = [];
      
      // Randomly mark some seats as unavailable
      for (let i = 0; i < 20; i++) {
        const randomSeat = Math.floor(Math.random() * totalSeats) + 1;
        if (!unavailableSeats.includes(randomSeat)) {
          unavailableSeats.push(randomSeat);
        }
      }
      
      // Return available seats
      return Array.from({ length: totalSeats }, (_, i) => i + 1)
        .filter(seat => !unavailableSeats.includes(seat));
    }
  };

  if (loading) {
    return <div className="event-details-container">
      <LoadingState message="Loading event details..." />
    </div>;
  }

  if (!event) {
    return <div className="event-details-container not-found">Event not found</div>;
  }

  return (
    <div className="event-details-container">
      <div className="event-details-card">
        <div className="event-header">
          <h1 className="event-title">{event.title}</h1>
          {isAuthenticated && user && user.role === 'admin' && (
            <button 
              className="edit-event-btn" 
              onClick={() => navigate(`/events/${eventId}/edit`)}
              title="Edit Event"
            >
              <FaEdit /> Edit Event
            </button>
          )}
        </div>
        <div className="event-meta">
          <p><span>📅 Date:</span> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><span>📍 Location:</span> {event.location}</p>
          <p><span>👥 Organizer:</span> {event.organizer}</p>
          <p><span>👤 Capacity:</span> {event.capacity} attendees</p>
        </div>
        <div className="event-description">
          <h3>About this event</h3>
          <p>{event.description}</p>
        </div>
        
        {isRegistered ? (
          <div className="already-registered">
            <h3>You are already registered for this event!</h3>
            <div className="registration-details">
              <p><strong>Booking ID:</strong> {registrationDetails?.bookingId}</p>
              <p><strong>Ticket Type:</strong> {registrationDetails?.ticketType}</p>
              <p><strong>Quantity:</strong> {registrationDetails?.quantity || registrationDetails?.selectedSeats?.length || 1}</p>
              {registrationDetails?.selectedSeats?.length > 0 && (
                <p><strong>Selected Seats:</strong> {registrationDetails.selectedSeats.join(', ')}</p>
              )}
            </div>
          </div>
        ) : !showSeatSelection ? (
          <div className="event-actions">
            <button onClick={handleGetTickets} className="register-btn">Get Tickets</button>
            <Link to="/events" className="back-btn">Back to Events</Link>
          </div>
        ) : (
          <div className="ticket-booking-section">
            <h3>Select Your Tickets</h3>
            
            <div className="ticket-types">
              <div className="ticket-type-selector">
                <label htmlFor="ticketType">Ticket Type:</label>
                <select 
                  id="ticketType" 
                  value={ticketType} 
                  onChange={handleTicketTypeChange}
                >
                  <option value="standard">Standard - ₹{event.price || 500}</option>
                  <option value="vip">VIP - ₹{(event.price * 2) || 1000}</option>
                  <option value="premium">Premium - ₹{(event.price * 1.5) || 750}</option>
                </select>
              </div>
              
              <div className="ticket-price">
                <span>Price per ticket:</span>
                <span className="price">
                  ₹{ticketType === 'standard' ? event.price || 500 : 
                     ticketType === 'vip' ? (event.price * 2) || 1000 : 
                     (event.price * 1.5) || 750}
                </span>
              </div>
            </div>
            
            {event.hasSeating ? (
              <SeatSelection 
                eventId={eventId}
                availableSeats={generateAvailableSeats()}
                onSeatSelect={handleSeatSelection}
              />
            ) : (
              <div className="no-seating-message">
                <p>This event does not have assigned seating.</p>
                <p>Tickets will be assigned on a first-come, first-served basis.</p>
              </div>
            )}
            
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-row">
                <span>Ticket Type:</span>
                <span>{ticketType.charAt(0).toUpperCase() + ticketType.slice(1)}</span>
              </div>
              <div className="summary-row">
                <span>Number of Seats:</span>
                <span>{selectedSeats.length}</span>
              </div>
              <div className="summary-row">
                <span>Price per Ticket:</span>
                <span>
                  ₹{ticketType === 'standard' ? event.price || 500 : 
                     ticketType === 'vip' ? (event.price * 2) || 1000 : 
                     (event.price * 1.5) || 750}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>
                  ₹{selectedSeats.length * (ticketType === 'standard' ? event.price || 500 : 
                                           ticketType === 'vip' ? (event.price * 2) || 1000 : 
                                           (event.price * 1.5) || 750)}
                </span>
              </div>
            </div>
            
            <div className="booking-actions">
              <button 
                className="back-button"
                onClick={() => setShowSeatSelection(false)}
              >
                Back to Event Details
              </button>
              <button 
                className="checkout-button"
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
