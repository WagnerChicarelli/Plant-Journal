import 'dotenv/config';
import express from 'express';
import plantsRouter from './routes/plants.routes.js';
import authRouter from './routes/auth.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import validateEmailRouter from './routes/validate-email.routes.js';
import { runMigrations } from './db/migrations.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(authRouter);
app.use(notificationsRouter);
app.use(validateEmailRouter);
app.use(plantsRouter);

async function start() {
  await runMigrations();
  app.listen(port, () => {
    console.log(`API disponível em http://localhost:${port}`);
  });
}

start();
