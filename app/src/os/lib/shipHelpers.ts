import axios from 'axios';
import http from 'http';
import Store from 'electron-store';
// import EncryptedStore from './encryptedStore';

export type ShipConnectionData = {
  patp: string;
  url: string;
  code: string;
};

const httpAgent = new http.Agent({ family: 4 });

export async function getCookie(ship: ShipConnectionData): Promise<string> {
  const response = await axios.post(
    `${ship.url}/~/login`,
    `password=${ship.code.trim()}`,
    { withCredentials: true, httpAgent }
  );
  const cookie = response.headers['set-cookie']![0];
  return cookie;
}
