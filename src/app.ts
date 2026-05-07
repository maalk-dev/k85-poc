import express, { type ErrorRequestHandler } from 'express';
import { errorBody, HttpError } from './errors.ts';
import { ordersRouter } from './routes/orders.ts';

export const app = express();

app.use(express.json());
app.use(ordersRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json(errorBody('BAD_REQUEST', 'Malformed JSON request body'));
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json(errorBody(error.code, error.message));
    return;
  }

  console.error(error);
  res.status(500).json(errorBody('INTERNAL_SERVER_ERROR', 'Unexpected internal server error'));
};

app.use(errorHandler);
