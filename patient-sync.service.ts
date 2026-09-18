// src/services/patient-sync.service.ts

import { Patient } from '../models/patient.model';
import { hhaClient } from '../integrations/hha/hha.client';
import { processPatientStatusChange } from './status.service';

const BATCH_SIZE = 100;

export async function syncPatients() {

  const now = new Date();

  const patients = await Patient.find({
    nextSyncAt: {
      $lte: now,
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

  if (!patients.length) {
    return;
  }

  for (const patient of patients) {

    try {

      await Patient.updateOne(
        { _id: patient._id },
        {
          $set: {
            syncStatus: 'RUNNING',
          },
        }
      );

      const response =
        await hhaClient.getPatientReferralInfo(
          patient.hhaPatientId
        );

      const data = normalizePatientResponse(response);

      const oldStatus = patient.status;

      const newStatus = data.PatientStatus;

      const statusChanged =
        oldStatus !== newStatus;

      await Patient.updateOne(
        {
          _id: patient._id,
        },
        {
          $set: {
            status: newStatus,
            referralId: data.ReferralMasterId,

            lastSyncedAt: new Date(),

            syncStatus: 'SYNCED',

            syncError: null,

            nextSyncAt: getNextSyncTime(newStatus),
          },

          ...(statusChanged
            ? {
                $setOnInsert: {
                  statusChangedAt: new Date(),
                },

                $set: {
                  status: newStatus,
                  previousStatus: oldStatus,

                  referralId: data.ReferralMasterId,

                  lastSyncedAt: new Date(),

                  statusChangedAt: new Date(),

                  syncStatus: 'SYNCED',

                  syncError: null,

                  nextSyncAt:
                    getNextSyncTime(newStatus),
                },
              }
            : {}),
        }
      );

      if (statusChanged) {

        await processPatientStatusChange({
          patientId: patient.hhaPatientId,
          referralId: data.ReferralMasterId,
          oldStatus,
          newStatus,
        });

      }

    } catch (error) {

      console.error(
        `Patient sync failed: ${patient.hhaPatientId}`,
        error
      );

      await Patient.updateOne(
        {
          _id: patient._id,
        },
        {
          $set: {
            syncStatus: 'FAILED',
            syncError:
              error instanceof Error
                ? error.message
                : String(error),

            nextSyncAt:
              new Date(Date.now() + 10 * 60 * 1000),
          },
        }
      );
    }
  }
}

function normalizePatientResponse(
  response: any
) {

  // Adapt this according to the real HHA response.

  const raw = response?.[0];

  return {
    PatientStatus: raw?.PatientStatus ?? 'UNKNOWN',

    ReferralMasterId:
      raw?.ReferralMasterId
        ? Number(raw.ReferralMasterId)
        : undefined,
  };
}

function getNextSyncTime(status: string) {

  const now = Date.now();

  switch (status) {

    case 'ACTIVE':
      return new Date(now + 5 * 60 * 1000);

    case 'PENDING':
      return new Date(now + 10 * 60 * 1000);

    case 'HOLD':
      return new Date(now + 15 * 60 * 1000);

    case 'DISCHARGE':
      return new Date(
        now + 6 * 60 * 60 * 1000
      );

    default:
      return new Date(
        now + 30 * 60 * 1000
      );
  }
}



const update: any = {
  $set: {
    status: newStatus,
    referralId: data.ReferralMasterId,

    lastSyncedAt: new Date(),

    syncStatus: 'SYNCED',

    syncError: null,

    nextSyncAt: getNextSyncTime(newStatus),
  },
};

if (statusChanged) {

  update.$set.previousStatus = oldStatus;

  update.$set.statusChangedAt = new Date();
}

await Patient.updateOne(
  { _id: patient._id },
  update
);