// src/queues/sync.queue.ts

import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const syncQueue =
  new Queue('hha-sync', {
    connection: redis,
  });