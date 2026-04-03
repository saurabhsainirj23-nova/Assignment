import Event from '../../models/Event.js';
import Registration from '../../models/Registration.js';

export const forecastDemand = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return null;
    
    const registrations = await Registration.find({ eventId });
    const soldTickets = registrations.reduce((sum, reg) => sum + reg.quantity, 0);
    const capacity = event.capacity || 100;
    const availability = event.ticketsAvailable || 0;
    
    const currentDemand = (soldTickets / capacity) * 100;
    
    const daysUntilEvent = Math.max(1, Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)));
    const dailyRate = soldTickets / Math.max(1, 30 - daysUntilEvent);
    const projectedTotal = Math.min(capacity, Math.round(soldTickets + (dailyRate * daysUntilEvent)));
    const projectedDemand = (projectedTotal / capacity) * 100;
    
    let trend = 'stable';
    if (projectedDemand > currentDemand + 10) trend = 'increasing';
    else if (projectedDemand < currentDemand - 10) trend = 'decreasing';
    
    let pricingRecommendation = 'standard';
    if (projectedDemand > 80) pricingRecommendation = 'increase';
    else if (projectedDemand < 30) pricingRecommendation = 'decrease';
    
    const similarEvents = await Event.find({
      _id: { $ne: eventId },
      category: event.category,
      date: { $lt: event.date }
    }).sort({ date: -1 }).limit(5);
    
    let historicalAvg = 0;
    if (similarEvents.length > 0) {
      const historicalRegs = await Registration.find({
        eventId: { $in: similarEvents.map(e => e._id) }
      });
      historicalAvg = historicalRegs.reduce((sum, r) => sum + r.quantity, 0) / similarEvents.length;
    }
    
    return {
      eventId,
      currentDemand: Math.round(currentDemand),
      projectedDemand: Math.round(projectedDemand),
      soldTickets,
      availableTickets: availability,
      totalCapacity: capacity,
      daysUntilEvent,
      trend,
      pricingRecommendation,
      historicalAverage: Math.round(historicalAvg),
      confidence: similarEvents.length > 3 ? 'high' : similarEvents.length > 0 ? 'medium' : 'low'
    };
  } catch (error) {
    console.error('Demand forecasting error:', error);
    return null;
  }
};

export const getDemandTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await Event.find({
      date: { $gte: startDate }
    });
    
    const trends = await Promise.all(events.map(async (event) => {
      const registrations = await Registration.find({ eventId: event._id });
      const sold = registrations.reduce((sum, reg) => sum + reg.quantity, 0);
      const demand = event.capacity ? (sold / event.capacity) * 100 : 0;
      
      return {
        eventId: event._id,
        title: event.title,
        date: event.date,
        sold,
        capacity: event.capacity,
        demand: Math.round(demand)
      };
    }));
    
    return trends.sort((a, b) => b.demand - a.demand);
  } catch (error) {
    console.error('Demand trends error:', error);
    return [];
  }
};
