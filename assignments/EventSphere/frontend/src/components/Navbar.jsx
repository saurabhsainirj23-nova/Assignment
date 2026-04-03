import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  const navLinks = useMemo(() => [
    { to: '/home', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/faq', label: 'FAQs' },
  ], []);

  const authLinks = useMemo(() => [
    { to: '/ticket-registration', label: 'Register' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/create-event', label: 'Create Event' },
    { to: '/make-admin', label: 'Make Admin' },
  ], []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Event<span>Sphere</span></Link>
        <nav>
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
            ))}
            {isAuthenticated && authLinks.map(link => (
              <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
            ))}
            {isAuthenticated ? (
              <li><button onClick={logout} className="nav-button">Logout</button></li>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Navbar);
