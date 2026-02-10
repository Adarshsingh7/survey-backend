type SurveyComponentType =
	| 'text-input'
	| 'email'
	| 'phone'
	| 'number'
	| 'textarea'
	| 'multiple-choice'
	| 'checkboxes'
	| 'dropdown'
	| 'star-rating'
	| 'scale'
	| 'nps'
	| 'date'
	| 'matrix'
	| 'ranking'
	| 'emoji'
	| 'yes-no'
	| 'time'
	| 'file-upload'
	| 'heading'
	| 'paragraph'
	| 'divider'
	| 'image';

type TextValidation = 'email' | 'number' | 'phone' | 'url' | 'none';

interface SurveyType {
	title: string;
	description: string;
	authRequired: boolean;
	status: 'drafted' | 'live' | 'completed';
	user: Types.ObjectId;
	_id?: string;
	components: SurveyComponent[];
}

interface SurveyComponent {
	id: string;
	type: SurveyComponentType;
	name: string;
	icon: string;
	min?: number;
	max?: number;
	label?: string;
	required?: boolean;
	placeholder?: string;
	description?: string;
	options?: SurveyComponentOption;
	imageUrl?: string;
	items?: string[];
	validation?: TextValidation;
	// options: SurveyComponentOption[];
}

interface UserType {
	_id: string;
	name: string;
	email: string;
	photo: string;
	role: 'teacher' | 'student';
	password: string;
	isVerified?: boolean;
	passwordConfirm?: string;
	phone?: string;
	isGoogleUser?: boolean;
	isActive: boolean;
	passwordResetToken?: string;
	passwordResetExpires?: Date;
	passwordChangedAt?: Date;

	correctPassword(
		candidatePassword: string,
		userPassword: string,
	): Promise<boolean>;
	changedPasswordAfter(JWTTimestamp: number): boolean;
	createPasswordResetToken(): string;
}
