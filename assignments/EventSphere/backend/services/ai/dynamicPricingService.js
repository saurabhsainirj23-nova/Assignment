import Event from '../../models/Event.js';
import Registration from '../../models/Registration.js';

const PRICING_TIERS = {
  low: 0.7,
  standard: 1.0,
  high: 1.3,
  premium: 1.5
};

export const calculateDynamicPrice = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return null;
    
    const basePrice = event.price || 100;
    const capacity = event.capacity || 100;
    const ticketsAvailable = event.ticketsAvailable || 0;
    
    const registrations = await Registration.find({ eventId });
    const soldTickets = registrations.reduce((sum, reg) => sum + reg.quantity, 0);
    const demandRatio = soldTickets / capacity;
    
    let priceMultiplier = PRICING_TIERS.standard;
    let reason = 'Standard pricing';
    
    if (demandRatio > 0.85) {
      priceMultiplier = PRICING_TIERS.premium;
      reason = 'High demand - near capacity';
    } else if (demandRatio > 0.7) {
      priceMultiplier = PRICING_TIERS.high;
      reason = 'Strong demand';
    } else if (demandRatio < 0.3) {
      priceMultiplier = PRICING_TIERS.low;
      reason = 'Low demand - discounted';
    }
    
    const daysUntilEvent = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent < 7 && demandRatio < 0.5) {
      priceMultiplier *= 0.9;
      reason += ', last-minute discount';
    } else if (daysUntilEvent > 30 && demandRatio > 0.7) {
      priceMultiplier *= 1.1;
      reason += ', early-bird premium';
    }
    
    const suggestedPrice = Math.round(basePrice * priceMultiplier);
    
    return {
      eventId,
      basePrice,
      currentPrice: suggestedPrice,
      priceMultiplier,
      demandRatio: Math.round(demandRatio * 100),
      ticketsSold: soldTickets,
      ticketsAvailable,
      reason,
      daysUntilEvent
    };
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    return null;
  }
};

export const getPricingRecommendations = async () => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } });
    
    const recommendations = await Promise.all(
      events.map(async (event) => {
        const pricing = await calculateDynamicPrice(event._id);
        return pricing;
      })
    );
    
    return recommendations.filter(Boolean).sort((a, b) => b.demandRatio - a.demandRatio);
  } catch (error) {
    console.error('Pricing recommendations error:', error);
    return [];
  }
};
