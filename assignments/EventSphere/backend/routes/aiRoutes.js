import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { getRecommendations, getSimilarEvents, getMLRecommendations, getTrendingEvents, getPersonalizedNotifications } from '../services/ai/recommendationService.js';
import { forecastDemand, getDemandTrends } from '../services/ai/demandForecastService.js';
import { calculateDynamicPrice, getPricingRecommendations } from '../services/ai/dynamicPricingService.js';
import { analyzeRegistration, getFlaggedRegistrations } from '../services/ai/fraudDetectionService.js';
import { processChatbotQuery, getQuickReplies } from '../services/ai/chatbotService.js';

const router = express.Router();

router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const recommendations = await getRecommendations(req.user._id, parseInt(limit));
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

router.get('/similar/:eventId', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const similar = await getSimilarEvents(req.params.eventId, parseInt(limit));
    res.json(similar);
  } catch (error) {
    console.error('Similar events error:', error);
    res.status(500).json({ error: 'Failed to get similar events' });
  }
});

router.get('/forecast/:eventId', async (req, res) => {
  try {
    const forecast = await forecastDemand(req.params.eventId);
    res.json(forecast);
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to forecast demand' });
  }
});

router.get('/demand-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await getDemandTrends(parseInt(days));
    res.json(trends);
  } catch (error) {
    console.error('Demand trends error:', error);
    res.status(500).json({ error: 'Failed to get demand trends' });
  }
});

router.get('/pricing/:eventId', async (req, res) => {
  try {
    const pricing = await calculateDynamicPrice(req.params.eventId);
    res.json(pricing);
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
});

router.get('/pricing-recommendations', async (req, res) => {
  try {
    const recommendations = await getPricingRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Pricing recommendations error:', error);
    res.status(500).json({ error: 'Failed to get pricing recommendations' });
  }
});

router.post('/fraud-analyze', async (req, res) => {
  try {
    const analysis = await analyzeRegistration(req.body);
    res.json(analysis);
  } catch (error) {
    console.error('Fraud analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze registration' });
  }
});

router.get('/flagged-registrations', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const flagged = await getFlaggedRegistrations();
    res.json(flagged);
  } catch (error) {
    console.error('Flagged registrations error:', error);
    res.status(500).json({ error: 'Failed to get flagged registrations' });
  }
});

router.post('/chatbot', async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user?._id;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const response = await processChatbotQuery(query, userId);
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

router.get('/chatbot/quick-replies', (req, res) => {
  const { context = 'general' } = req.query;
  res.json(getQuickReplies(context));
});

router.get('/recommendations/ml', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const recommendations = await getMLRecommendations(req.user._id, parseInt(limit));
    res.json(recommendations);
  } catch (error) {
    console.error('ML Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get ML recommendations' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    const trending = await getTrendingEvents(parseInt(days), parseInt(limit));
    res.json(trending);
  } catch (error) {
    console.error('Trending events error:', error);
    res.status(500).json({ error: 'Failed to get trending events' });
  }
});

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await getPersonalizedNotifications(req.user._id);
    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

export default router;
