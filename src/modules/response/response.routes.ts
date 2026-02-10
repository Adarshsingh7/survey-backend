import { Router } from 'express';
import {
	createResponse,
	deleteResponse,
	getAllResponses,
	getResponse,
	updateResponse,
} from '@/modules/response/response.controller';
// import { restrictTo } from '@/controller/auth.controller';
// import { protect } from '@/controller/auth.controller';

const router = Router();

// router.use(protect, restrictTo(['Response', 'admin']));

router.route('/').get(getAllResponses).post(createResponse);
router
	.route('/:id')
	.get(getResponse)
	.patch(updateResponse)
	.delete(deleteResponse);

export default router;
