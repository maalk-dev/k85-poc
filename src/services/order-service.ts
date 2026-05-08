import { insufficientStock, notFound } from '../lib/application-error.ts';
import { decimal } from '../lib/decimal.ts';
import { runInTransaction } from '../lib/prisma.ts';
import { customerExists } from '../repositories/customer-repository.ts';
import { type CreateOrderItemRecord, createOrderWithItems } from '../repositories/order-repository.ts';
import { decrementProductStock, findProductsByIds } from '../repositories/product-repository.ts';

export type CreateOrderInput = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CreatedOrder = {
  orderId: string;
  customerId: string;
  status: 'CONFIRMED';
  totalAmount: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string;
  }>;
  createdAt: string;
};

type AggregatedOrderItem = {
  productId: string;
  quantity: number;
};

function aggregateItems(items: CreateOrderInput['items']): AggregatedOrderItem[] {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    quantitiesByProductId.set(item.productId, (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(quantitiesByProductId.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  return runInTransaction(async (transaction) => {
    const exists = await customerExists(transaction, input.customerId);

    if (!exists) {
      throw notFound(`Customer ${input.customerId} not found`);
    }

    const requestedItems = aggregateItems(input.items);
    const productIds = requestedItems.map((item) => item.productId);
    const products = await findProductsByIds(transaction, productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const productId of productIds) {
      if (!productsById.has(productId)) {
        throw notFound(`Product ${productId} not found`);
      }
    }

    const orderItems: CreateOrderItemRecord[] = requestedItems.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw notFound(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw insufficientStock(`Insufficient stock for product ${item.productId}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    for (const item of orderItems) {
      const stockUpdated = await decrementProductStock(transaction, item.productId, item.quantity);

      if (!stockUpdated) {
        throw insufficientStock(`Insufficient stock for product ${item.productId}`);
      }
    }

    const totalAmount = orderItems.reduce((total, item) => total.plus(item.unitPrice.mul(item.quantity)), decimal(0));

    const order = await createOrderWithItems(transaction, {
      customerId: input.customerId,
      totalAmount,
      items: orderItems,
    });

    return {
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
    };
  });
}
