// src/integrations/hha/hha.client.ts

import soap from 'soap';

export class HhaClient {
  private client: any = null;

  async connect() {
    if (this.client) {
      return this.client;
    }

    this.client = await soap.createClientAsync(
      process.env.HHA_WSDL_URL!
    );

    return this.client;
  }

  async getPatientReferralInfo(patientId: number) {
    const client = await this.connect();

    const args = {
      PatientID: patientId,
      Username: process.env.HHA_USERNAME,
      Password: process.env.HHA_PASSWORD,
    };

    const result = await client.GetPatientReferralInfoAsync(args);

    return result;
  }

  async getReferralStatus(referralId: number) {
    const client = await this.connect();

    const args = {
      ReferralMasterId: referralId,
      Username: process.env.HHA_USERNAME,
      Password: process.env.HHA_PASSWORD,
    };

    const result = await client.GetReferralStatusAsync(args);

    return result;
  }
}

export const hhaClient = new HhaClient();