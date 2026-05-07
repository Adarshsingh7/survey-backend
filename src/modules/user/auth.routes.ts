import { Request, Response, Router } from 'express';

import {
	signup,
	signin,
	googleSignin,
	forgotPassword,
	getMe,
	protect,
	updatePassword,
} from '@/modules/user/auth.controller';

const router = Router();

router.get('/me', protect, getMe);
router.post('/signup', signup);
router.post('/login', signin);
router.post('/google', googleSignin);
router.post('/reset_password', forgotPassword);

router.patch('/update_password', protect, updatePassword);

export default router;
