import { z } from 'zod';

export const createOrderRequestSchema = z
  .object({
    customerId: z.string().min(1, { message: 'customerId is required' }),
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1, { message: 'productId is required' }),
            quantity: z.number().int().min(1, { message: 'quantity must be at least 1' }),
          })
          .strict(),
      )
      .min(1, { message: 'items must contain at least one entry' }),
  })
  .strict();

export const orderConfirmationSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  status: z.literal('CONFIRMED'),
  totalAmount: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int(),
      unitPrice: z.string(),
    }),
  ),
  createdAt: z.string().datetime(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type OrderConfirmation = z.infer<typeof orderConfirmationSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
