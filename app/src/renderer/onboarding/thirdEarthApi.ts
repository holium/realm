import { ThirdEarthApi } from '@holium/shared';

export const thirdEarthApi = new ThirdEarthApi(
  process.env.API_URL as string,
  process.env.API_HEADERS_CLIENT_ID as string,
  process.env.API_HEADERS_VERSION as string
);
