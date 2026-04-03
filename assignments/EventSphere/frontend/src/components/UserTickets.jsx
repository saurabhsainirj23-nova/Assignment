import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserTickets, generateQRCode, createTicket } from '../api/ticketApi';
import { fetchEvents } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { FaQrcode, FaDownload, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaPlus } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './UserTickets.css';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [newTicket, setNewTicket] = useState({
    eventId: '',
    ticketType: 'Regular',
    quantity: 1,
    attendeeDetails: {
      fullName: '',
      email: '',
      phone: ''
    }
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && user.id) {
      fetchUserTickets();
      fetchAvailableEvents();
    }
  }, [user]);
  
  const fetchAvailableEvents = async () => {
    try {
      const events = await fetchEvents();
      setAvailableEvents(events);
    } catch (err) {
      console.error('Error fetching available events:', err);
    }
  };
  
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      const ticketsData = await getUserTickets(user.id);
      setTickets(ticketsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load your tickets. Please try again.');
      
      // For development, create mock tickets if API fails
      const mockTickets = [
        {
          _id: '1',
          bookingId: 'EVT-12345678',
          eventId: {
            _id: 'e1',
            title: 'Tech Conference 2023',
            date: '2023-12-15T09:00:00',
            location: 'Convention Center',
            image: 'https://via.placeholder.com/150'
          },
          ticketType: 'VIP',
          quantity: 2,
          totalAmount: 199.98,
          paymentStatus: 'completed',
          attendeeDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '555-123-4567'
          },
          createdAt: '2023-11-01T10:30:00'
        },
        {
          _id: '2',
          bookingId: 'EVT-87654321',
          eventId: {
            _id: 'e2',
            title: 'Music Festival',
            date: '2023-11-20T18:00:00',
            location: 'City Park',
            image: 'https://via.placeholder.com/150'
          },
          ticketType: 'Regular',
          quantity: 1,
          totalAmount: 49.99,
          paymentStatus: 'completed',
          attendeeDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '555-123-4567'
          },
          createdAt: '2023-10-15T14:45:00'
        },
        {
          _id: '3',
          bookingId: 'EVT-24681357',
          eventId: {
            _id: 'e3',
            title: 'Business Workshop',
            date: '2023-12-05T10:00:00',
            location: 'Business Center',
            image: 'https://via.placeholder.com/150'
          },
          ticketType: 'Early Bird',
          quantity: 1,
          totalAmount: 79.99,
          paymentStatus: 'pending',
          attendeeDetails: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '555-123-4567'
          },
          createdAt: '2023-11-05T09:15:00'
        }
      ];
      
      setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };
  
  const viewTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
  
  const navigateToTicketDetails = (bookingId) => {
    navigate(`/ticket-details?bookingId=${bookingId}`);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setQrCode(null);
  };
  
  const generateTicketQRCode = async (bookingId) => {
    try {
      // In a real app, this would call the API to generate a QR code
      // For now, we'll use a placeholder
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + bookingId);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code. Please try again.');
    }
  };
  
  const downloadTicket = async (ticket) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add event title
      doc.setFontSize(22);
      doc.setTextColor(33, 150, 243); // Blue color
      const title = ticket.eventId.title;
      const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 20);
      
      // Add EventSphere logo/text
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100); // Gray color
      doc.text('EventSphere', pageWidth - 30, 10);
      
      // Add horizontal line
      doc.setDrawColor(200, 200, 200); // Light gray
      doc.line(10, 25, pageWidth - 10, 25);
      
      // Add QR code if available or placeholder
      try {
        // Try to get QR code from API
        const qrResponse = await generateQRCode(ticket.bookingId);
        if (qrResponse && qrResponse.qrCode) {
          // Add QR code image
          doc.addImage(qrResponse.qrCode, 'PNG', 75, 30, 60, 60);
        } else {
          // Use placeholder QR service
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.bookingId}`;
          doc.addImage(qrUrl, 'PNG', 75, 30, 60, 60);
        }
      } catch (err) {
        console.error('Error adding QR code to PDF:', err);
        // Use placeholder QR service as fallback
        try {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.bookingId}`;
          doc.addImage(qrUrl, 'PNG', 75, 30, 60, 60);
        } catch (qrErr) {
          // Add placeholder text if image fails
          doc.setFontSize(10);
          doc.text('QR Code Unavailable', 75, 60);
        }
      }
      
      // Add booking ID
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Booking ID: ${ticket.bookingId}`, 10, 105);
      
      // Add event details
      doc.setFontSize(12);
      doc.text('Event Details', 10, 115);
      
      // Create table for event details
      const eventData = [
        ['Date', formatDate(ticket.eventId.date)],
        ['Location', ticket.eventId.location],
        ['Ticket Type', ticket.ticketType],
        ['Quantity', ticket.quantity.toString()],
        ['Total Amount', `$${ticket.totalAmount.toFixed(2)}`],
        ['Payment Status', ticket.paymentStatus === 'completed' ? 'Paid' : 'Pending']
      ];
      
      doc.autoTable({
        startY: 120,
        head: [['Detail', 'Value']],
        body: eventData,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add attendee information
      const attendeeY = doc.autoTable.previous.finalY + 10;
      doc.text('Attendee Information', 10, attendeeY);
      
      const attendeeData = [
        ['Name', ticket.attendeeDetails.fullName],
        ['Email', ticket.attendeeDetails.email],
        ['Phone', ticket.attendeeDetails.phone]
      ];
      
      doc.autoTable({
        startY: attendeeY + 5,
        body: attendeeData,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add footer
      const footerY = doc.autoTable.previous.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This ticket is valid only with a photo ID. Non-transferable.', 10, footerY);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 10, footerY + 5);
      
      // Save the PDF
      doc.save(`EventSphere-Ticket-${ticket.bookingId}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF ticket:', err);
      alert('Failed to download ticket. Please try again.');
    }
  };
  
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createTicket(newTicket);
      setTickets([...tickets, response]);
      setShowCreateForm(false);
      setNewTicket({
        eventId: '',
        ticketType: 'Regular',
        quantity: 1,
        attendeeDetails: {
          fullName: '',
          email: '',
          phone: ''
        }
      });
      alert('Ticket created successfully!');
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error('Error creating ticket:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewTicket({
        ...newTicket,
        [parent]: {
          ...newTicket[parent],
          [child]: value
        }
      });
    } else {
      setNewTicket({
        ...newTicket,
        [name]: value
      });
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="loading-state">Loading your tickets...</div>;
  }
  
  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchUserTickets}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="user-tickets-container">
      <div className="tickets-header">
        <h2><FaTicketAlt /> My Tickets</h2>
        <p>Manage your event registrations and tickets</p>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="create-ticket-btn"
        >
          <FaPlus /> {showCreateForm ? 'Cancel' : 'Create Ticket'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="create-ticket-form">
          <h3>Create New Ticket</h3>
          <form onSubmit={handleCreateTicket}>
            <div className="form-group">
              <label>Event</label>
              <select 
                name="eventId" 
                value={newTicket.eventId} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select an event</option>
                {availableEvents.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Ticket Type</label>
              <select 
                name="ticketType" 
                value={newTicket.ticketType} 
                onChange={handleInputChange}
                required
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Early Bird">Early Bird</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                min="1" 
                max="10"
                value={newTicket.quantity} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <h4>Attendee Details</h4>
            
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="attendeeDetails.fullName" 
                value={newTicket.attendeeDetails.fullName} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="attendeeDetails.email" 
                value={newTicket.attendeeDetails.email} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                name="attendeeDetails.phone" 
                value={newTicket.attendeeDetails.phone} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>
      )}
      
      {tickets.length === 0 ? (
        <div className="no-tickets">
          <p>You don't have any tickets yet.</p>
          <button onClick={() => navigate('/events')} className="browse-events-btn">
            Browse Events
          </button>
        </div>
      ) : (
        <div className="tickets-list-container">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-event-image">
                <img src={ticket.eventId.image || 'https://via.placeholder.com/150'} alt={ticket.eventId.title} />
              </div>
              <div className="ticket-content">
                <h3 className="ticket-event-name">{ticket.eventId.title}</h3>
                <div className="ticket-details">
                  <div className="ticket-detail">
                    <FaCalendarAlt className="ticket-icon" />
                    <span>{formatDate(ticket.eventId.date)}</span>
                  </div>
                  <div className="ticket-detail">
                    <FaMapMarkerAlt className="ticket-icon" />
                    <span>{ticket.eventId.location}</span>
                  </div>
                </div>
                <div className="ticket-info">
                  <div className="ticket-type-quantity">
                    <span className="ticket-type">{ticket.ticketType}</span>
                    <span className="ticket-quantity">x {ticket.quantity}</span>
                  </div>
                  <span className="ticket-booking-id">Booking ID: {ticket.bookingId}</span>
                </div>
                <div className="ticket-status-container">
                  <span className={`ticket-status ${ticket.paymentStatus === 'completed' ? 'status-confirmed' : 'status-pending'}`}>
                    {ticket.paymentStatus === 'completed' ? 'Confirmed' : 'Payment Pending'}
                  </span>
                </div>
              </div>
              <div className="ticket-actions">
                <button 
                  className="btn-view-ticket" 
                  onClick={() => viewTicketDetails(ticket)}
                  title="View Ticket Details"
                >
                  Quick View
                </button>
                <button 
                  className="btn-view-ticket" 
                  onClick={() => navigateToTicketDetails(ticket.bookingId)}
                  title="View Full Ticket Details"
                >
                  Full Details
                </button>
                <button 
                  className="btn-qr-code" 
                  onClick={() => {
                    viewTicketDetails(ticket);
                    generateTicketQRCode(ticket.bookingId);
                  }}
                  title="Show QR Code"
                >
                  <FaQrcode />
                </button>
                <button 
                  className="btn-download" 
                  onClick={() => downloadTicket(ticket)}
                  title="Download Ticket"
                >
                  <FaDownload />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ticket Details</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="ticket-details-container">
              <div className="ticket-detail-section">
                <h4>Booking Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{selectedTicket.bookingId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date Booked:</span>
                  <span className="detail-value">{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className={`status-badge ${selectedTicket.paymentStatus === 'completed' ? 'status-success' : 'status-pending'}`}>
                    {selectedTicket.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="ticket-detail-section">
                <h4>Event Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Event:</span>
                  <span className="detail-value">{selectedTicket.eventId.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date & Time:</span>
                  <span className="detail-value">{formatDate(selectedTicket.eventId.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedTicket.eventId.location}</span>
                </div>
              </div>
              
              <div className="ticket-detail-section">
                <h4>Attendee Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedTicket.attendeeDetails.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedTicket.attendeeDetails.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedTicket.attendeeDetails.phone}</span>
                </div>
              </div>
              
              <div className="ticket-detail-section">
                <h4>Ticket Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Ticket Type:</span>
                  <span className="detail-value">{selectedTicket.ticketType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{selectedTicket.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">${selectedTicket.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {qrCode && (
                <div className="ticket-detail-section qr-code-section">
                  <h4>QR Code</h4>
                  <div className="qr-code-container">
                    <img src={qrCode} alt="Ticket QR Code" className="qr-code-image" />
                    <p className="qr-code-info">Scan this QR code to verify the ticket at the event.</p>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                {!qrCode && (
                  <button 
                    className="btn-generate-qr" 
                    onClick={() => generateTicketQRCode(selectedTicket.bookingId)}
                  >
                    Generate QR Code
                  </button>
                )}
                <button 
                  className="btn-download-ticket" 
                  onClick={() => downloadTicket(selectedTicket)}
                >
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTickets;