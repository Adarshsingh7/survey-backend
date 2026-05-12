import { Router } from 'express';
import { getGlobalStats } from './admin.controller';
import { protect, restrictTo } from '@/modules/user/auth.controller';

const router = Router();

// All routes here are restricted to superadmin
router.use(protect);
router.use(restrictTo(['superadmin']));

router.get('/stats', getGlobalStats);

export default router;
