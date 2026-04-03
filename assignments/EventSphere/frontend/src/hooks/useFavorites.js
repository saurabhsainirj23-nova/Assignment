import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'eventFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const addToFavorites = (event) => {
    setFavorites(prev => {
      if (prev.some(e => e._id === event._id)) return prev;
      const updated = [...prev, event];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromFavorites = (eventId) => {
    setFavorites(prev => {
      const updated = prev.filter(e => e._id !== eventId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (eventId) => {
    return favorites.some(e => e._id === eventId);
  };

  return { favorites, addToFavorites, removeFromFavorites, isFavorite };
};
