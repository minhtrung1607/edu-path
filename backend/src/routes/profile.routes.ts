import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All profile routes are protected
router.use(authenticate as any);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
