import crypto from 'crypto';
import mongoose, { Model, Query, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

// Create the UserType Schema
const userSchema = new Schema<UserType>(
	{
		name: {
			type: String,
			required: [true, 'A user must have a name'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Enter a valid email address'],
		},
		phone: {
			type: String,
			minlength: [10, 'Minimum 10-digit phone number is required'],
			maxlength: [13, 'Maximum 13-digit phone number is allowed'],
			unique: true,
		},
		photo: {
			type: String,
			default:
				'https://upload.wikimedia.org/wikipedia/commons/e/e0/Userimage.png',
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isGoogleUser: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ['student', 'teacher'],
			required: [true, 'Role is required'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Minimum 8-character password is required'],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Password confirmation is required'],
			validate: {
				validator: function (this: UserType, el: string): boolean {
					return this.password === el;
				},
				message: 'Passwords do not match',
			},
		},
		isActive: {
			type: Boolean,
			default: true,
			select: false,
		},
		passwordResetToken: String,
		passwordResetExpires: Date,
		passwordChangedAt: Date,
	},
	{
		timestamps: true,
	},
);

userSchema.pre(/^find/, function (this: Query<any, UserType>) {
	this.find({ isActive: { $ne: false } });
});

// Middleware: Hash password before saving
userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;

	// Hash the password with a salt round of 10
	this.password = await bcrypt.hash(this.password, 10);

	// Remove passwordConfirm field
	this.passwordConfirm = undefined;
});

// Middleware: Set passwordChangedAt field
userSchema.pre('save', function () {
	if (this.isModified('password') && !this.isNew) {
		this.passwordChangedAt = new Date(Date.now() - 1000);
	}
});

// Instance Method: Compare passwords
userSchema.methods.correctPassword = async function (
	candidatePassword: string,
	userPassword: string,
): Promise<boolean> {
	return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance Method: Check if password was changed after the JWT token was issued
userSchema.methods.changedPasswordAfter = function (
	JWTTimestamp: number,
): boolean {
	if (this.passwordChangedAt) {
		const changedTimestamp = Math.floor(
			this.passwordChangedAt.getTime() / 1000,
		);
		return JWTTimestamp < changedTimestamp;
	}

	// Password not changed
	return false;
};

// Instance Method: Generate password reset token
userSchema.methods.createPasswordResetToken = function (): string {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Token valid for 10 minutes

	return resetToken;
};

// Create the UserType model
const UserModel: Model<UserType> = mongoose.model<UserType>('User', userSchema);

export default UserModel;
