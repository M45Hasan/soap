// src/models/patient.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  hhaPatientId: number;

  status: string;
  previousStatus?: string;

  referralId?: number;

  lastSyncedAt?: Date;
  statusChangedAt?: Date;

  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  syncError?: string;

  nextSyncAt?: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    hhaPatientId: {
      type: Number,
      required: true,
      unique: true,
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

    referralId: {
      type: Number,
      index: true,
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

patientSchema.index({
  nextSyncAt: 1,
  syncStatus: 1,
});

export const Patient = mongoose.model<IPatient>(
  'Patient',
  patientSchema
);