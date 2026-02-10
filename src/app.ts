import { configDotenv } from 'dotenv';
configDotenv({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.use(errorHandler);

export default app;
