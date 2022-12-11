import dns from 'dns';
import url from 'url';
import axios, { Axios } from 'axios';
import http from 'http';

export interface ShipConnectionData {
  patp: string;
  url: string;
  code: string;
}

const httpAgent = new http.Agent({ family: 4 });
const client = axios.create({ withCredentials: true, httpAgent });
registerInterceptor(client);

export async function getCookie(ship: ShipConnectionData): Promise<string> {
  const response = await axios.post(
    `${ship.url}/~/login`,
    `password=${ship.code.trim()}`,
    { withCredentials: true, httpAgent }
  );
  const cookie = response.headers['set-cookie']![0];
  return cookie;
}

export function registerInterceptor(axios: Axios) {
  axios.interceptors.request.use(async (reqConfig) => {
    try {
      const parsedUrl = url.parse(reqConfig.url!);
      const hostname = parsedUrl.hostname!;
      const ips = await dns.promises.resolve(hostname);
      const ip = ips[0];

      reqConfig.headers!.Host = hostname; // set hostname in header
      parsedUrl.hostname = ip;
      // @ts-ignore
      delete parsedUrl.host; // clear hostname
      reqConfig.url = url.format(parsedUrl);
    } catch (err: any) {
      console.error(err, `Error getAddress, ${err.message}`);
    }

    return reqConfig;
  });
}
