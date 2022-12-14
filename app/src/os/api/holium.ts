import axios from 'axios';

let baseURL = `https://realm-api-staging-2-ugw49.ondigitalocean.app`; // staging URL
if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://realm-api-prod-fqotc.ondigitalocean.app';
} else if (process.env.USE_LOCAL_API) {
  baseURL = 'http://localhost:8080';
}

const client = axios.create({ baseURL });

export interface HostingPlanet {
  patp: string;
  sigil: string;
  booted: boolean;
  priceMonthly: number;
  priceAnnual: number;
}

export interface HostingPurchasedShip {
  patp: string;
  sponsor?: string;
  link?: string;
  code?: string;
  firstBoot?: boolean;
  lastRestarted?: string;
  ethAddress?: string;
}

export interface AccessCode {
  id: string;
  email?: string;
  type: string;
  value?: string;
  redeemed?: boolean;
  singleUse?: boolean;
  image?: string;
  title?: string;
  description?: string;
  expiresAt?: string;
}

export class HoliumAPI {
  async createAccount(
    email: string,
    accessCode?: string
  ): Promise<{
    id: string | null;
    verificationCode: string | null;
    errorCode: number | null;
  }> {
    try {
      const { data } = await client.post(
        `accounts/create?email=${email}${
          accessCode ? `&accessCode=${accessCode}` : ''
        }`
      );
      return {
        id: data.id,
        verificationCode: data.verificationCode,
        errorCode: null,
      };
    } catch (error: any) {
      if (
        error.response &&
        error.response.status &&
        error.response.status === 441
      ) {
        return { id: null, verificationCode: null, errorCode: 441 };
      }
      return { id: null, verificationCode: null, errorCode: null };
    }
  }

  async resendVerificationCode(accountId: string): Promise<boolean> {
    const { data } = await client.post(
      `accounts/${accountId}/resend-email-verification`
    );
    return data.success;
  }

  async resendNewEmailVerificationCode(accountId: string): Promise<boolean> {
    const { data } = await client.post(
      `/accounts/${accountId}/resend-new-email-verification-code`
    );
    return data.success;
  }

  async verifyEmail(
    accountId: string,
    verificationCode: string
  ): Promise<{ success: boolean; email: string | null }> {
    const { data } = await client.post(
      `/accounts/${accountId}/verify-email?verificationCode=${verificationCode}`
    );
    return { success: data.success, email: data.email };
  }

  async changeEmail(
    accountId: string,
    newEmail: string
  ): Promise<{
    success: boolean;
    verificationCode: string | null;
    errorCode: number | null;
  }> {
    try {
      const { data } = await client.post(
        `/accounts/${accountId}/change-email?email=${newEmail}`
      );
      return {
        success: data.verificationCode !== null,
        verificationCode: data.verificationCode,
        errorCode: null,
      };
    } catch (error: any) {
      if (
        error.response &&
        error.response.status &&
        error.response.status === 441
      ) {
        return { success: false, verificationCode: null, errorCode: 441 };
      }
      return { success: false, verificationCode: null, errorCode: null };
    }
  }

  async verifyNewEmail(
    accountId: string,
    verificationCode: string
  ): Promise<{ success: boolean; email: string | null }> {
    const { data } = await client.post(
      `/accounts/${accountId}/verify-new-email?verificationCode=${verificationCode}`
    );
    return { success: data.success, email: data.newEmail };
  }

  async getPlanets(
    accountId: string,
    inviteCode?: string
  ): Promise<HostingPlanet[]> {
    const { data } = await client.post(
      `accounts/${accountId}/assign-planets${
        inviteCode ? `?accessCode=${inviteCode}` : ''
      }`
    );
    return data.planets;
  }

  async confirmPlanetAvailable(
    accountId: string,
    patp: string
  ): Promise<boolean> {
    const { data } = await client.post(
      `accounts/${accountId}/confirm-planet-available?patp=${patp}`
    );

    return data.available === true;
  }

  async prepareCheckout(
    accountId: string,
    patp: string,
    billingPeriod: string
  ) {
    const { data } = await client.post(
      `accounts/${accountId}/prepare-checkout?patp=${patp}&billingPeriod=${billingPeriod}`
    );
    return { clientSecret: data.clientSecret };
  }

  async completeCheckout(
    accountId: string,
    patp: string
  ): Promise<{
    id?: string;
    patp?: string;
    success: boolean;
    errorCode?: number;
  }> {
    try {
      const { data } = await client.post(
        `accounts/${accountId}/complete-checkout?patp=${patp}`
      );
      return {
        id: data.id,
        patp: data.patp,
        success: data.checkoutComplete,
      };
    } catch (error: any) {
      if (error.response && error.response.status) {
        return { success: false, errorCode: error.response.status };
      }
      return { success: false };
    }
  }

  async getShips(accountId: string): Promise<HostingPurchasedShip[]> {
    const { data } = await client.get(`accounts/${accountId}/get-ships`);
    return data;
  }

  async getAccessCode(code: string): Promise<AccessCode | null> {
    try {
      const { data } = await client.get(`access-codes/${code}`);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async redeemAccessCode(code: string): Promise<{
    success: boolean;
    errorCode: number | null;
    email?: string;
    preJoinGroup?: string;
    affiliateId?: string;
  }> {
    try {
      const { data } = await client.post(`access-codes/${code}/redeem`);
      const { email, affiliateId, preJoinGroup } = data;
      return {
        success: true,
        email,
        affiliateId,
        preJoinGroup,
        errorCode: null,
      };
    } catch (error: any) {
      if (error.response && error.response.status) {
        return { success: false, errorCode: error.response.status };
      }
      return { success: false, errorCode: null };
    }
  }
}

export default HoliumAPI;
