import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEventById, fetchUserRegisteredEvents } from '../api/eventApi';
import { getTicketByBookingId, generateQRCode } from '../api/ticketApi';
import { FaQrcode, FaDownload, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './TicketDetails.css';

const TicketDetails = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Extract eventId or bookingId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get('event');
  const bookingId = queryParams.get('bookingId');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
      return;
    }
    
    const loadTicketDetails = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user's registered events
        const registeredEvents = await fetchUserRegisteredEvents();
        
        // Find the registration - either by eventId or bookingId
        let eventRegistration = null;
        if (eventId) {
          eventRegistration = registeredEvents.find(reg => reg._id === eventId || reg.eventId === eventId);
        } else if (bookingId) {
          eventRegistration = registeredEvents.find(reg => reg.bookingId === bookingId);
        }
        
        if (!eventRegistration) {
          // If no registration found in user's list, try fetching by bookingId directly
          if (bookingId) {
            try {
              const ticketData = await getTicketByBookingId(bookingId);
              setTicket(ticketData);
              setError(null);
              setLoading(false);
              return;
            } catch (e) {
              setError('Ticket not found');
              setLoading(false);
              return;
            }
          }
          setError('No ticket found for this event');
          setLoading(false);
          return;
        }
        
        // Get event details
        const eventIdToFetch = eventRegistration.eventId || eventRegistration._id;
        const eventDetails = await fetchEventById(eventIdToFetch);
        
        // Create ticket object with combined data
        const ticketData = {
          ...eventRegistration,
          event: eventDetails,
          bookingId: eventRegistration.bookingId || `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
        
        setTicket(ticketData);
        setError(null);
      } catch (err) {
        console.error('Failed to load ticket details:', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTicketDetails();
  }, [eventId, bookingId, isAuthenticated, user, navigate, location]);

  const handleGenerateQR = async () => {
    if (!ticket || !ticket.bookingId) return;
    
    try {
      // In a real app, this would call the API to generate a QR code
      // For now, we'll use a placeholder service
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.bookingId}`);
      setShowQR(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code. Please try again.');
    }
  };
  
  const handleDownloadTicket = async () => {
    if (!ticket || !ticket.event) return;
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add event title
      doc.setFontSize(22);
      doc.setTextColor(33, 150, 243); // Blue color
      const title = ticket.event.title;
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
      
      // Add QR code if available
      if (qrCode) {
        doc.addImage(qrCode, 'PNG', 75, 30, 60, 60);
      } else {
        try {
          // Try to get QR code from API or generate one
          await handleGenerateQR();
          if (qrCode) {
            doc.addImage(qrCode, 'PNG', 75, 30, 60, 60);
          } else {
            // Use placeholder QR service as fallback
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.bookingId}`;
            doc.addImage(qrUrl, 'PNG', 75, 30, 60, 60);
          }
        } catch (err) {
          console.error('Error adding QR code to PDF:', err);
          // Add placeholder text instead
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
        ['Date', formatDate(ticket.event.date)],
        ['Location', ticket.event.location],
        ['Ticket Type', ticket.ticketType || 'Standard'],
        ['Quantity', ticket.quantity ? ticket.quantity.toString() : '1'],
        ['Total Amount', ticket.totalAmount ? `$${ticket.totalAmount.toFixed(2)}` : 'Paid'],
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
        ['Name', ticket.attendee?.name || ticket.attendee?.fullName || user?.name || 'Not provided'],
        ['Email', ticket.attendee?.email || user?.email || 'Not provided'],
        ['Phone', ticket.attendee?.phone || 'Not provided']
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
      doc.save(`EventSphere-Ticket-${ticket.event.title.replace(/\s+/g, '-')}-${ticket.bookingId}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF ticket:', err);
      alert('Failed to download ticket. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="ticket-details-container loading">
        <div className="loading-spinner"></div>
        <p>Loading ticket details...</p>
      </div>
    );
  }
  
  if (error || !ticket) {
    return (
      <div className="ticket-details-container error">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="primary-btn">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-container">
      <div className="ticket-details-card">
        <div className="ticket-header">
          <h1><FaTicketAlt /> Your Event Ticket</h1>
          <div className="ticket-actions">
            <button onClick={handleGenerateQR} className="action-btn qr-btn">
              <FaQrcode /> {showQR ? 'Hide QR' : 'Show QR Code'}
            </button>
            <button onClick={handleDownloadTicket} className="action-btn download-btn">
              <FaDownload /> Download Ticket
            </button>
          </div>
        </div>
        
        <div className="ticket-content">
          <div className="ticket-event-details">
            <h2>{ticket.event.title}</h2>
            <div className="detail-row">
              <FaCalendarAlt className="detail-icon" />
              <span>{formatDate(ticket.event.date)}</span>
            </div>
            <div className="detail-row">
              <FaMapMarkerAlt className="detail-icon" />
              <span>{ticket.event.location}</span>
            </div>
          </div>
          
          <div className="ticket-divider"></div>
          
          <div className="ticket-booking-details">
            <h3>Booking Information</h3>
            <div className="booking-info">
              <div className="booking-row">
                <span className="booking-label">Booking ID:</span>
                <span className="booking-value">{ticket.bookingId}</span>
              </div>
              <div className="booking-row">
                <span className="booking-label">Ticket Type:</span>
                <span className="booking-value">{ticket.ticketType || 'Standard'}</span>
              </div>
              <div className="booking-row">
                <span className="booking-label">Quantity:</span>
                <span className="booking-value">{ticket.quantity || 1}</span>
              </div>
              {ticket.createdAt && (
                <div className="booking-row">
                  <span className="booking-label">Booked On:</span>
                  <span className="booking-value">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="ticket-divider"></div>
          
          <div className="ticket-attendee-details">
            <h3>Attendee Information</h3>
            <div className="attendee-info">
              <div className="attendee-row">
                <FaUser className="attendee-icon" />
                <span>{user.name}</span>
              </div>
              <div className="attendee-row">
                <FaEnvelope className="attendee-icon" />
                <span>{user.email}</span>
              </div>
              {ticket.attendeeDetails?.phone && (
                <div className="attendee-row">
                  <FaPhone className="attendee-icon" />
                  <span>{ticket.attendeeDetails.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {showQR && qrCode && (
            <div className="ticket-qr-section">
              <div className="ticket-divider"></div>
              <h3>Ticket QR Code</h3>
              <p>Scan this code at the event entrance</p>
              <div className="qr-code-container">
                <img src={qrCode} alt="Ticket QR Code" />
              </div>
            </div>
          )}
        </div>
        
        <div className="ticket-footer">
          <button onClick={() => navigate('/dashboard?tab=tickets')} className="secondary-btn">
            Back to All Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;