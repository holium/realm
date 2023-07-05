import Urbit from '@urbit/http-api';
import memoize from 'lodash/memoize';

import { log, shipCode, shipName } from './utils';

export const api = {
  createApi: memoize(() => {
    /*
    Connect to urbit and return the urbit instance
    returns urbit instance
  */

    const urb = new Urbit('http://localhost:8080', shipCode());

    urb.ship = shipName();
    // Just log errors if we get any
    urb.onError = (message) => log('onError: ', message);
    urb.onOpen = () => log('urbit onOpen');
    urb.onRetry = () => log('urbit onRetry');
    //sub to our frontend updates
    // urb.subscribe(updates);
    urb.connect();

    return urb;
  }),

  getCalendarList: async () => {
    return api.createApi().scry({ app: 'cal2', path: '/calendars' });
  },
  getCalendarData: async (id: string) => {
    return api.createApi().scry({ app: 'cal2', path: '/calendar/' + id });
  },
};
