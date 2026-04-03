import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, fetchUserRegisteredEvents, cancelEventRegistration } from '../api/eventApi';
import LoadingState from '../components/LoadingState';
import EventCalendar from '../components/Calendar';
import EventAnalytics from '../components/EventAnalytics';
import EventFilters from '../components/EventFilters';
import EventFavorites from '../components/EventFavorites';
import UserProfile from '../components/UserProfile';
import UserTickets from '../components/UserTickets';
import './Dashboard.css';
import '../components/EventAnalytics.css';
import '../components/EventFilters.css';
import '../components/EventFavorites.css';
import '../components/UserProfile.css';
import '../components/UserTickets.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { FaHome, FaCalendarAlt, FaTicketAlt, FaChartBar, FaComments, FaCog, FaSearch, FaBell, FaPlus, FaTicketAlt as FaTicket, FaBullhorn, FaMapMarkerAlt, FaCalendarDay, FaTag } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Dashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Check for tab parameter in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam && ['dashboard', 'events', 'tickets', 'analytics', 'messages', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    upcomingCount: 0,
    pastCount: 0,
    revenue: 5240,
    ticketsSold: 42
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Sample notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New registration for Tech Conference', time: '10 mins ago', read: false },
    { id: 2, text: 'Your event "Music Festival" was updated', time: '1 hour ago', read: false },
    { id: 3, text: 'Payment received for Workshop registration', time: '2 days ago', read: true },
  ]);
  
  // Sample recent registrations
  const [recentRegistrations, setRecentRegistrations] = useState([
    { id: 1, name: 'John Doe', event: 'Tech Conference', time: '10 mins ago' },
    { id: 2, name: 'Jane Smith', event: 'Music Festival', time: '1 hour ago' },
    { id: 3, name: 'Robert Johnson', event: 'Workshop', time: '3 hours ago' },
    { id: 4, name: 'Emily Davis', event: 'Tech Conference', time: '5 hours ago' },
    { id: 5, name: 'Michael Brown', event: 'Workshop', time: '1 day ago' },
  ]);
  
  // Sample recommended events
  const [recommendedEvents, setRecommendedEvents] = useState([
    { id: 1, title: 'AI Workshop', date: '2023-12-15', category: 'Technology' },
    { id: 2, title: 'Marketing Conference', date: '2023-12-20', category: 'Business' },
    { id: 3, title: 'Music Festival', date: '2023-12-25', category: 'Entertainment' },
  ]);
  
  // Note: attendanceData and ticketSalesData are declared again later in the code, so removing them here
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('eventFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('eventFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Add event to favorites
  const addToFavorites = (event) => {
    if (!favorites.some(fav => fav._id === event._id)) {
      const newFavorites = [...favorites, event];
      setFavorites(newFavorites);
    }
  };

  // Remove event from favorites
  const removeFromFavorites = (eventId) => {
    const newFavorites = favorites.filter(event => event._id !== eventId);
    setFavorites(newFavorites);
  };

  // Check if an event is in favorites
  const isFavorite = (eventId) => {
    return favorites.some(event => event._id === eventId);
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch all events to display upcoming ones
        const allEvents = await fetchEvents();
        const now = new Date();
        
        // Sort events by date and take the next 3
        const upcoming = allEvents
          .filter(event => new Date(event.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        
        setUpcomingEvents(upcoming);
        setFilteredEvents(upcoming);
        
        // Calculate total upcoming events
        const upcomingCount = allEvents.filter(event => new Date(event.date) > now).length;
        
        // Calculate past events
        const pastCount = allEvents.filter(event => new Date(event.date) <= now).length;
        
        let userRegisteredEvents = [];
        
        try {
          // Fetch user's registered events
          const userEvents = await fetchUserRegisteredEvents();
          userRegisteredEvents = userEvents.map(registration => ({
            ...registration.event,
            registrationId: registration._id,
            status: registration.status || 'confirmed'
          }));
          setRegisteredEvents(userRegisteredEvents);
        } catch (regError) {
          console.error('Failed to load registered events:', regError);
          // Fallback to mock data if API endpoint is not ready
          if (allEvents.length > 0) {
            userRegisteredEvents = allEvents
              .slice(0, Math.min(2, allEvents.length))
              .map(event => ({
                ...event,
                registrationId: `mock-${event._id}`,
                status: Math.random() > 0.5 ? 'confirmed' : 'pending'
              }));
            
            setRegisteredEvents(userRegisteredEvents);
          }
        }
        
        // Update statistics
        setStats({
          totalRegistered: userRegisteredEvents.length,
          upcomingCount,
          pastCount
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  const handleFilterChange = (filteredResults) => {
    setFilteredEvents(filteredResults);
    // Update the filtered events based on the filter criteria
    console.log('Events filtered:', filteredResults.length);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCancelRegistration = async (registrationId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) {
      return;
    }
    
    try {
      setCancelingId(registrationId);
      await cancelEventRegistration(registrationId);
      
      // Remove the canceled event from the list
      setRegisteredEvents(prev => 
        prev.filter(event => event.registrationId !== registrationId)
      );
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Failed to cancel registration:', err);
      setError('Failed to cancel registration. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }
  
  // Chart data for attendance trends
  const attendanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Event Attendance',
        data: [65, 59, 80, 81, 56, 90],
        fill: false,
        borderColor: '#4caf50',
        tension: 0.1
      }
    ]
  };
  
  // Chart data for ticket sales categories
  const ticketSalesData = {
    labels: ['VIP', 'Regular', 'Early Bird', 'Student'],
    datasets: [
      {
        data: [30, 40, 20, 10],
        backgroundColor: ['#f9c74f', '#4caf50', '#2196f3', '#f44336'],
        hoverOffset: 4
      }
    ]
  };
  
  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <div className="dashboard-topnav">
        <div className="topnav-logo">
          <Link to="/">Event<span>Sphere</span></Link>
        </div>
        
        <div className="topnav-search">
          <input 
            type="text" 
            placeholder="Search events, users, bookings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn"><FaSearch /></button>
        </div>
        
        <div className="topnav-actions">
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <h3>Notifications</h3>
                {notifications.length > 0 ? (
                  <ul className="notification-list">
                    {notifications.map(notification => (
                      <li 
                        key={notification.id} 
                        className={notification.read ? 'read' : 'unread'}
                      >
                        <p>{notification.text}</p>
                        <span className="notification-time">{notification.time}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-notifications">No notifications</p>
                )}
              </div>
            )}
          </div>
          
          <div className="profile-menu-container">
            <button 
              className="profile-menu-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="topnav-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="dropdown-avatar">{user?.name?.charAt(0) || 'U'}</div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user?.name || 'User'}</p>
                    <p className="dropdown-user-email">{user?.email || 'No email provided'}</p>
                  </div>
                </div>
                <ul className="profile-dropdown-menu">
                  <li><Link to="/profile">My Profile</Link></li>
                  <li><Link to="/settings">Settings</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-main">
        {/* Sidebar Navigation */}
        <div className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li className={activeTab === 'dashboard' ? 'active' : ''}>
              <button onClick={() => setActiveTab('dashboard')}><FaHome /> Dashboard</button>
            </li>
            <li className={activeTab === 'events' ? 'active' : ''}>
              <button onClick={() => setActiveTab('events')}><FaCalendarAlt /> My Events</button>
            </li>
            <li className={activeTab === 'tickets' ? 'active' : ''}>
              <button onClick={() => setActiveTab('tickets')}><FaTicketAlt /> Registrations / Tickets</button>
            </li>
            <li className={activeTab === 'analytics' ? 'active' : ''}>
              <button onClick={() => setActiveTab('analytics')}><FaChartBar /> Analytics</button>
            </li>
            <li className={activeTab === 'messages' ? 'active' : ''}>
              <button onClick={() => setActiveTab('messages')}><FaComments /> Messages / Support</button>
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''}>
              <button onClick={() => setActiveTab('settings')}><FaCog /> Settings</button>
            </li>
            <li className={activeTab === 'create' ? 'active' : ''}>
              <button onClick={() => navigate('/events/create')}><FaPlus /> Create Event</button>
            </li>
          </ul>
        </div>
        
        {/* Main Content Area */}
        <div className="dashboard-content">
          <h1 className="dashboard-welcome">Welcome, {user?.name?.split(' ')[0] || 'User'}!</h1>
          
          {/* Stats Overview */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">🎟️</div>
              <div className="stat-value">{stats.totalRegistered}</div>
              <div className="stat-label">Registered Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{stats.upcomingCount}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{stats.pastCount}</div>
              <div className="stat-label">Past Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">${stats.revenue}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          
          {/* Main Dashboard Widgets */}
          <div className="dashboard-widgets">
            {activeTab === 'tickets' ? (
              /* Tickets Section */
              <div className="widget-row full-width">
                <div className="widget tickets-widget">
                  <UserTickets />
                </div>
              </div>
            ) : activeTab === 'settings' ? (
              /* User Profile Settings Section */
              <div className="widget-row full-width">
                <div className="widget user-profile-widget">
                  <UserProfile />
                  <button 
                    className="settings-link-btn"
                    onClick={() => navigate('/settings')}
                  >
                    Open Full Settings
                  </button>
                </div>
              </div>
            ) : (
              /* Regular Dashboard Content */
              <>
                <div className="widget-row">
                  <div className="widget event-overview">
                    <h2>Event Overview</h2>
                    <div className="event-stats">
                      <div className="event-stat">
                        <span className="event-stat-value">{stats.upcomingCount}</span>
                        <span className="event-stat-label">Upcoming</span>
                      </div>
                      <div className="event-stat">
                        <span className="event-stat-value">2</span>
                        <span className="event-stat-label">Ongoing</span>
                      </div>
                      <div className="event-stat">
                        <span className="event-stat-value">{stats.pastCount}</span>
                        <span className="event-stat-label">Past</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="widget recent-registrations">
                    <h2>Recent Registrations</h2>
                    {recentRegistrations.length > 0 ? (
                      <ul className="registration-list">
                        {recentRegistrations.slice(0, 5).map(reg => (
                          <li key={reg.id}>
                            <div className="registration-info">
                              <span className="registration-name">{reg.name}</span>
                              <span className="registration-event">{reg.event}</span>
                            </div>
                            <span className="registration-time">{reg.time}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No recent registrations</p>
                    )}
                  </div>
                </div>
                
                <div className="widget-row">
                  <div className="widget revenue-analytics">
                    <h2>Revenue/Analytics</h2>
                    <div className="chart-container">
                      <Line data={attendanceData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                    <div className="analytics-summary">
                      <div className="analytics-item">
                        <span className="analytics-label">Tickets Sold</span>
                        <span className="analytics-value">{stats.ticketsSold}</span>
                      </div>
                      <div className="analytics-item">
                        <span className="analytics-label">Revenue</span>
                        <span className="analytics-value">${stats.revenue}</span>
                      </div>
                      <div className="analytics-item">
                        <span className="analytics-label">Avg. Ticket Price</span>
                        <span className="analytics-value">${Math.round(stats.revenue / stats.ticketsSold)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="widget quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                      <button className="action-btn create-event" onClick={() => navigate('/events/create')}><FaPlus /> Create New Event</button>
                      <button className="action-btn manage-tickets" onClick={() => setActiveTab('tickets')}><FaTicket /> Manage Tickets</button>
                      <button className="action-btn send-announcement"><FaBullhorn /> Send Announcement</button>
                    </div>
                  </div>
                </div>
                
                <div className="widget-row full-width">
                  <EventAnalytics events={upcomingEvents} registrations={registeredEvents} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <p>Copyright © 2023 EventSphere. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/help">Help Center</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
