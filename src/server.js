import 'dotenv/config';
import express from 'express';
import plantsRouter from './routes/plants.routes.js';
import { runMigrations } from './db/migrations.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(plantsRouter);

async function start() {
  await runMigrations();
  app.listen(port, () => {
    console.log(`API disponível em http://localhost:${port}`);
  });
}

start();
