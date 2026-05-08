import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '../../prisma/.client/client.ts';

let prismaClient: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (prismaClient) {
    return prismaClient;
  }

  const connectionString = process.env['DATABASE_URL'];

  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const adapter = new PrismaPg({ connectionString });
  prismaClient = new PrismaClient({ adapter });

  return prismaClient;
}

export type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export function runInTransaction<T>(operation: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return getPrismaClient().$transaction(operation);
}
