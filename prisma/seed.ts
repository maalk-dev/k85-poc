import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './.client/client.js';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const customer = await prisma.customer.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'Customer One',
      email: 'customer1@example.com',
    },
  });

  const productA = await prisma.product.upsert({
    where: { id: 'seed_product_a' },
    update: {},
    create: {
      id: 'seed_product_a',
      name: 'Product A',
      price: 10.0,
      stock: 100,
    },
  });

  const productB = await prisma.product.upsert({
    where: { id: 'seed_product_b' },
    update: {},
    create: {
      id: 'seed_product_b',
      name: 'Product B',
      price: 20.0,
      stock: 50,
    },
  });

  console.log('Seeded:', { customer, productA, productB });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
