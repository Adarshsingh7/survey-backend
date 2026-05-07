import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// console.error(err.stack);

	let error = { ...err };
	error.message = err.message;

	// MongoDB Duplicate Key Error
	if (err.code === 11000) {
		const field = Object.keys(err.keyValue)[0];
		const value = err.keyValue[field];
		const message = `${
			field.charAt(0).toUpperCase() + field.slice(1)
		} already exists. Please use another ${field}.`;
		return res.status(400).json({ message });
	}

	// Mongoose Validation Error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors)
			.map((el: any) => el.message)
			.join('. ');
		return res.status(400).json({ message });
	}

	res.status(err.statusCode || 500).json({
		message: error.message || 'Internal Server Error',
	});
};
