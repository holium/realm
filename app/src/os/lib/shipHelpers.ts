import log from 'electron-log';
import fetch from 'cross-fetch';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

interface ShipConnectionData {
  serverId?: string;
  serverUrl: string;
  serverCode: string;
}

export async function getCookie(server: ShipConnectionData) {
  log.info(
    `Getting cookie for ${server.serverUrl} with code ${server.serverCode}`
  );
  try {
    const response = await fetch(`${server.serverUrl}/~/login`, {
      method: 'POST',
      body: `password=${server.serverCode.trim()}`,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const cookie = response.headers.get('set-cookie')?.split(';')[0];

    return cookie;
  } catch (e) {
    log.error(`Error getting cookie for ${server.serverUrl}`, e);
    return;
  }
}
