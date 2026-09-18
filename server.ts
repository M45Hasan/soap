// src/server.ts

import 'dotenv/config';

import express from 'express';

import { connectDB }
  from './config/db';

import './queues/sync.worker';

import { startScheduler }
  from './jobs/scheduler';

const app = express();

app.use(
  express.json()
);

async function bootstrap() {

  await connectDB();

  await startScheduler();

  app.listen(
    process.env.PORT || 5000,
    () => {
      console.log(
        `Server running on port ${
          process.env.PORT || 5000
        }`
      );
    }
  );
}

bootstrap();