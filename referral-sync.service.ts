// src/services/referral-sync.service.ts

import { Referral } from '../models/referral.model';
import { hhaClient } from '../integrations/hha/hha.client';

const BATCH_SIZE = 100;

export async function syncReferrals() {

  const referrals = await Referral.find({
    nextSyncAt: {
      $lte: new Date(),
    },

    syncStatus: {
      $ne: 'RUNNING',
    },
  })
    .sort({
      nextSyncAt: 1,
    })
    .limit(BATCH_SIZE)
    .lean();

  for (const referral of referrals) {

    try {

      await Referral.updateOne(
        { _id: referral._id },
        {
          $set: {
            syncStatus: 'RUNNING',
          },
        }
      );

      const response =
        await hhaClient.getReferralStatus(
          referral.hhaReferralId
        );

      const newStatus =
        normalizeReferralResponse(response);

      const statusChanged =
        referral.status !== newStatus;

      const update: any = {
        $set: {
          status: newStatus,

          lastSyncedAt: new Date(),

          syncStatus: 'SYNCED',

          syncError: null,

          nextSyncAt:
            getNextSyncTime(newStatus),
        },
      };

      if (statusChanged) {

        update.$set.previousStatus =
          referral.status;

        update.$set.statusChangedAt =
          new Date();
      }

      await Referral.updateOne(
        {
          _id: referral._id,
        },
        update
      );

    } catch (error) {

      await Referral.updateOne(
        {
          _id: referral._id,
        },
        {
          $set: {
            syncStatus: 'FAILED',

            syncError:
              error instanceof Error
                ? error.message
                : String(error),

            nextSyncAt:
              new Date(
                Date.now() +
                10 * 60 * 1000
              ),
          },
        }
      );
    }
  }
}

function normalizeReferralResponse(
  response: any
): string {

  const raw = response?.[0];

  return raw?.ReferralStatus ?? 'UNKNOWN';
}

function getNextSyncTime(status: string) {

  switch (status) {

    case 'PENDING':
      return new Date(
        Date.now() + 10 * 60 * 1000
      );

    case 'NEGATIVE':
      return new Date(
        Date.now() + 15 * 60 * 1000
      );

    case 'POSITIVE':
      return new Date(
        Date.now() + 30 * 60 * 1000
      );

    default:
      return new Date(
        Date.now() + 30 * 60 * 1000
      );
  }
}