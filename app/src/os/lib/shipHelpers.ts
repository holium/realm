import axios from 'axios';
import http from 'http'

export type ShipConnectionData = {
  patp: string
  url: string
  code: string
}

const httpAgent = new http.Agent({ family: 4 });

export async function getCookie(ship: ShipConnectionData): Promise<string> {
  console.log('connecting', ship)
    const response = await axios.post(
      `${ship.url}/~/login`,
      `password=${ship.code.trim()}`,
      { withCredentials: true, httpAgent }
    );
  const cookie = response.headers['set-cookie']![0];
  return cookie
}
