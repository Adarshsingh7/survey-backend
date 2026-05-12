import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '@/modules/user/user.model';
import AppError from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';
// import { mailService } from '@/service/mail.service';
import { AuthRequest } from '@/types/auth-request';

const signToken = (id: string) => {
	const secret = (process.env.SECRET as string) || '';
	const expiresIn: string = process.env.JWT_EXPIRE || '30d';
	if (!expiresIn) return new AppError('missing env expiresIn or secret', 500);

	// signing the token
	const token = jwt.sign({ id }, secret, { expiresIn: '30d' });

	return token;
};

type GoogleTokenInfoResponse = {
	aud?: string;
	email?: string;
	email_verified?: string;
	name?: string;
	picture?: string;
	sub?: string;
};

const fetchGoogleTokenInfo = async (
	idToken: string,
): Promise<GoogleTokenInfoResponse> => {
	const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
		idToken,
	)}`;

	const res = await fetch(url, { method: 'GET' });
	if (!res.ok) {
		throw new AppError('invalid google credential', 401);
	}

	return (await res.json()) as GoogleTokenInfoResponse;
};

export const signup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const newUser = await User.create(req.body);
		const token = signToken(String(newUser._id));
		res.status(201).json({
			user: newUser,
			token,
		});
	},
);

export const googleSignin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const credential = String(req.body?.credential || '');
		if (!credential) return next(new AppError('credential is required', 400));

		const expectedAudience = String(process.env.GOOGLE_CLIENT_ID || '');
		if (!expectedAudience)
			return next(new AppError('missing env GOOGLE_CLIENT_ID', 500));

		const tokenInfo = await fetchGoogleTokenInfo(credential);
		if (!tokenInfo?.email) return next(new AppError('google email missing', 401));
		if (tokenInfo.aud !== expectedAudience)
			return next(new AppError('invalid google audience', 401));
		if (tokenInfo.email_verified !== 'true')
			return next(new AppError('google email not verified', 401));

		const role =
			req.body?.role === 'teacher' || req.body?.role === 'student'
				? req.body.role
				: 'student';

		let user = await User.findOne({ email: tokenInfo.email });

		if (!user) {
			const password = crypto.randomBytes(32).toString('hex');
			user = await User.create({
				name: tokenInfo.name || tokenInfo.email,
				email: tokenInfo.email,
				photo: tokenInfo.picture,
				role,
				isVerified: true,
				isGoogleUser: true,
				password,
				passwordConfirm: password,
			});
		} else if (!user.isGoogleUser) {
			user.isGoogleUser = true;
			if (tokenInfo.picture) user.photo = tokenInfo.picture;
			if (tokenInfo.name) user.name = tokenInfo.name;
			await user.save({ validateBeforeSave: false });
		}

		const token = signToken(String(user._id));
		res.status(200).json({
			user,
			token,
		});
	},
);

export const signin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select('+password');
		if (!user || !(await user.correctPassword(password, user.password)))
			return next(new AppError('incorrect email or password', 401));
		const token = signToken(String(user._id));
		const { password: _, ...userWithoutPassword } = user.toObject();
		res.status(200).json({
			user: userWithoutPassword,
			token,
		});
	},
);

export const protect = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		let token: string | undefined;
		// 1) check token and check if it is there
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}
		// console.log(token);
		if (!token) return next(new AppError('please log in to get access', 401));

		// 2) validate the token
		const secret = String(process.env.SECRET) || '';
		interface DecodedToken {
			id: string;
			iat: number;
		}
		const decoded = jwt.verify(token, secret) as DecodedToken;

		// 3) check user if he still exist
		const freshUser = await User.findById(decoded.id);
		if (!freshUser)
			return next(new AppError('user does not exist log in again!', 401));

		// 4)check user changed password after jwt was issued
		if (freshUser.changedPasswordAfter(decoded.iat))
			return next(
				new AppError('the password has been changed please login again', 401),
			);

		req.user = freshUser;
		next();
	},
);

export const restrictTo = (roles: string[]) => {
	return (req: any, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user?.role))
			return next(
				new AppError('you do not have permission to perform this action', 403),
			);
		next();
	};
};

export const forgotPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// get the user based on posted email
		const freshUser = await User.findOne({ email: req.body.email });

		if (!freshUser) return next(new AppError('user not exist', 400));

		// generate random token for reseting password
		const resetToken = freshUser.createPasswordResetToken();
		await freshUser.save({ validateBeforeSave: false });

		// send it to users email
		const resetURL = `${req.protocol}://${req.get(
			'host',
		)}/api/v1/users/resetPassword/${resetToken}`;

		try {
			// const mailResponse = await mailService.sendMail({
			// 	from: process.env.EMAIL,
			// 	to: req.body.email,
			// 	subject: 'Password Change Link',
			// 	text: resetURL,
			// });

			// if (mailResponse.rejected.length)
			// 	return next(
			// 		new AppError('failed to sent email do check your email', 400),
			// 	);
			res.status(200).json({
				status: 'success',
				message: 'message sent successfully',
			});
		} catch (err) {
			freshUser.passwordResetToken = undefined;
			freshUser.passwordResetExpires = undefined;
			await freshUser.save({ validateBeforeSave: false });
			console.log(err);

			return next(
				new AppError('there was an error while sending an email', 500),
			);
		}
	},
);

export const updatePassword = catchAsync(
	async (req: any, res: Response, next: NextFunction) => {
		// 1) find the user
		if (!req.user) {
			return next(new AppError('User not found', 404));
		}
		const user = await User.findById(req.user._id).select('+password');
		if (!user) {
			return next(new AppError('User not found', 404));
		}

		// 2) take data
		const { currentPassword, newPassword, passwordConfirm } = req.body;
		if (newPassword !== passwordConfirm) {
			return next(
				new AppError('New password and password confirm are not the same', 403),
			);
		}

		// check password confirm is same to the database password
		// SKIP currentPassword check if user is superadmin (as requested: "he can also change his own password without any verification or entering prevous password")
		if (req.user.role !== 'superadmin') {
			if (!(await user.correctPassword(currentPassword, user.password))) {
				return next(new AppError('Invalid current password', 400));
			}
		}

		user.password = newPassword;
		user.passwordConfirm = passwordConfirm;
		await user.save();
		const token = signToken(String(user._id));

		res.status(200).json({
			status: 'success',
			message: 'Password changed successfully',
			token,
		});
	},
);

export const updatePasswordByAdmin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId, newPassword, passwordConfirm } = req.body;

		if (newPassword !== passwordConfirm) {
			return next(
				new AppError('New password and password confirm are not the same', 400),
			);
		}

		const user = await User.findById(userId);
		if (!user) {
			return next(new AppError('User not found', 404));
		}

		user.password = newPassword;
		user.passwordConfirm = passwordConfirm;
		await user.save();

		res.status(200).json({
			status: 'success',
			message: 'Password updated successfully by admin',
		});
	},
);

export const getMe = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) return next(new AppError('User not found', 401));
	res.status(200).json({
		status: 'success',
		user: req.user,
	});
};
