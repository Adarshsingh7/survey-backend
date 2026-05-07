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
	min: { type: Schema.Types.Mixed },
	max: { type: Schema.Types.Mixed },
	label: { type: String, trim: true },
	required: { type: Boolean, default: false },
	placeholder: { type: String, trim: true },
	description: { type: String, trim: true },
	options: [{ type: String, trim: true }],
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
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		authRequired: { type: Boolean, default: false },
		status: { type: String },
		components: { type: [SurveyComponentSchema], default: [] },
		fontStyle: { type: String, default: 'modern' },
		primaryColor: { type: String, default: 'blue' },
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
