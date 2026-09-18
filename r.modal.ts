// src/models/referral.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  hhaReferralId: number;
  hhaPatientId: number;

  status: string;
  previousStatus?: string;

  lastSyncedAt?: Date;
  statusChangedAt?: Date;

  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  syncError?: string;

  nextSyncAt?: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    hhaReferralId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    hhaPatientId: {
      type: Number,
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      index: true,
    },

    previousStatus: {
      type: String,
    },

    lastSyncedAt: {
      type: Date,
      index: true,
    },

    statusChangedAt: {
      type: Date,
    },

    syncStatus: {
      type: String,
      enum: ['PENDING', 'SYNCED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },

    syncError: {
      type: String,
    },

    nextSyncAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({
  hhaPatientId: 1,
});

referralSchema.index({
  nextSyncAt: 1,
  syncStatus: 1,
});

export const Referral = mongoose.model<IReferral>(
  'Referral',
  referralSchema
);