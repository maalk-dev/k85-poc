import 'dotenv/config';
import { app } from './app.ts';

const port = Number(process.env['PORT'] ?? 3000);

app.listen(port, () => {
  console.log(`Order API listening on port ${port}`);
});
