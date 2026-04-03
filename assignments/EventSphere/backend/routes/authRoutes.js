import express from 'express';
import { signup, login, createAdmin, makeAdmin, getAllUsers, updateUserRole, updateProfile, changePassword, updatePreferences, getProfile } from '../controllers/authController.js';
import { isAdmin, authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// User routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/preferences', authenticate, updatePreferences);

// Admin routes - protected with isAdmin middleware
router.post('/admin/create', authenticate, isAdmin, createAdmin);
router.post('/make-admin', authenticate, isAdmin, makeAdmin);
router.get('/users', authenticate, isAdmin, getAllUsers);
router.put('/users/role', authenticate, isAdmin, updateUserRole);

export default router;