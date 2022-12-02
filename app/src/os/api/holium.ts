import axios from 'axios';

let baseURL = `https://lionfish-app-s8nvw.ondigitalocean.app`; // staging URL
if (process.env.USE_LOCAL_API && process.env.NODE_ENV !== 'production') {
  baseURL = 'http://localhost:8080';
} else if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://realm-api-prod-jjzzq.ondigitalocean.app';
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
  ): Promise<{ id: string; verificationCode: string }> {
    const { data } = await client.post(
      `accounts/create?email=${email}${
        accessCode ? `&accessCode=${accessCode}` : ''
      }`
    );
    return { id: data.id, verificationCode: data.verificationCode };
  }

  async resendVerificationCode(accountId: string): Promise<string> {
    const { data } = await client.post(
      `accounts/${accountId}/resend-email-verification`
    );
    return data.verificationCode;
  }

  async getPlanets(
    accountId: string,
    accessCode?: string
  ): Promise<HostingPlanet[]> {
    const { data } = await client.post(
      `accounts/${accountId}/assign-planets${
        accessCode ? `?accessCode=${accessCode}` : ''
      }`
    );
    return data.planets;
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

  async completeCheckout(accountId: string, patp: string) {
    const { data } = await client.post(
      `accounts/${accountId}/complete-checkout?patp=${patp}`
    );
    return {
      id: data.id,
      patp: data.patp,
      checkoutComplete: data.checkoutComplete,
    };
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

  async redeemAccessCode(code: string): Promise<boolean> {
    try {
      await client.post(`access-codes/${code}/redeem`);
      return true;
    } catch (e) {
      console.error('Redeeming access code failed.');
      return false;
    }
  }
}

export default HoliumAPI;
