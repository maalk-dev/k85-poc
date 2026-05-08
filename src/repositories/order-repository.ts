import type { Prisma } from '../../prisma/.client/client.ts';
import type { PrismaExecutor } from '../lib/prisma.ts';

export type CreateOrderItemRecord = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
};

export type CreateOrderRecord = {
  customerId: string;
  totalAmount: Prisma.Decimal;
  items: CreateOrderItemRecord[];
};

export async function createOrderWithItems(client: PrismaExecutor, order: CreateOrderRecord) {
  return client.order.create({
    data: {
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      items: {
        create: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    select: {
      id: true,
      customerId: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          productId: true,
          quantity: true,
          unitPrice: true,
        },
        orderBy: {
          productId: 'asc',
        },
      },
    },
  });
}
