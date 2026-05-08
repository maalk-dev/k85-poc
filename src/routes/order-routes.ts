import { Router } from 'express';
import { validateBody } from '../middleware/validate-request.ts';
import {
  type CreateOrderRequest,
  createOrderRequestSchema,
  orderConfirmationSchema,
} from '../schemas/order-schemas.ts';
import { createOrder } from '../services/order-service.ts';

export const orderRoutes = Router();

orderRoutes.post('/orders', validateBody(createOrderRequestSchema), async (request, response) => {
  const order = await createOrder(request.body as CreateOrderRequest);
  const body = orderConfirmationSchema.parse(order);

  response.status(201).json(body);
});
