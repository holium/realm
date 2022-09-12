import axios from 'axios'

const baseURL =`https://lionfish-app-s8nvw.ondigitalocean.app`; // staging URL
const client = axios.create({ baseURL });

export interface HostingPlanet {
  patp: string
  sigil: string
  booted: boolean
  priceMonthly: number
  priceAnnual: number
}

export interface HostingPurchasedShip {
  patp: string
  sponsor?: string
  link?: string
  code?: string
  firstBoot?: boolean
  lastRestarted?: string
  ethAddress?: string
}

export interface AccessCode {
  id: string
  type: string
  value?: string
  redeemed?: boolean
  image?: string
  title?: string
  description?: string
  expiresAt?: string
}

export class HoliumAPI {

  async createAccount(email: string, accessCode?: string): Promise<{ id: string, verificationCode: string }> {
    let { data } = await client.post(`accounts/create?email=${email}${accessCode ? `&accessCode=${accessCode}` : ''}`);
    return { id: data.id, verificationCode: data.verificationCode };
  }

  async resendVerificationCode(accountId: string): Promise<string> {
    let { data } = await client.post(`accounts/${accountId}/resend-email-verification`);
    return data.verificationCode;
  }

  async getPlanets(accountId: string, accessCode?: string): Promise<HostingPlanet[]> {
    let { data } = await client.post(`accounts/${accountId}/assign-planets${accessCode ? `?accessCode=${accessCode}` : ''}`);
    return data.planets;
  }

  async prepareCheckout(accountId: string, patp: string, billingPeriod: string) {
    let { data } = await client.post(`accounts/${accountId}/prepare-checkout?patp=${patp}&billingPeriod=${billingPeriod}`);
    return { clientSecret: data.clientSecret };
  }

  async completeCheckout(accountId: string, patp: string) {
    let { data } = await client.post(`accounts/${accountId}/complete-checkout?patp=${patp}`);
    return { id: data.id, patp: data.patp, checkoutComplete: data.checkoutComplete };
  }

  async getShips(accountId: string): Promise<HostingPurchasedShip[]> {
    let { data } = await client.get(`accounts/${accountId}/get-ships`);
    return data
  }

  async getAccessCode(code: string): Promise<AccessCode | null> {
    try {
      let { data } = await client.get(`access-codes/${code}`);
      return data;
    } catch (err) {
      console.error(err)
      return null
    }
  }
}

export default HoliumAPI;
