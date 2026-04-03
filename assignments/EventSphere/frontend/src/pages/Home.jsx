import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/eventApi';
import LoadingState from '../components/LoadingState';
import EventCard from '../components/EventCard';
import EventRecommendations from '../components/EventRecommendations';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadFeaturedEvents = useCallback(async () => {
    try {
      setLoading(true);
      const events = await fetchEvents();
      const randomEvents = events.sort(() => 0.5 - Math.random()).slice(0, 3);
      setFeaturedEvents(randomEvents);
    } catch (error) {
      console.error('Failed to load featured events:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadFeaturedEvents();
  }, [loadFeaturedEvents]);
  
  const featuredEventsMemo = useMemo(() => featuredEvents, [featuredEvents]);
  
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to <span>EventSphere</span></h1>
          <p className="hero-subtitle">Unite. Celebrate. Experience unforgettable events!</p>
          <Link to="/events" className="hero-btn primary-btn">Explore Events</Link>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">Why Choose EventSphere?</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🎟️</div>
            <h3>Easy Registration</h3>
            <p>Register for events with just a few clicks. No paperwork, no hassle.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access event details and register on the go from any device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Event Reminders</h3>
            <p>Never miss an event with our timely notifications and reminders.</p>
          </div>
        </div>
      </section>
      
      <section className="featured-events-section">
        <h2 className="section-title">Featured Events</h2>
        {loading ? (
          <LoadingState message="Loading featured events..." />
        ) : (
          <div className="featured-events-container">
            {featuredEventsMemo.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/events" className="secondary-btn">View All Events</Link>
        </div>
      </section>
      
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <p className="testimonial-text">EventSphere made organizing our tech conference so much easier. The registration process was seamless!</p>
            <div className="testimonial-author">- Sarah J., Tech Conference Organizer</div>
          </div>
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <p className="testimonial-text">I love how easy it is to find and register for events. The user interface is intuitive and modern.</p>
            <div className="testimonial-author">- Michael T., Regular Attendee</div>
          </div>
        </div>
      </section>
      
      <EventRecommendations />
      
      <section className="cta-section">
        <h2>Ready to Experience Amazing Events?</h2>
        <p>Join EventSphere today and never miss out on exciting opportunities!</p>
        <div className="cta-buttons">
          <Link to="/login" className="primary-btn">Login / Sign Up</Link>
          <Link to="/events" className="secondary-btn">Browse Events</Link>
        </div>
      </section>
    </div>
  );
};

export default React.memo(Home);
