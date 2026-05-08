import type { Product } from '../../prisma/.client/client.ts';
import type { PrismaExecutor } from '../lib/prisma.ts';

export type ProductStockRecord = Pick<Product, 'id' | 'price' | 'stock'>;

export async function findProductsByIds(client: PrismaExecutor, productIds: string[]): Promise<ProductStockRecord[]> {
  return client.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      price: true,
      stock: true,
    },
  });
}

export async function decrementProductStock(
  client: PrismaExecutor,
  productId: string,
  quantity: number,
): Promise<boolean> {
  const result = await client.product.updateMany({
    where: {
      id: productId,
      stock: { gte: quantity },
    },
    data: {
      stock: { decrement: quantity },
    },
  });

  return result.count === 1;
}
