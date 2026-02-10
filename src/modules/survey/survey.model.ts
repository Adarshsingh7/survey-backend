import mongoose, { Schema } from 'mongoose';

const SurveyComponentSchema = new Schema<SurveyComponent>({
	id: { type: String, required: true },
	type: {
		type: String,
		required: true,
		enum: [
			'text-input',
			'email',
			'phone',
			'number',
			'textarea',
			'multiple-choice',
			'checkboxes',
			'dropdown',
			'star-rating',
			'scale',
			'nps',
			'date',
			'matrix',
			'ranking',
			'emoji',
			'yes-no',
			'time',
			'file-upload',
			'heading',
			'paragraph',
			'divider',
			'image',
		],
	},
	name: { type: String, required: true },
	icon: { type: String, required: true },
	min: { type: Number },
	max: { type: Number },
	label: { type: String },
	required: { type: Boolean, default: false },
	placeholder: { type: String },
	description: { type: String },
	options: [{ type: String }],
	imageUrl: { type: String },
	items: [{ type: String }],
	validation: {
		type: String,
		enum: ['email', 'number', 'phone', 'url', 'none'],
		default: 'none',
	},
});

const SurveySchema = new Schema<SurveyType>(
	{
		title: { type: String, required: true },
		description: { type: String },
		authRequired: { type: Boolean, default: false },
		status: { type: String },
		components: { type: [SurveyComponentSchema], default: [] },
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.models.Survey ||
	mongoose.model<SurveyType>('Survey', SurveySchema);
