import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import './TicketRegistrationForm.css';

const TicketRegistrationForm = ({ eventId, eventDetails }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get selected seats and ticket type from location state if available
  const selectedSeatsFromState = location.state?.selectedSeats || [];
  const ticketTypeFromState = location.state?.ticketType || 'standard';
  const quantityFromState = location.state?.quantity || 1;
  
  // Log location state for debugging
  console.log('Location state:', location.state);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    ticketQuantity: quantityFromState,
    specialRequirements: '',
    selectedSeats: selectedSeatsFromState,
    ticketType: ticketTypeFromState
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [ticketsAvailable, setTicketsAvailable] = useState(eventDetails?.ticketsAvailable || 0);
  const [ticketPrice, setTicketPrice] = useState(eventDetails?.price || 0);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Update form with user data when available
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email
      }));
    }

    // Update event details when available
    if (eventDetails) {
      setTicketsAvailable(eventDetails.ticketsAvailable || 0);
      
      // Calculate price based on ticket type
      let price = eventDetails.price || 0;
      if (formData.ticketType === 'vip') {
        price = price * 2;
      } else if (formData.ticketType === 'premium') {
        price = price * 1.5;
      }
      setTicketPrice(price);
    }
  }, [user, eventDetails, formData.ticketType]);

  // Calculate total amount when ticket quantity or price changes
  useEffect(() => {
    setTotalAmount(formData.ticketQuantity * ticketPrice);
  }, [formData.ticketQuantity, ticketPrice]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Validate ticket quantity
    if (formData.ticketQuantity < 1) {
      newErrors.ticketQuantity = 'Quantity must be at least 1';
    } else if (formData.ticketQuantity > ticketsAvailable) {
      newErrors.ticketQuantity = `Only ${ticketsAvailable} tickets available`;
    }
    
    // Validate payment method
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    return newErrors;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ticketQuantity') {
      // Ensure ticket quantity is within valid range
      const quantity = parseInt(value, 10);
      if (quantity >= 1 && quantity <= ticketsAvailable) {
        setFormData({
          ...formData,
          [name]: quantity
        });
      }
    } else if (name === 'ticketType') {
      // Update ticket price when ticket type changes
      let newPrice = eventDetails?.price || 0;
      if (value === 'vip') {
        newPrice = newPrice * 2;
      } else if (value === 'premium') {
        newPrice = newPrice * 1.5;
      }
      setTicketPrice(newPrice);
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      // Prepare registration data
      const registrationData = {
        userId: user?.id || user?._id,
        eventId,
        ticketType: formData.ticketType,
        quantity: formData.ticketQuantity,
        totalAmount,
        paymentMethod,
        attendeeDetails: {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        specialRequests: formData.specialRequirements,
        selectedSeats: formData.selectedSeats
      };
      
      // Submit registration
      const response = await axiosInstance.post('/registrations', registrationData);
      
      // Get registration ID from response
      const registrationId = response.data?.registrationId || response.registrationId;
      const bookingId = response.data?.bookingId || response.bookingId;
      
      // Navigate to confirmation page with both IDs
      if (registrationId) {
        navigate(`/ticket-confirmation/${registrationId}`);
      } else {
        throw new Error('Registration failed - no confirmation received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // Handle specific error responses
        if (error.response.status === 401) {
          // Unauthorized - redirect to login
          navigate('/login', { state: { from: location.pathname } });
        } else if (error.response.status === 400) {
          // Bad request - validation errors
          setErrors(error.response.data.errors || {});
          setServerError(error.response.data.message || 'Please check your information and try again.');
        } else if (error.response.status === 409) {
          // Conflict - e.g., seats already taken
          setServerError(error.response.data.message || 'These seats are no longer available. Please select different seats.');
        } else {
          // Other errors
          setServerError('An error occurred during registration. Please try again later.');
        }
      } else {
        // Network or other errors
        setServerError('Unable to connect to the server. Please check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ticket-registration-form">
      <h2>Ticket Registration</h2>
      
      {serverError && <div className="server-error">{serverError}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Ticket Information Section */}
        <div className="form-section">
          <h3>Ticket Information</h3>
          
          {formData.selectedSeats && formData.selectedSeats.length > 0 ? (
            <div className="selected-seats-info">
              <div className="form-group">
                <label>Selected Seats</label>
                <div className="selected-seats-display">
                  {formData.selectedSeats.map(seat => (
                    <span key={seat} className="seat-tag">{seat}</span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Ticket Type</label>
                <div className="ticket-type-display">
                  {formData.ticketType.charAt(0).toUpperCase() + formData.ticketType.slice(1)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="ticketType">Ticket Type</label>
                <select
                  id="ticketType"
                  name="ticketType"
                  value={formData.ticketType}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="standard">Standard - ₹{eventDetails?.price || 500}</option>
                  <option value="vip">VIP - ₹{(eventDetails?.price * 2) || 1000}</option>
                  <option value="premium">Premium - ₹{(eventDetails?.price * 1.5) || 750}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="ticketQuantity">Number of Tickets</label>
                <div className="ticket-quantity-control">
                  <button 
                    type="button" 
                    className="quantity-btn"
                    onClick={() => handleChange({ target: { name: 'ticketQuantity', value: formData.ticketQuantity - 1 } })}
                    disabled={formData.ticketQuantity <= 1 || isSubmitting}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="ticketQuantity"
                    name="ticketQuantity"
                    value={formData.ticketQuantity}
                    onChange={handleChange}
                    min="1"
                    max={ticketsAvailable}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    className="quantity-btn"
                    onClick={() => handleChange({ target: { name: 'ticketQuantity', value: formData.ticketQuantity + 1 } })}
                    disabled={formData.ticketQuantity >= ticketsAvailable || isSubmitting}
                  >
                    +
                  </button>
                </div>
                {errors.ticketQuantity && <div className="error-text">{errors.ticketQuantity}</div>}
              </div>
            </>
          )}
        </div>
        
        {/* Attendee Information Section */}
        <div className="form-section">
          <h3>Attendee Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              disabled={isSubmitting}
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="form-section">
          <h3>Payment Information</h3>
          
          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <div className="payment-method">
                <input
                  type="radio"
                  id="creditCard"
                  name="paymentMethod"
                  checked={paymentMethod === 'creditCard'}
                  onChange={() => handlePaymentMethodChange('creditCard')}
                  disabled={isSubmitting}
                />
                <label htmlFor="creditCard">
                  <i className="fas fa-credit-card"></i> Credit Card
                </label>
              </div>
              
              <div className="payment-method">
                <input
                  type="radio"
                  id="debitCard"
                  name="paymentMethod"
                  checked={paymentMethod === 'debitCard'}
                  onChange={() => handlePaymentMethodChange('debitCard')}
                  disabled={isSubmitting}
                />
                <label htmlFor="debitCard">
                  <i className="fas fa-credit-card"></i> Debit Card
                </label>
              </div>
              
              <div className="payment-method">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => handlePaymentMethodChange('upi')}
                  disabled={isSubmitting}
                />
                <label htmlFor="upi">
                  <i className="fas fa-mobile-alt"></i> UPI
                </label>
              </div>
              
              <div className="payment-method">
                <input
                  type="radio"
                  id="netBanking"
                  name="paymentMethod"
                  checked={paymentMethod === 'netBanking'}
                  onChange={() => handlePaymentMethodChange('netBanking')}
                  disabled={isSubmitting}
                />
                <label htmlFor="netBanking">
                  <i className="fas fa-university"></i> Net Banking
                </label>
              </div>
            </div>
            {errors.paymentMethod && <div className="error-text">{errors.paymentMethod}</div>}
          </div>
        </div>
        
        {/* Special Requirements */}
        <div className="form-section">
          <h3>Special Requirements</h3>
          
          <div className="form-group">
            <label htmlFor="specialRequirements">Any special requirements or requests?</label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              placeholder="E.g., wheelchair access, dietary restrictions, etc."
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="form-section order-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-item">
            <span>Ticket Type:</span>
            <span>{formData.ticketType.charAt(0).toUpperCase() + formData.ticketType.slice(1)}</span>
          </div>
          
          <div className="summary-item">
            <span>Quantity:</span>
            <span>{formData.ticketQuantity}</span>
          </div>
          
          <div className="summary-item">
            <span>Price per Ticket:</span>
            <span>₹{ticketPrice.toFixed(2)}</span>
          </div>
          
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Complete Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketRegistrationForm;