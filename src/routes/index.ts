import { Request, Response, Router } from 'express';
import SurveyRoute from '@/modules/survey/survey.routes';
import ResponseRoute from '@/modules/response/response.routes';
import UserRouter from '@/modules/user/user.routes';
import AuthRouter from '@/modules/user/auth.routes';
import passport from 'passport';
const router = Router();

router.get('/health', (_, res) => {
	res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	}),
);

router.use('/survey', SurveyRoute);
router.use('/response', ResponseRoute);
// router.use('/user', UserRouter);
router.use('/user', AuthRouter);

export default router;
