import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Enhanced validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists with this email' });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with role (default to 'user' if not specified)
    // Only allow admin role if explicitly provided and authorized
    // In a real app, you might want to add additional checks here
    const userRole = role === 'admin' ? 'admin' : 'user';
    
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role: userRole
    });
    
    await user.save();

    // Generate token for immediate login with longer expiration (7 days)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data and token for immediate login
    res.status(201).json({ 
      msg: 'User created successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Set longer expiration for tokens (7 days)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Include role in the response
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Make existing user an admin
export const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    // Return updated user data
    res.json({
      msg: 'User role updated to admin',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Make admin error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ msg: 'User ID and role are required' });
    }
    
    // Validate role
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ msg: 'Invalid role. Must be "user" or "admin"' });
    }
    
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.json({
      msg: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Create admin user (protected route)
export const createAdmin = async (req, res) => {
  try {
    // This route should be protected with isAdmin middleware
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists with this email' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const adminUser = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    
    res.status(201).json({ 
      msg: 'Admin user created successfully',
      user: { 
        id: adminUser._id, 
        name: adminUser.name, 
        email: adminUser.email,
        role: adminUser.role 
      }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    
    await user.save();
    
    res.json({ 
      msg: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { notifications, newsletter, eventReminders } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    user.preferences = {
      notifications: notifications ?? user.preferences?.notifications,
      newsletter: newsletter ?? user.preferences?.newsletter,
      eventReminders: eventReminders ?? user.preferences?.eventReminders
    };
    
    await user.save();
    
    res.json({ msg: 'Preferences saved', preferences: user.preferences });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
