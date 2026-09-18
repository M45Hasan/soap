// src/models/sync-state.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncState extends Document {
  entity: 'PATIENT' | 'REFERRAL';

  lastRunAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;

  status: 'RUNNING' | 'SUCCESS' | 'FAILED';

  processed: number;
  failed: number;
}

const syncStateSchema = new Schema<ISyncState>(
  {
    entity: {
      type: String,
      enum: ['PATIENT', 'REFERRAL'],
      required: true,
      unique: true,
    },

    lastRunAt: Date,
    lastSuccessAt: Date,
    lastFailureAt: Date,

    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },

    processed: {
      type: Number,
      default: 0,
    },

    failed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const SyncState = mongoose.model<ISyncState>(
  'SyncState',
  syncStateSchema
);