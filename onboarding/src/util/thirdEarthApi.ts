import { ThirdEarth } from '@holium/shared';
import { constants } from './constants';

export const thirdEarthApi = new ThirdEarth(
  constants.API_URL,
  constants.API_HEADERS_CLIENT_ID,
  constants.API_HEADERS_VERSION
);
