import { Router } from 'express';

import {
	createUser,
	deleteUser,
	getAllUsers,
	getUser,
	updateUser,
} from '@/modules/user/user.controller';

const router = Router();

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
