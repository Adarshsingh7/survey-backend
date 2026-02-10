import { Router } from 'express';
import {
	createSurvey,
	deleteSurvey,
	getAllSurveys,
	getSurvey,
	updateSurvey,
} from '@/modules/survey/survey.controller';
// import { restrictTo } from '@/controller/auth.controller';
// import { protect } from '@/controller/auth.controller';

const router = Router();

// router.use(protect, restrictTo(['Survey', 'admin']));

router.route('/').get(getAllSurveys).post(createSurvey);
router.route('/:id').get(getSurvey).patch(updateSurvey).delete(deleteSurvey);

export default router;
