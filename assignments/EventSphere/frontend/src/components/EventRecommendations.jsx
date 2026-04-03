import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../api/aiApi';
import EventCard from './EventCard';
import './EventRecommendations.css';

const EventRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getRecommendations(4);
        setRecommendations(data.events || []);
        setReason(data.reason || '');
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  if (loading) return <div className="loading-recommendations">Loading recommendations...</div>;
  if (recommendations.length === 0) return null;

  return (
    <div className="event-recommendations">
      <div className="recommendations-header">
        <h3>Recommended for You</h3>
        {reason && <span className="recommendation-reason">Based on: {reason}</span>}
      </div>
      <div className="recommendations-grid">
        {recommendations.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventRecommendations;
