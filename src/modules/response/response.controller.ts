import ResponseModel from '@/modules/response/response.model';
import {
	getOne,
	createOne,
	deleteOne,
	getAll,
	updateOne,
} from '@/utils/handler.controller';

export const getResponse = getOne(ResponseModel);
export const getAllResponses = getAll(ResponseModel);
export const createResponse = createOne(ResponseModel);
export const updateResponse = updateOne(ResponseModel);
export const deleteResponse = deleteOne(ResponseModel);
