import { ThirdEarthApi } from '@holium/shared';
import { constants } from './constants';

export const thirdEarthApi = new ThirdEarthApi(
  constants.API_URL,
  constants.API_HEADERS_CLIENT_ID,
  constants.API_HEADERS_VERSION
);
