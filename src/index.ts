import { app } from './app.ts';
import { prisma } from './db.ts';

const port = Number(process.env['PORT'] ?? 3000);

const server = app.listen(port, () => {
  console.log(`Order API listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
