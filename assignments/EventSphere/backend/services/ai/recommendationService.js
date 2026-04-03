import Event from '../../models/Event.js';
import Registration from '../../models/Registration.js';
import User from '../../models/User.js';

const CATEGORIES = ['technology', 'business', 'entertainment', 'sports', 'music', 'education', 'general'];

export const getRecommendations = async (userId, limit = 5) => {
  try {
    const userRegistrations = await Registration.find({ userId }).populate('eventId');
    const registeredEventIds = userRegistrations.map(reg => reg.eventId?._id);
    
    const registeredEvents = userRegistrations.map(reg => reg.eventId).filter(Boolean);
    
    if (registeredEvents.length === 0) {
      const randomEvents = await Event.find({ date: { $gte: new Date() } })
        .sort({ createdAt: -1 })
        .limit(limit);
      return { events: randomEvents, reason: 'popular' };
    }
    
    const categoryScores = {};
    registeredEvents.forEach(event => {
      const category = event.category || 'general';
      categoryScores[category] = (categoryScores[category] || 0) + 1;
    });
    
    const topCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
    
    const recommendedEvents = await Event.find({
      _id: { $nin: registeredEventIds },
      date: { $gte: new Date() },
      $or: [
        { category: topCategory },
        { organizer: { $in: registeredEvents.map(e => e.organizer) } }
      ]
    }).sort({ date: 1 }).limit(limit);
    
    if (recommendedEvents.length < limit) {
      const additionalEvents = await Event.find({
        _id: { $nin: [...registeredEventIds, ...recommendedEvents.map(e => e._id)] },
        date: { $gte: new Date() }
      }).sort({ ticketsAvailable: -1 }).limit(limit - recommendedEvents.length);
      
      recommendedEvents.push(...additionalEvents);
    }
    
    return {
      events: recommendedEvents,
      reason: 'based on your interests',
      basedOn: topCategory
    };
  } catch (error) {
    console.error('Recommendation error:', error);
    const fallbackEvents = await Event.find({ date: { $gte: new Date() } })
      .sort({ ticketsAvailable: -1 })
      .limit(limit);
    return { events: fallbackEvents, reason: 'popular' };
  }
};

export const getSimilarEvents = async (eventId, limit = 5) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return [];
    
    const similar = await Event.find({
      _id: { $ne: eventId },
      date: { $gte: new Date() },
      $or: [
        { category: event.category },
        { location: event.location }
      ]
    }).limit(limit);
    
    return similar;
  } catch (error) {
    console.error('Similar events error:', error);
    return [];
  }
};

const calculateSimilarity = (event1, event2) => {
  let score = 0;
  
  if (event1.category === event2.category) score += 30;
  if (event1.location === event2.location) score += 20;
  if (event1.organizer === event2.organizer) score += 15;
  
  const dateDiff = Math.abs(new Date(event1.date) - new Date(event2.date));
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
  if (daysDiff < 30) score += 10;
  if (daysDiff < 7) score += 5;
  
  const priceDiff = Math.abs(event1.price - event2.price);
  if (priceDiff < 100) score += 10;
  
  return Math.min(100, score);
};

export const getMLRecommendations = async (userId, limit = 5) => {
  try {
    const user = await User.findById(userId);
    const userRegistrations = await Registration.find({ userId }).populate('eventId');
    
    const registeredEvents = userRegistrations
      .map(reg => reg.eventId)
      .filter(Boolean);
    
    if (registeredEvents.length === 0) {
      const popularEvents = await Event.find({ date: { $gte: new Date() } })
        .sort({ ticketsAvailable: -1 })
        .limit(limit);
      return {
        events: popularEvents,
        algorithm: 'popularity',
        confidence: 0.5
      };
    }
    
    const allEvents = await Event.find({ 
      date: { $gte: new Date() },
      _id: { $nin: registeredEvents.map(e => e._id) }
    });
    
    const eventScores = allEvents.map(event => {
      let totalSimilarity = 0;
      let maxSimilarity = 0;
      
      registeredEvents.forEach(registeredEvent => {
        const similarity = calculateSimilarity(registeredEvent, event);
        totalSimilarity += similarity;
        maxSimilarity = Math.max(maxSimilarity, similarity);
      });
      
      const avgSimilarity = totalSimilarity / registeredEvents.length;
      const popularityScore = (event.ticketsAvailable / event.capacity) * 20;
      
      const finalScore = (avgSimilarity * 0.7) + (popularityScore * 0.3);
      
      return { event, score: finalScore };
    });
    
    eventScores.sort((a, b) => b.score - a.score);
    
    const topEvents = eventScores.slice(0, limit).map(e => e.event);
    
    return {
      events: topEvents,
      algorithm: 'collaborative',
      confidence: userRegistrations.length > 5 ? 0.9 : 0.6,
      basedOn: {
        categories: [...new Set(registeredEvents.map(e => e.category))],
        locations: [...new Set(registeredEvents.map(e => e.location))].slice(0, 3)
      }
    };
  } catch (error) {
    console.error('ML Recommendations error:', error);
    return { events: [], algorithm: 'fallback', confidence: 0 };
  }
};

export const getTrendingEvents = async (days = 7, limit = 10) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await Event.find({ date: { $gte: new Date() } });
    
    const eventStats = await Promise.all(
      events.map(async (event) => {
        const recentRegs = await Registration.countDocuments({
          eventId: event._id,
          createdAt: { $gte: startDate }
        });
        
        const totalRegs = await Registration.countDocuments({ eventId: event._id });
        
        return {
          event,
          recentRegistrations: recentRegs,
          totalRegistrations: totalRegs,
          growthRate: totalRegs > 0 ? (recentRegs / totalRegs) * 100 : 0,
          popularity: totalRegs / event.capacity
        };
      })
    );
    
    eventStats.sort((a, b) => b.recentRegistrations - a.recentRegistrations);
    
    return eventStats.slice(0, limit).map(stat => ({
      ...stat.event.toObject(),
      stats: {
        recentRegistrations: stat.recentRegistrations,
        totalRegistrations: stat.totalRegistrations,
        growthRate: Math.round(stat.growthRate),
        popularityScore: Math.round(stat.popularity * 100)
      }
    }));
  } catch (error) {
    console.error('Trending events error:', error);
    return [];
  }
};

export const getPersonalizedNotifications = async (userId) => {
  try {
    const recommendations = await getMLRecommendations(userId, 3);
    const trending = await getTrendingEvents(7, 3);
    
    const notifications = [];
    
    recommendations.events.forEach(event => {
      notifications.push({
        type: 'recommendation',
        title: 'Recommended for you',
        message: `You might be interested in "${event.title}"`,
        eventId: event._id,
        priority: 'medium'
      });
    });
    
    trending.forEach(event => {
      if (event.stats.growthRate > 30) {
        notifications.push({
          type: 'trending',
          title: 'Trending Event',
          message: `"${event.title}" is gaining popularity!`,
          eventId: event._id,
          priority: 'high'
        });
      }
    });
    
    return notifications.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return [];
  }
};
