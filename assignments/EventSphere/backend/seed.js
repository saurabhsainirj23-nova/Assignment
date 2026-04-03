import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Event from "./models/Event.js";

dotenv.config();

// 📁 Resolve file path properly
const __dirname = new URL('.', import.meta.url).pathname;
const DATA_FILE = path.join(__dirname, "data", "events.json");

// 🔌 Connect DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

// 📥 Load JSON safely
const loadJSON = async () => {
  try {
    const file = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    throw new Error("Invalid or missing JSON file");
  }
};

// 🧠 Transform dataset
const transformEvents = (events) => {
  return events.map((event, index) => {
    return {
      _id: event._id || new mongoose.Types.ObjectId(),

      title: event.title || `Sample Event ${index + 1}`,
      description: event.description || "No description provided",

      date: event.date ? new Date(event.date) : new Date(),

      location: event.location || "Unknown Location",

      category: event.category || "General",

      price: event.price ?? 0,

      capacity: event.capacity || 100,

      attendees: event.attendees || [],

      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};

// 🌱 Seed function
const seedEvents = async () => {
  try {
    await connectDB();

    console.log("🗑️ Clearing old data...");
    await Event.deleteMany();

    console.log("📂 Loading dataset...");
    const rawData = await loadJSON();

    if (!Array.isArray(rawData)) {
      throw new Error("Dataset must be an array");
    }

    console.log(`🔄 Transforming ${rawData.length} events...`);
    const formattedData = transformEvents(rawData);

    console.log("🚀 Inserting data...");
    const inserted = await Event.insertMany(formattedData, {
      ordered: false, // continues even if some fail
    });

    console.log(`✅ Successfully seeded ${inserted.length} events`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// ▶️ Run
seedEvents();