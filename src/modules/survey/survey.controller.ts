import SurveyModel from '@/modules/survey/survey.model';
import {
	getOne,
	createOne,
	deleteOne,
	getAll,
	updateOne,
} from '@/utils/handler.controller';

export const getSurvey = getOne(SurveyModel);
export const getAllSurveys = getAll(SurveyModel);
export const createSurvey = createOne(SurveyModel);
export const updateSurvey = updateOne(SurveyModel);
export const deleteSurvey = deleteOne(SurveyModel);
