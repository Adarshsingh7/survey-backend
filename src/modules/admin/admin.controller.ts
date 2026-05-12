import { Response, NextFunction } from 'express';
import { catchAsync } from '@/utils/catchAsync';
import User from '@/modules/user/user.model';
import Survey from '@/modules/survey/survey.model';
import SurveyResponse from '@/modules/response/response.model';
import { AuthRequest } from '@/types/auth-request';

/**
 * getGlobalStats
 * Aggregates platform-wide metrics for the Super Admin dashboard.
 */
export const getGlobalStats = catchAsync(
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		// 1. User Distribution
		const userStats = await User.aggregate([
			{
				$group: {
					_id: '$role',
					count: { $sum: 1 },
				},
			},
		]);

		// 2. Survey Status Breakdown
		const surveyStats = await Survey.aggregate([
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		// 3. Response Metrics (Last 30 days trend)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const responseTrend = await SurveyResponse.aggregate([
			{
				$match: {
					createdAt: { $gte: thirtyDaysAgo },
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// 4. Totals
		const totalUsers = await User.countDocuments();
		const totalSurveys = await Survey.countDocuments();
		const totalResponses = await SurveyResponse.countDocuments();

		// 5. Recent Activity (Last 5 surveys & last 5 responses)
		const recentSurveys = await Survey.find()
			.sort('-createdAt')
			.limit(5)
			.populate('user', 'name email photo');

		const recentResponses = await SurveyResponse.find()
			.sort('-createdAt')
			.limit(5)
			.populate('surveyId', 'title');

		res.status(200).json({
			status: 'success',
			data: {
				totals: {
					users: totalUsers,
					surveys: totalSurveys,
					responses: totalResponses,
				},
				usersByRole: userStats,
				surveysByStatus: surveyStats,
				responseTrend,
				recentActivity: {
					surveys: recentSurveys,
					responses: recentResponses,
				},
			},
		});
	},
);
