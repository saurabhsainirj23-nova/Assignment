import mongoose from 'mongoose';

const ticketCategorySchema = new mongoose.Schema({
  type: String,
  price: Number,
  benefits: [String]
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'general' },
  date: { type: Date, required: true },
  location: String,
  organizer: String,
  capacity: Number,
  ticketsAvailable: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  ticketCategories: [ticketCategorySchema],
  food: {
    available: { type: Boolean, default: false },
    details: String
  },
  accommodation: {
    available: { type: Boolean, default: false },
    details: String
  },
  travel: {
    shuttleBuses: { type: Boolean, default: false },
    pickupPoints: [String],
    parkingInfo: String
  },
  schedule: [{
    time: String,
    activity: String
  }],
  contact: {
    email: String,
    phone: String,
    helpdesk: String
  },
  media: {
    banner: String,
    gallery: [String],
    promoVideo: String
  },
  rules: [String],
  sponsors: [String],
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  hasSeating: { type: Boolean, default: false },
  seatingCapacity: { type: Number, default: 0 },
  availableSeats: { type: [String], default: [] },
  reservedSeats: { type: [String], default: [] }
});

eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);
