import log from 'electron-log';
import dns from 'dns';

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
  let cookie: string | undefined;
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
      // credentials: 'include', // TODO test this
      signal: controller.signal,
    });
    cookie = cookie = response.headers.get('set-cookie');
    log.info(`Got cookie for ${serverUrl}`);
  } catch (e) {
    log.error(`Error getting cookie for ${serverUrl}`, e);
    return Promise.reject(e);
  } finally {
    clearTimeout(timeout);
  }
  return cookie;
}
