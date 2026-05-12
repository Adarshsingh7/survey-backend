import { configDotenv } from 'dotenv';
configDotenv();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import path from 'path';

const app = express();
const distPath = path.join(process.cwd(), 'client');
const indexHtmlPath = path.join(distPath, 'index.html');
app.use(express.static(distPath));

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

// SPA fallback: let React Router (or similar) handle client-side routes.
// Express 5 / path-to-regexp doesn't accept bare "*" as a path, so use a regex.
app.get(/.*/, (req, res, next) => {
	if (req.method !== 'GET') return next();
	if (req.path.startsWith('/api')) return next();

	const accept = req.headers.accept ?? '';
	if (typeof accept === 'string' && !accept.includes('text/html'))
		return next();

	return res.sendFile(indexHtmlPath);
});

app.use(errorHandler);

export default app;
