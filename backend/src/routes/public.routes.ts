import { Router } from 'express';
import { getPublicRoadmaps, getPublicKnowledge } from '../controllers/public.controller';

const router = Router();

router.get('/roadmaps', getPublicRoadmaps);
router.get('/knowledge', getPublicKnowledge);

export default router;
