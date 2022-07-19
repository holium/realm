import axios from 'axios'

const ONE_HOUR = 1000 * 60 * 60; // in miliseconds
const baseURL = process.env.HOLIUM_API_BASEURL || `http://localhost:7000`;
const CLIENT = axios.create({ baseURL });

export interface HostingPlanet {
  patp: string
  sigil: string
  booted: boolean
}

export class HoliumAPI {
  private clientId: string
  private planets: HostingPlanet[]
  private timestamp?: number
  private ongoingFetch: Promise<HostingPlanet[]> | null

  constructor(clientId: string) {
    this.clientId = clientId;
    this.planets = [];
    this.ongoingFetch = null;

  }

  async getPlanets(): Promise<HostingPlanet[]> {
    if (this.ongoingFetch)
      return this.ongoingFetch

    let ongoingFetch = this.getPlanetsInternal()
    ongoingFetch.then(() => { this.ongoingFetch = null; })
    this.ongoingFetch = ongoingFetch;

    return ongoingFetch;
  }

  private async getPlanetsInternal(): Promise<HostingPlanet[]> {
    if (this.planets && this.planetsStillValid())
      return this.planets;

    let { data: planets } = await CLIENT.get(`planets/${this.clientId}`);
    this.planets = planets;
    this.timestamp = Date.now();

    return planets;
  }

  private planetsStillValid (): boolean {
    if (!this.timestamp)
      return false;

    let now = Date.now();
    return this.timestamp > (now - ONE_HOUR)
  }
}

export default HoliumAPI;
