import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, registerForEvent, fetchUserRegisteredEvents, checkEventRegistration } from '../api/eventApi';
import EventCard from '../components/EventCard';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Events.css';
frontend/src/pages/RegisteredEvents.jsx;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter events based on search term and category
  const filterEvents = useCallback(() => {
    if (!events.length) return;
    
    let result = [...events];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term) ||
        (event.location && event.location.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(event => 
        event.category && event.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    setFilteredEvents(result);
  }, [events, searchTerm, filterCategory]);
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents();
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('MongoDB events loaded successfully:', data.length);
          setEvents(data);
          setFilteredEvents(data);
        } else if (data && Array.isArray(data) && data.length === 0) {
          console.log('No events found in MongoDB');
          setEvents([]);
          setFilteredEvents([]);
          // No error message for empty events
        } else {
          console.warn('Invalid events data format received from MongoDB');
          setEvents([]);
          setFilteredEvents([]);
          // No error message for invalid data format
        }
        
        // If user is authenticated, fetch their registered events
        if (isAuthenticated && user) {
          try {
            const registeredEventsData = await fetchUserRegisteredEvents();
            if (registeredEventsData && Array.isArray(registeredEventsData)) {
              // Extract event IDs from the registered events data
              const registeredEventIds = registeredEventsData.map(event => event.eventId);
              setRegisteredEvents(registeredEventIds);
            }
          } catch (error) {
            console.debug('Failed to load registered events:', error);
            // Don't set error state here to avoid blocking the main events display
          }
        }
      } catch (error) {
        console.debug('Failed to load events from MongoDB:', error);
        // No error message for connection failure
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isAuthenticated, user]);
  
  // Apply filters whenever search term or category changes
  useEffect(() => {
    filterEvents();
  }, [filterEvents, searchTerm, filterCategory]);

  // Sync queued registrations when back online
  useEffect(() => {
    const syncQueuedRegistrations = async () => {
      if (!navigator.onLine) return;

      const queuedRegistrations = JSON.parse(localStorage.getItem('queuedRegistrations') || '[]');
      if (queuedRegistrations.length === 0) return;

      for (const { eventId, userId } of queuedRegistrations) {
        try {
          await registerForEvent(eventId, { userId });
          setRegisteredEvents((prev) => [...prev, eventId]);
        } catch (error) {
          console.error('Failed to sync queued registration:', error);
        }
      }

      localStorage.setItem('queuedRegistrations', '[]'); // Clear queue
    };

    window.addEventListener('online', syncQueuedRegistrations);
    syncQueuedRegistrations(); // Attempt sync on component mount
    return () => window.removeEventListener('online', syncQueuedRegistrations);
  }, []);

  // Simulated AI anomaly detection function (integrate with actual ML model for ITBP threat detection)
  const checkRegistrationAnomaly = async (eventId, userId) => {
    // This is a placeholder implementation
    // In a real-world scenario, this would connect to an AI service
    // that analyzes patterns for potential security threats
    console.log('Checking for registration anomalies:', { eventId, userId });
    // Example logic: Flag if user registers for more than 10 events
    const registrationCount = registeredEvents.length;
    return registrationCount > 10; // Threshold set to 10
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate(`/login?redirect=/events&eventId=${eventId}`);
      return;
    }
    
    if (!user || (!user._id && !user.id)) {
      console.error('User data is missing or invalid:', user);
      alert('Unable to register: User data is missing. Please log in again.');
      navigate('/login');
      return;
    }
    
    try {
      // Check registration status from database
      const registrationStatus = await checkEventRegistration(eventId);
      
      if (registrationStatus.isRegistered) {
        // Update local state to reflect registration
        if (!isEventRegistered(eventId)) {
          setRegisteredEvents([...registeredEvents, eventId]);
        }
        // Show notification and redirect to ticket page
      toast.info("You are already registered for this event", {
        onClose: () => navigate(`/ticket-registration?event=${eventId}`)
      });
        return;
      }
      
      // If not registered, continue with registration process
      // AI-driven anomaly check for intelligent threat detection
      const isSuspicious = await checkRegistrationAnomaly(eventId, user._id || user.id);
      if (isSuspicious) {
        alert('Registration flagged as suspicious. Please contact ITBP support.');
        // Optional: Log to ITBP command system for further analysis
        return;
      }
      
      // Check network status for resilience in remote border regions
      if (!navigator.onLine) {
        // Queue the registration request for later sync
        const queuedRegistrations = JSON.parse(localStorage.getItem('queuedRegistrations') || '[]');
        queuedRegistrations.push({ eventId, userId: user._id || user.id });
        localStorage.setItem('queuedRegistrations', JSON.stringify(queuedRegistrations));
        alert('No network connection. Registration queued and will sync when online.');
        return;
      }
      
      // Call the API to register for the event
      await registerForEvent(eventId, { userId: user._id || user.id });
      
      // Update local state to reflect registration
      setRegisteredEvents([...registeredEvents, eventId]);
      
      // Show success message and redirect to basic registration page
      navigate(`/basic-registration?event=${eventId}`);
    } catch (error) {
      console.error('Failed to register for event:', {
        eventId,
        userId: user._id || user.id,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      
      // Check for token expiration
      if (error.response?.status === 401 && error.response?.data?.message === 'jwt expired') {
        alert('Your session has expired. Please log in again.');
        // Redirect to login with return URL
        navigate(`/login?redirect=${encodeURIComponent('/events')}&eventId=${eventId}`);
      } else {
        // Handle other errors
        const errorMessage = error.response?.data?.message || 'Failed to register for event. Please try again.';
        alert(errorMessage);
      }
    }
  };
  
  const isEventRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
  };
  
  // No duplicate function needed here

  // Extract unique categories from events for the filter dropdown
  const categories = [...new Set(events.filter(event => event.category).map(event => event.category))];
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  return (
    <div className="events-page">
      <header className="events-header">
        <h2>🎉 Discover Upcoming Events</h2>
        <p>From tech talks to talent shows — there's something for everyone!</p>
      </header>
      
      {!loading && !error && events.length > 0 && (
        <div className="events-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <select 
              value={filterCategory} 
              onChange={handleCategoryChange}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading events..." />
      ) : events.length === 0 ? (
        <div className="no-events">
          <p>No events available right now. Stay tuned for updates! 🚧</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events match your search criteria. Try adjusting your filters! 🔍</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event._id} 
              event={event} 
              registered={isEventRegistered(event._id)}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default Events;