import { Router } from 'express';

import {
	createUser,
	deleteUser,
	getAllUsers,
	getUser,
	updateUser,
} from '@/modules/user/user.controller';
import { protect, restrictTo, updatePasswordByAdmin } from '@/modules/user/auth.controller';

const router = Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo(['superadmin']));

router.route('/update-password-admin').patch(updatePasswordByAdmin);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
