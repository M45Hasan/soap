// src/jobs/scheduler.ts

import { syncQueue } from '../queues/sync.queue';

export async function startScheduler() {

  await syncQueue.add(
    'sync-patients',
    {},
    {
      repeat: {
        every: 60 * 1000,
      },

      removeOnComplete: true,

      removeOnFail: 100,
    }
  );

  await syncQueue.add(
    'sync-referrals',
    {},
    {
      repeat: {
        every: 60 * 1000,
      },

      removeOnComplete: true,

      removeOnFail: 100,
    }
  );
}