// src/integrations/hha/hha.types.ts

export interface HhaPatientResponse {
  PatientID: number;
  ReferralMasterId?: number;
  PatientStatus?: string;
}

export interface HhaReferralResponse {
  ReferralMasterId: number;
  PatientID: number;
  ReferralStatus?: string;
}