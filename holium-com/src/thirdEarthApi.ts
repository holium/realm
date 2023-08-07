import { constants } from 'constants';

import { ThirdEarthApi } from '@holium/shared';

export const thirdEarthApi = new ThirdEarthApi(
  constants.API_URL as string,
  constants.API_HEADERS_CLIENT_ID as string,
  constants.API_HEADERS_VERSION as string
);
