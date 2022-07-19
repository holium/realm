import axios from 'axios';

export type ShipConnectionData = {
  patp: string
  url: string
  code: string
}

export async function getCookie(ship: ShipConnectionData): Promise<string> {
  console.log('connecting', ship)
    const response = await axios.post(
      `${ship.url}/~/login`,
      `password=${ship.code.trim()}`,
      { withCredentials: true }
    );
    const cookie = response.headers['set-cookie']![0];
    return cookie
}
