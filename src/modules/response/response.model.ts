import mongoose, { Schema } from 'mongoose';

interface ResponseComponent {
	questionId: string;
	answer: string;
}

interface SurveyResponseType {
	surveyId: Schema.Types.ObjectId;
	components: [ResponseComponent];
}

const ResponseComponentSchema = new Schema<ResponseComponent>({
	questionId: String,
	answer: String,
});

const ResponseSchema = new Schema<SurveyResponseType>(
	{
		surveyId: { type: Schema.Types.ObjectId, ref: 'Survey' },
		components: { type: [ResponseComponentSchema], default: [] },
	},
	{
		timestamps: true,
	},
);

export default mongoose.models.Response ||
	mongoose.model<SurveyResponseType>('Response', ResponseSchema);
