import { Router } from 'express';
import {
  register,
  verifyOtp,
  login,
  googleOAuth,
  forgotPassword,
  resetPassword,
  completeOnboarding
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/google', googleOAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/complete-onboarding', authenticate as any, completeOnboarding);

export default router;
