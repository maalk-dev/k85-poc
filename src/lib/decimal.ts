import { Prisma } from '../../prisma/.client/client.ts';

export function decimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}
