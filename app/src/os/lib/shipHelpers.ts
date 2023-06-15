import { session } from 'electron';
import log from 'electron-log';
import dns from 'dns';

import { Credentials } from '../services/ship/ship.types.ts';

dns.setDefaultResultOrder('ipv4first');

type ServerConnectionData = {
  serverUrl: string;
  serverCode: string;
};

export async function getCookie({
  serverUrl,
  serverCode,
}: ServerConnectionData) {
  log.info(`Getting cookie for ${serverUrl}`);
  let cookie: string | null;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);
  try {
    const response = await fetch(`${serverUrl}/~/login`, {
      method: 'POST',
      body: `password=${serverCode.trim()}`,
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include', // TODO test this
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Bad response from server: ${response.status}`);
    }
    cookie = response.headers.get('set-cookie');
    return cookie;
  } catch (e) {
    log.error(`Error getting cookie for ${serverUrl}`, e);
    return Promise.reject(e);
  } finally {
    clearTimeout(timeout);
  }
}

export async function setSessionCookie(credentials: Credentials) {
  const path = credentials.cookie?.split('; ')[1].split('=')[1];
  const maxAge = credentials.cookie?.split('; ')[2].split('=')[1];
  const value = credentials.cookie?.split('=')[1].split('; ')[0];
  try {
    // remove current cookie
    await session
      .fromPartition(`persist:webview-${credentials.ship}`)
      .cookies.remove(`${credentials.url}`, `urbauth-${credentials.ship}`);
    // set new cookie
    return await session
      .fromPartition(`persist:webview-${credentials.ship}`)
      .cookies.set({
        url: `${credentials.url}`,
        name: `urbauth-${credentials.ship}`,
        value,
        expirationDate: new Date(
          Date.now() + parseInt(maxAge ?? '0') * 1000
        ).getTime(),
        path: path,
      });
  } catch (e) {
    log.error('setSessionCookie error:', e);
  }
}
