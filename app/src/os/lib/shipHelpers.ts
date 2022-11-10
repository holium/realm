import axios from 'axios';
import http from 'http';
import Store from 'electron-store';
import EncryptedStore from './encryptedStore';

export type ShipConnectionData = {
  patp: string;
  url: string;
  code: string;
};

export type ShipCredentials = {
  cookie: string;
  // needed to refresh cookie when stale (403)
  code: string;
  passwordHash: string;
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

export function storeCredentials(
  patp: string,
  secretKey: string,
  credentials: ShipCredentials
) {
  const storeParams = {
    name: 'credentials',
    cwd: `realm.${patp}`,
    secretKey: secretKey,
    accessPropertiesByDotNotation: true,
  };

  const db =
    process.env.NODE_ENV === 'development'
      ? new Store<ShipCredentials>(storeParams)
      : new EncryptedStore<ShipCredentials>(storeParams);
  db.store = credentials;
  return credentials;
}

export function readCredentials(
  secretKey: string,
  patp: string
): ShipCredentials {
  const storeParams = {
    name: 'credentials',
    cwd: `realm.${patp}`,
    secretKey: secretKey,
    accessPropertiesByDotNotation: true,
  };

  const db =
    process.env.NODE_ENV === 'development'
      ? new Store<ShipCredentials>(storeParams)
      : new EncryptedStore<ShipCredentials>(storeParams);

  return db.store;
}
