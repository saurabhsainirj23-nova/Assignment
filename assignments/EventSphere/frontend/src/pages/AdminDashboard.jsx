import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvents } from '../api/eventApi';
import axios from '../api/axiosInstance';
import LoadingState from '../components/LoadingState';
import EventManagement from '../components/admin/EventManagement';
import UserManagement from '../components/admin/UserManagement';
import TicketManagement from '../components/admin/TicketManagement';
import './Dashboard.css';
import { FaHome, FaCalendarAlt, FaTicketAlt, FaChartBar, FaUsers, FaCog, FaSearch, FaBell, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [eventStats, setEventStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    fullCapacityEvents: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fetch events and stats
  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        // In a real app, this would be an API call to the stats endpoint
        // For now, we'll simulate it
        try {
          const statsResponse = await axios.get('/api/events/admin/stats');
          setEventStats(statsResponse.data);
        } catch (statsError) {
          console.error('Error fetching event stats:', statsError);
          // Fallback to calculated stats from events
          const now = new Date();
          const upcoming = eventsData.filter(event => new Date(event.date) > now).length;
          const totalAttendees = eventsData.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
          const fullCapacity = eventsData.filter(event => 
            event.capacity && event.attendees && event.attendees.length >= event.capacity
          ).length;
          
          setEventStats({
            totalEvents: eventsData.length,
            upcomingEvents: upcoming,
            totalAttendees,
            fullCapacityEvents: fullCapacity
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
        alert('Event deleted successfully');
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) return <LoadingState message="Loading admin dashboard..." />;

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You do not have permission to access the admin dashboard.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Go to User Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <div className="dashboard-topnav">
        <div className="topnav-logo">EventSphere Admin</div>
        
        <div className="topnav-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="topnav-actions">
          <div className="notification-container">
            <button 
              className="notification-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <h3>Notifications</h3>
                <ul className="notification-list">
                  <li className="unread">
                    <p>New event registration: Tech Conference</p>
                    <span className="notification-time">Just now</span>
                  </li>
                  <li className="unread">
                    <p>Event capacity reached: Workshop</p>
                    <span className="notification-time">30 minutes ago</span>
                  </li>
                  <li className="unread">
                    <p>New admin user created</p>
                    <span className="notification-time">1 hour ago</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="profile-menu-container">
            <button 
              className="profile-menu-btn" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="topnav-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="dropdown-avatar">{user?.name?.charAt(0) || 'A'}</div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user?.name || 'Admin'}</p>
                    <p className="dropdown-user-email">{user?.email || 'admin@example.com'}</p>
                  </div>
                </div>
                <ul className="profile-dropdown-menu">
                  <li><Link to="/admin/profile">Admin Profile</Link></li>
                  <li><Link to="/admin/settings">Settings</Link></li>
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
              <button onClick={() => setActiveTab('events')}><FaCalendarAlt /> Manage Events</button>
            </li>
            <li className={activeTab === 'users' ? 'active' : ''}>
              <button onClick={() => setActiveTab('users')}><FaUsers /> Manage Users</button>
            </li>
            <li className={activeTab === 'tickets' ? 'active' : ''}>
              <button onClick={() => setActiveTab('tickets')}><FaTicketAlt /> Ticket Sales</button>
            </li>
            <li className={activeTab === 'analytics' ? 'active' : ''}>
              <button onClick={() => setActiveTab('analytics')}><FaChartBar /> Analytics</button>
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''}>
              <button onClick={() => setActiveTab('settings')}><FaCog /> Settings</button>
            </li>
            <li>
              <button onClick={handleCreateEvent}><FaPlus /> Create Event</button>
            </li>
          </ul>
        </div>
        
        {/* Main Content Area */}
        <div className="dashboard-content">
          <h1 className="dashboard-welcome">Admin Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{eventStats.totalEvents}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{eventStats.upcomingEvents}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{eventStats.totalAttendees}</div>
              <div className="stat-label">Total Attendees</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔝</div>
              <div className="stat-value">{eventStats.fullCapacityEvents}</div>
              <div className="stat-label">Full Capacity Events</div>
            </div>
          </div>
          
          {/* Event Management Section */}
          {activeTab === 'events' && <EventManagement 
            events={filteredEvents} 
            searchQuery={searchQuery} 
            onCreateEvent={handleCreateEvent}
            onViewEvent={handleViewEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />}
          
          {/* User Management Section */}
          {activeTab === 'users' && <UserManagement 
            onCreateUser={() => navigate('/admin/users/create')} 
          />}
          
          {/* Ticket Management Section */}
          {activeTab === 'tickets' && <TicketManagement />}
          
          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="admin-analytics-container">
              <h2>Event Analytics</h2>
              
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Registration Trends</h3>
                  <div className="chart-placeholder">
                    <p>Registration trend chart will be displayed here</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Popular Events</h3>
                  <div className="chart-placeholder">
                    <p>Popular events chart will be displayed here</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Revenue Analysis</h3>
                  <div className="chart-placeholder">
                    <p>Revenue analysis chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="admin-settings-container">
              <h2>Admin Settings</h2>
              
              <div className="settings-section">
                <h3>General Settings</h3>
                <p className="placeholder-text">Admin settings will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <p>Copyright © 2023 EventSphere Admin. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/admin/help">Admin Help</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;