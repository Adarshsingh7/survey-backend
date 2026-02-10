import process from 'process';

const config = {
	PORT: process.env.PORT || 5000,
	MONGODB_URI: process.env.MONGODB_URI,
	SECRET: process.env.SECRET,
	JWT_EXPIRE: process.env.JWT_EXPIRE,
	EMAIL: process.env.EMAIL,
	EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};

export { config };
