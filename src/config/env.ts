import dotenv from 'dotenv';

dotenv.config();

export const env = {
	PORT: process.env.PORT || 5000,
	MONGO_URI: process.env.MONGO_URI as string,
	NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!env.MONGO_URI) {
	throw new Error('❌ MONGO_URI is not defined in environment variables');
}
