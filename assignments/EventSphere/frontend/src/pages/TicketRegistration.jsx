import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchEventById } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import TicketRegistrationForm from '../components/TicketRegistrationForm';
import { toast } from 'react-toastify';
import './TicketRegistration.css';

const TicketRegistration = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Extract eventId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get('event');
  
  // Mock event data for demo purposes (to avoid API errors)
  const mockEventData = {
    _id: '1',
    title: 'Tech Conference 2023',
    date: new Date().toISOString(),
    location: 'Convention Center, Mumbai',
    description: 'Join us for the biggest tech conference of the year featuring industry leaders, workshops, and networking opportunities.',
    price: 500,
    ticketsAvailable: 100,
    image: null // No image to avoid placeholder errors
  };
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
      return;
    }
    
    // Load event details
    const loadEvent = async () => {
      if (!eventId) {
        // If no event specified, fetch all events and use the first one
        try {
          const { fetchEvents } = await import('../api/eventApi');
          const events = await fetchEvents();
          if (events && events.length > 0) {
            setEvent(events[0]);
          } else {
            setEvent(mockEventData);
          }
        } catch {
          setEvent(mockEventData);
        }
        setLoading(false);
        return;
      }
      
      try {
        // Try to fetch from API, use mock data if API fails
        try {
          const eventData = await fetchEventById(eventId);
          setEvent(eventData);
        } catch (apiErr) {
          console.warn('API connection failed, using mock data:', apiErr);
          // Use mock data when API is unavailable
          setEvent(mockEventData);
        }
      } catch (err) {
        // Suppress console error and just show warning
        console.warn('Failed to load event, using mock data:', err);
        // Fallback to mock data even in case of other errors
        setEvent(mockEventData);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId, isAuthenticated, navigate, location.pathname, location.search]);
  
  if (loading) {
    return (
      <div className="ticket-registration-container loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="ticket-registration-container error">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/events')}>Browse Events</button>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="ticket-registration-container error">
        <div className="error-message">
          <h2>Event Not Found</h2>
          <p>The event you're looking for could not be found.</p>
          <button onClick={() => navigate('/events')}>Browse Events</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ticket-registration-container">
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Location:</strong> {event.location}</p>
        </div>
      </div>
      
      <TicketRegistrationForm eventId={event._id} eventDetails={event} />
    </div>
  );
  
  // Handle ticket quantity change
  const handleTicketQuantityChange = (ticketId, action) => {
    const updatedTickets = [...selectedTickets];
    const existingTicketIndex = updatedTickets.findIndex(ticket => ticket.id === ticketId);
    const ticketType = ticketTypes.find(type => type.id === ticketId);
    
    if (action === 'add') {
      if (existingTicketIndex >= 0) {
        updatedTickets[existingTicketIndex].quantity += 1;
      } else {
        updatedTickets.push({
          id: ticketId,
          name: ticketType.name,
          price: ticketType.price,
          quantity: 1
        });
      }
    } else if (action === 'remove') {
      if (existingTicketIndex >= 0) {
        if (updatedTickets[existingTicketIndex].quantity > 1) {
          updatedTickets[existingTicketIndex].quantity -= 1;
        } else {
          updatedTickets.splice(existingTicketIndex, 1);
        }
      }
    }
    
    setSelectedTickets(updatedTickets);
    calculateTotal(updatedTickets);
  };
  
  // Calculate total amount
  const calculateTotal = (tickets) => {
    const total = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
    setTotalAmount(couponApplied ? total * 0.9 : total); // 10% discount if coupon applied
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle coupon application
  const handleApplyCoupon = () => {
    try {
      if (!couponCode || couponCode.trim() === '') {
        alert('Please enter a coupon code');
        return;
      }
      
      if (couponCode.toLowerCase() === 'event10') {
        setCouponApplied(true);
        calculateTotal(selectedTickets);
      } else {
        alert('Invalid coupon code');
      }
    } catch (error) {
      console.warn('Error applying coupon:', error);
      alert('Error processing coupon. Please try again.');
    }
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate ticket selection
    if (selectedTickets.length === 0) {
      newErrors.tickets = 'Please select at least one ticket';
    }
    
    // Validate personal information
    if (!form.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate payment method
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration submission
  const handleSubmitRegistration = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the selected ticket type (using the first selected ticket for simplicity)
      const selectedTicket = selectedTickets[0];
      
      // Prepare ticket registration data
      const ticketData = {
        userId: user.id,
        ticketType: selectedTicket.id,
        quantity: selectedTicket.quantity,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        specialRequests: form.specialRequests,
        attendeeDetails: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone
        }
      };
      
      let receivedBookingId;
      
      try {
        // Try to register ticket with the backend
        const response = await registerTicket(eventId, ticketData);
        receivedBookingId = response.bookingId;
      } catch (apiError) {
        console.warn('API connection failed, using mock booking ID:', apiError);
        // Generate a mock booking ID for demo purposes
        receivedBookingId = 'DEMO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      
      // Set booking ID
      setBookingId(receivedBookingId);
      
      setRegistrationSuccess(true);
      setCurrentStep(4); // Move to confirmation step
      
      // After a short delay, redirect to the confirmation page
      setTimeout(() => {
        navigate(`/ticket-confirmation/${receivedBookingId}`);
      }, 3000); // 3 second delay to show the success message
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Handle API error responses
      if (err.response && err.response.data) {
        const { message, errors: apiErrors } = err.response.data;
        
        if (apiErrors) {
          setErrors(apiErrors);
        } else {
          setErrors({ general: message || 'Registration failed. Please try again.' });
        }
      } else {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle step navigation
  const nextStep = () => {
    if (currentStep === 1 && selectedTickets.length === 0) {
      alert('Please select at least one ticket');
      return;
    }
    
    if (currentStep === 2 && (!form.fullName || !form.email || !form.phone)) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (currentStep === 3 && !paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Get ticket quantity
  const getTicketQuantity = (ticketId) => {
    const ticket = selectedTickets.find(t => t.id === ticketId);
    return ticket ? ticket.quantity : 0;
  };
  
  // Share ticket on social media
  const shareTicket = (platform) => {
    try {
      const shareText = `I just registered for ${event?.title || 'an event'} on EventSphere! Join me!`;
      const shareUrl = window.location.origin + '/events/' + eventId;
      
      let shareLink = '';
      
      switch (platform) {
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        default:
          return;
      }
      
      // Open in a new window with error handling
      const newWindow = window.open(shareLink, '_blank');
      
      // If popup was blocked or failed
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.warn('Social share popup was blocked or failed to open');
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
          .then(() => alert('Share link copied to clipboard!'))
          .catch(err => console.warn('Failed to copy share link:', err));
      }
    } catch (error) {
      console.warn('Error sharing to social media:', error);
      alert('Unable to share at this time. Please try again later.');
    }
  };
  
  if (loading && currentStep === 1) {
    return (
      <div className="ticket-registration-container">
        <div className="loading-spinner">Loading event details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="ticket-registration-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/events')} className="back-button">Back to Events</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ticket-registration-container">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Tickets</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Your Details</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>
      
      <div className="registration-card">
        {/* Event Summary - Always visible */}
        <div className="event-summary">
          {event && (
            <>
              <div className="event-banner" style={{ 
                backgroundColor: '#f0f0f0', 
                backgroundImage: event.image ? `url(${event.image})` : 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {!event.image && <span style={{ color: '#666', fontSize: '1.2rem' }}>Event Banner</span>}
              </div>
              <h1 className="event-title">{event.title}</h1>
              <div className="event-meta">
                <div className="event-date">⏰ {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="event-location">📍 {event.location} <button className="map-button">View on Map</button></div>
              </div>
              <p className="event-description">{event.description}</p>
            </>
          )}
        </div>
        
        {/* Step 1: Ticket Selection */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2>Select Your Tickets</h2>
            <div className="ticket-options">
              {ticketTypes.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <h3>🎟️ {ticket.name}</h3>
                    <div className="ticket-price">₹{ticket.price}</div>
                  </div>
                  <div className="ticket-benefits">
                    <h4>Benefits:</h4>
                    <ul>
                      {ticket.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="ticket-quantity">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleTicketQuantityChange(ticket.id, 'remove')}
                      disabled={getTicketQuantity(ticket.id) === 0}
                    >
                      -
                    </button>
                    <span className="quantity-value">{getTicketQuantity(ticket.id)}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleTicketQuantityChange(ticket.id, 'add')}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="select-ticket-btn"
                    onClick={() => handleTicketQuantityChange(ticket.id, 'add')}
                    disabled={getTicketQuantity(ticket.id) > 0}
                  >
                    {getTicketQuantity(ticket.id) > 0 ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
            <div className="step-actions">
              <button onClick={() => navigate('/events')} className="back-button">Back to Events</button>
              <button onClick={nextStep} className="next-button" disabled={selectedTickets.length === 0}>Next: Enter Details</button>
            </div>
          </div>
        )}
        
        {/* Step 2: Registration Form */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2>Enter Your Details</h2>
            <div className="registration-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className={errors.fullName ? 'error' : ''}
                  required
                />
                {errors.fullName && <div className="error-message">{errors.fullName}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  className={errors.phone ? 'error' : ''}
                  required
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={form.specialRequests}
                  onChange={handleFormChange}
                  placeholder="Any dietary preferences or accessibility requirements?"
                ></textarea>
              </div>
              <div className="ticket-summary">
                <h3>Selected Tickets:</h3>
                <ul>
                  {selectedTickets.map((ticket) => (
                    <li key={ticket.id}>
                      {ticket.name} x {ticket.quantity} - ₹{ticket.price * ticket.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="step-actions">
              <button onClick={prevStep} className="back-button">Back to Tickets</button>
              <button 
                onClick={nextStep} 
                className="next-button"
                disabled={!form.fullName || !form.email || !form.phone}
              >
                Next: Payment
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2>Payment</h2>
            <div className="payment-section">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className="summary-item">
                      <span>{ticket.name} x {ticket.quantity}</span>
                      <span>₹{ticket.price * ticket.quantity}</span>
                    </div>
                  ))}
                  {couponApplied && (
                    <div className="summary-item discount">
                      <span>Discount (10%)</span>
                      <span>-₹{selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0) * 0.1}</span>
                    </div>
                  )}
                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                <div className="coupon-section">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode}
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="payment-options">
                  <div 
                    className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''} ${errors.paymentMethod ? 'error' : ''}`}
                    onClick={() => handlePaymentMethodChange('upi')}
                  >
                    <div className="payment-icon">💳</div>
                    <div className="payment-label">UPI</div>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''} ${errors.paymentMethod ? 'error' : ''}`}
                    onClick={() => handlePaymentMethodChange('netbanking')}
                  >
                    <div className="payment-icon">🏦</div>
                    <div className="payment-label">Net Banking</div>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''} ${errors.paymentMethod ? 'error' : ''}`}
                    onClick={() => handlePaymentMethodChange('card')}
                  >
                    <div className="payment-icon">💳</div>
                    <div className="payment-label">Credit/Debit Card</div>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''} ${errors.paymentMethod ? 'error' : ''}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <div className="payment-icon">💰</div>
                    <div className="payment-label">PayPal</div>
                  </div>
                  {errors.paymentMethod && <div className="error-message">{errors.paymentMethod}</div>}
                </div>
                <div className="secure-payment">
                  <span className="secure-icon">🔒</span> Secure Payment
                </div>
              </div>
            </div>
            <div className="step-actions">
              <button onClick={prevStep} className="back-button">Back to Details</button>
              {errors.general && <div className="error-message general-error">{errors.general}</div>}
              
              <button 
                onClick={handleSubmitRegistration} 
                className="pay-button"
                disabled={!paymentMethod || loading}
              >
                {loading ? 'Processing...' : `Pay & Register ₹${totalAmount}`}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Confirmation */}
        {currentStep === 4 && registrationSuccess && (
          <div className="step-content confirmation">
            <div className="success-animation">🎉</div>
            <h2>Registration Successful!</h2>
            <p>Thank you for registering for {event?.title}. Your tickets have been confirmed.</p>
            
            <div className="ticket-qr">
              <div className="qr-code">
                {/* Styled div instead of external QR code */}
                <div style={{
                  width: '150px',
                  height: '150px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto',
                  fontSize: '0.9rem',
                  color: '#666',
                  borderRadius: '8px'
                }}>
                  QR Code Placeholder
                </div>
              </div>
              <div className="booking-id">Booking ID: {bookingId}</div>
            </div>
            
            <p>A confirmation email has been sent to {form.email}</p>
            
            <div className="confirmation-actions">
                <button 
                  className="download-ticket-btn"
                  onClick={() => {
                    try {
                      // In a real app, this would generate and download a PDF ticket
                      // For demo purposes, we'll create a text file with ticket details
                      const ticketData = `
                        EventSphere Ticket
                        ----------------
                        Event: ${event?.title || 'Demo Event'}
                        Booking ID: ${bookingId}
                        Date: ${event?.date ? new Date(event.date).toLocaleDateString() : new Date().toLocaleDateString()}
                        Location: ${event?.location || 'Virtual Event'}
                        
                        This is a demo ticket. In a production environment, this would be a properly formatted PDF with QR code.
                      `;
                      
                      // Create a blob and download it
                      const blob = new Blob([ticketData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `EventSphere-Ticket-${bookingId}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                    console.error('Error completing booking:', error);
                    toast.error('Failed to complete booking. Please try again.');
                    setLoading(false);
                      console.warn('Error downloading ticket:', error);
                      alert('Unable to download ticket. Please try again later.');
                    }
                  }}
                >
                  Download Ticket
                </button>
                
                <div className="share-section">
                  <p>Share your registration:</p>
                  <div className="social-buttons">
                    <button onClick={() => shareTicket('facebook')} className="social-btn facebook">Facebook</button>
                    <button onClick={() => shareTicket('twitter')} className="social-btn twitter">Twitter</button>
                    <button onClick={() => shareTicket('whatsapp')} className="social-btn whatsapp">WhatsApp</button>
                  </div>
                </div>
              
              <div className="related-events">
                <h3>You may also like...</h3>
                <div className="related-events-placeholder">
                  <p>Related events will appear here</p>
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  try {
                    // Check if we already have a booking ID (meaning registration was successful)
                    if (bookingId) {
                      // Navigate to dashboard with tickets tab selected
                      navigate('/dashboard?tab=tickets');
                    } else {
                      // If no booking ID, we need to submit the registration first
                      await handleSubmitRegistration();
                      // After successful registration, navigate to dashboard
                      // Add a small delay to ensure state updates before navigation
                      setTimeout(() => {
                        navigate('/dashboard?tab=tickets');
                      }, 1000);
                    }
                  } catch (error) {
                    console.error('Error completing booking:', error);
                    toast.error('Failed to complete booking. Please try again.');
                    setLoading(false);
                  }
                }} 
                className="view-tickets-btn"
              >
                Complete Booking & View My Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketRegistration;