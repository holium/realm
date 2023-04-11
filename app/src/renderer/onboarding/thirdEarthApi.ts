import { ThirdEarth } from '@holium/shared';

export const thirdEarthApi = new ThirdEarth(
  process.env.API_URL as string,
  process.env.API_HEADERS_CLIENT_ID as string,
  process.env.API_HEADERS_VERSION as string
);
