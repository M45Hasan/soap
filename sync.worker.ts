// src/queues/sync.worker.ts

import { Worker } from 'bullmq';

import { redis } from '../config/redis';

import { syncPatients }
  from '../services/patient-sync.service';

import { syncReferrals }
  from '../services/referral-sync.service';

export const syncWorker =
  new Worker(
    'hha-sync',

    async job => {

      console.log(
        `Processing ${job.name}`
      );

      switch (job.name) {

        case 'sync-patients':
          await syncPatients();
          break;

        case 'sync-referrals':
          await syncReferrals();
          break;

        default:
          throw new Error(
            `Unknown job: ${job.name}`
          );
      }
    },

    {
      connection: redis,

      concurrency: 5,
    }
  );

syncWorker.on(
  'completed',
  job => {

    console.log(
      `Job completed: ${job.id}`
    );
  }
);

syncWorker.on(
  'failed',
  (job, error) => {

    console.error(
      `Job failed: ${job?.id}`,
      error
    );
  }
);