import app from './app';
import { connectDB } from './config/db';

const startServer = async () => {
	await connectDB();
	const port = process.env.PORT || 5000;

	app.listen(port, () => {
		console.log(`🚀 Server running on port ${port}`);
	});
};

startServer();
