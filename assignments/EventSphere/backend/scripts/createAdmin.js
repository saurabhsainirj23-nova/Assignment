import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, default: 'user' }
});

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', userSchema);

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.findOneAndUpdate(
      { email: 'admin@eventsphere.com' },
      { 
        name: 'Admin',
        email: 'admin@eventsphere.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user created/updated:', admin.email, '| Role:', admin.role);
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

createAdmin();
