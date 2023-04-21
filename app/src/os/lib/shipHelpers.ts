import fetch from 'cross-fetch';
import log from 'electron-log';

export interface ShipConnectionData {
  patp?: string;
  url: string;
  code: string;
}

export async function getCookie(ship: ShipConnectionData) {
  log.info(`Getting cookie for ${ship.url}...`);
  try {
    const response = await fetch(`${ship.url}/~/login`, {
      method: 'POST',
      body: `password=${ship.code.trim()}`,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const cookie = response.headers.get('set-cookie')?.split(';')[0];

    return cookie;
  } catch (e) {
    throw new Error(`GetCookieError: ${e}`);
  }
}
