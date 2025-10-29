import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
