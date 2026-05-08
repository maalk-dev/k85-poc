import type { PrismaExecutor } from '../lib/prisma.ts';

export async function customerExists(client: PrismaExecutor, customerId: string): Promise<boolean> {
  const customer = await client.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });

  return customer !== null;
}
