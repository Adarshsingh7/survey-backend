import { Response, NextFunction } from 'express';
import UserModel from '@/modules/user/user.model';
import {
	getOne,
	createOne,
	deleteOne,
	getAll,
} from '@/utils/handler.controller';
import { catchAsync } from '@/utils/catchAsync';
import AppError from '@/utils/appError';
import { AuthRequest } from '@/types/auth-request';

export const getUser = getOne(UserModel);
export const getAllUsers = getAll(UserModel);
export const createUser = createOne(UserModel);

/**
 * updateUser
 * Specialized update handler that prevents Super Admins from changing their own role.
 */
export const updateUser = catchAsync(
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		// 1. Security Check: Prevent self-role modification
		if (req.body.role && String(req.params.id) === String(req.user?._id)) {
			return next(
				new AppError(
					'Security Policy: You cannot change your own administrative role to prevent accidental lockout.',
					400,
				),
			);
		}

		// 2. Perform Update
		const document = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!document) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: document,
		});
	},
);

export const deleteUser = deleteOne(UserModel);
