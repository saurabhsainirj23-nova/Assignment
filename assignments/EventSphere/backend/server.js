import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import registerRoutes from './routes/registerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler, extractUserId } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/events', eventRoutes);
app.use('/api/tickets', extractUserId, ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/registrations', extractUserId, registerRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventsdb';
const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
