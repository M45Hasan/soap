// src/services/status.service.ts

import { Referral } from '../models/referral.model';

interface PatientStatusChange {
  patientId: number;
  referralId?: number;

  oldStatus: string;
  newStatus: string;
}

export async function processPatientStatusChange(
  data: PatientStatusChange
) {

  if (!data.referralId) {
    console.log(
      `No referral for patient ${data.patientId}`
    );

    return;
  }

  const requiredReferralStatus =
    determineReferralStatus(
      data.newStatus
    );

  if (!requiredReferralStatus) {
    return;
  }

  const referral =
    await Referral.findOne({
      hhaReferralId: data.referralId,
    });

  if (!referral) {
    console.log(
      `Referral not found: ${data.referralId}`
    );

    return;
  }

  // Idempotency
  if (
    referral.status ===
    requiredReferralStatus
  ) {
    return;
  }

  await Referral.updateOne(
    {
      _id: referral._id,

      status: {
        $ne: requiredReferralStatus,
      },
    },
    {
      $set: {
        previousStatus: referral.status,

        status: requiredReferralStatus,

        statusChangedAt: new Date(),

        syncStatus: 'PENDING',

        nextSyncAt: new Date(),
      },
    }
  );

  console.log(
    `Referral ${data.referralId}: ` +
    `${referral.status} → ${requiredReferralStatus}`
  );

  // If required, enqueue HHA update here.
}

function determineReferralStatus(
  patientStatus: string
): string | null {

  switch (patientStatus) {

    case 'HOLD':
      return 'NEGATIVE';

    case 'DISCHARGE':
      return 'POSITIVE';

    default:
      return null;
  }
}