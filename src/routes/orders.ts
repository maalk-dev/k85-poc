import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '../../prisma/.client/client.ts';
import { prisma } from '../db.ts';
import { errorBody, HttpError } from '../errors.ts';

const createOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, 'items must contain at least one entry'),
});

type CreateOrderRequest = z.infer<typeof createOrderSchema>;

export const ordersRouter = Router();

ordersRouter.post('/orders', async (req, res, next) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(errorBody('BAD_REQUEST', z.prettifyError(parsed.error)));
      return;
    }

    const order = await createOrder(parsed.data);

    res.status(201).json({
      orderId: order.id,
      customerId: order.customerId,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
      })),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

async function createOrder(input: CreateOrderRequest) {
  const requestedItems = combineItems(input.items);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new HttpError(404, 'NOT_FOUND', `Customer ${input.customerId} not found`);
    }

    const products = await tx.product.findMany({
      where: { id: { in: requestedItems.map((item) => item.productId) } },
      select: { id: true, price: true, stock: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const item of requestedItems) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new HttpError(404, 'NOT_FOUND', `Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new HttpError(409, 'INSUFFICIENT_STOCK', `Insufficient stock for product ${item.productId}`);
      }
    }

    for (const item of requestedItems) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new HttpError(409, 'INSUFFICIENT_STOCK', `Insufficient stock for product ${item.productId}`);
      }
    }

    const totalAmount = requestedItems.reduce((total, item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new HttpError(404, 'NOT_FOUND', `Product ${item.productId} not found`);
      }

      return total.add(product.price.mul(item.quantity));
    }, new Prisma.Decimal(0));

    return tx.order.create({
      data: {
        customerId: input.customerId,
        totalAmount,
        items: {
          create: requestedItems.map((item) => {
            const product = productsById.get(item.productId);

            if (!product) {
              throw new HttpError(404, 'NOT_FOUND', `Product ${item.productId} not found`);
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });
  });
}

function combineItems(items: CreateOrderRequest['items']) {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    quantitiesByProductId.set(item.productId, (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity);
  }

  return [...quantitiesByProductId.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}
