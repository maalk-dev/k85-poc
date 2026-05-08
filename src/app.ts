import express from 'express';
import { errorHandler } from './middleware/error-handler.ts';
import { orderRoutes } from './routes/order-routes.ts';

export const app = express();

app.use(express.json());
app.use(orderRoutes);
app.use(errorHandler);
