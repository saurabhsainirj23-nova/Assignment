import Registration from '../../models/Registration.js';
import User from '../../models/User.js';

export const analyzeRegistration = async (registrationData) => {
  try {
    const { userId, eventId, quantity, totalAmount, paymentMethod } = registrationData;
    
    const riskScore = {
      total: 0,
      factors: []
    };
    
    const userRegistrations = await Registration.find({ userId });
    const recentRegistrations = userRegistrations.filter(reg => {
      const regDate = new Date(reg.createdAt);
      const now = new Date();
      return (now - regDate) / (1000 * 60 * 60 * 24) < 7;
    });
    
    if (recentRegistrations.length > 10) {
      riskScore.total += 30;
      riskScore.factors.push('High registration frequency');
    }
    
    if (quantity > 5) {
      riskScore.total += 20;
      riskScore.factors.push('Large ticket quantity');
    }
    
    if (totalAmount > 10000) {
      riskScore.total += 15;
      riskScore.factors.push('High transaction value');
    }
    
    if (paymentMethod === 'unknown') {
      riskScore.total += 25;
      riskScore.factors.push('Unusual payment method');
    }
    
    const user = await User.findById(userId);
    if (user) {
      const accountAge = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (accountAge < 1 && quantity > 2) {
        riskScore.total += 25;
        riskScore.factors.push('New account with multiple tickets');
      }
    }
    
    const eventRegCount = await Registration.countDocuments({ eventId });
    if (eventRegCount > 50 && quantity > 3) {
      riskScore.total += 10;
      riskScore.factors.push('Bulk purchase for popular event');
    }
    
    let riskLevel = 'low';
    if (riskScore.total > 50) riskLevel = 'high';
    else if (riskScore.total > 25) riskLevel = 'medium';
    
    return {
      riskLevel,
      riskScore: riskScore.total,
      factors: riskScore.factors,
      recommendedAction: riskLevel === 'high' ? 'review' : 'approve',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Fraud analysis error:', error);
    return { riskLevel: 'low', riskScore: 0, factors: [], recommendedAction: 'approve' };
  }
};

export const getFlaggedRegistrations = async () => {
  try {
    const allRegistrations = await Registration.find()
      .populate('userId')
      .populate('eventId')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const flagged = [];
    
    for (const reg of allRegistrations) {
      const analysis = await analyzeRegistration({
        userId: reg.userId?._id || reg.userId,
        eventId: reg.eventId?._id || reg.eventId,
        quantity: reg.quantity,
        totalAmount: reg.totalAmount,
        paymentMethod: reg.paymentMethod
      });
      
      if (analysis.riskLevel !== 'low') {
        flagged.push({
          registration: reg,
          analysis
        });
      }
    }
    
    return flagged;
  } catch (error) {
    console.error('Flagged registrations error:', error);
    return [];
  }
};
