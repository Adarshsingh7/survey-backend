import UserModel from '@/modules/user/user.model';
import {
	getOne,
	createOne,
	deleteOne,
	getAll,
	updateOne,
} from '@/utils/handler.controller';

export const getUser = getOne(UserModel);
export const getAllUsers = getAll(UserModel);
export const createUser = createOne(UserModel);
export const updateUser = updateOne(UserModel);
export const deleteUser = deleteOne(UserModel);
