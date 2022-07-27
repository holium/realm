import axios from 'axios'

const baseURL = process.env.HOLIUM_API_BASEURL || `http://localhost:7000`;
const client = axios.create({ baseURL });

export interface HostingPlanet {
  patp: string
  sigil: string
  booted: boolean
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
  type: string
  value?: string
  redeemed?: boolean
  image?: string
  title?: string
  description?: string
  expiresAt?: string
}

export class HoliumAPI {

  async createAccount(accessCode?: string): Promise<{ id: string, planets: HostingPlanet[] }> {
    let { data } = await client.post(`accounts/create${accessCode ? `?accessCode=${accessCode}` : ''}`);
    return { id: data.id, planets: data.planets };
  }

  async getPlanets(accountId: string, accessCode?: string): Promise<HostingPlanet[]> {
    let { data } = await client.post(`accounts/${accountId}/assign-planets${accessCode ? `?accessCode=${accessCode}` : ''}`);
    return data.planets;
  }

  async prepareCheckout(accountId: string, patp: string) {
    let { data } = await client.post(`accounts/${accountId}/prepare-checkout?patp=${patp}`);
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
