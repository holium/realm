import log from 'electron-log';
import fetch from 'cross-fetch';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

type ServerConnectionData = {
  serverUrl: string;
  serverCode: string;
};

export async function getCookie(server: ServerConnectionData) {
  log.info(
    `Getting cookie for ${server.serverUrl} with code ${server.serverCode}`
  );
  let cookie: string | undefined;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);
  try {
    const response = await fetch(`${server.serverUrl}/~/login`, {
      method: 'POST',
      body: `password=${server.serverCode.trim()}`,
      headers: {
        'Content-Type': 'text/plain',
      },
      // credentials: 'include', // TODO test this
      signal: controller.signal,
    });
    cookie = response.headers.get('set-cookie')?.split(';')[0];
    log.info(`Got cookie for ${server.serverUrl}`);
  } catch (e) {
    log.error(`Error getting cookie for ${server.serverUrl}`, e);
    return Promise.reject(e);
  } finally {
    clearTimeout(timeout);
  }
  return cookie;
}
