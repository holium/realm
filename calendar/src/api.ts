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
  /**
   * Calendar related
   */
  createCalendar: async (title: string, description = '') => {
    const json = { 'create-calendar': { title, description } };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  deleteCalendar: async (id: string) => {
    const json = { 'delete-calendar': { cid: id } };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  getCalendarList: async () => {
    return api.createApi().scry({ app: 'cal2', path: '/calendars' });
  },
  getCalendarData: async (id: string) => {
    return api.createApi().scry({ app: 'cal2', path: '/calendar/' + id });
  },
  /**
   * Span event related
   */
  createSpan: async (
    parentCalendarId: string,
    name: string,
    description: string
  ) => {
    const json = {
      'create-span': {
        cid: parentCalendarId, // parent calendar ID
        dom: { l: 0, r: 5 },
        rid: '~/left/periodic-0', // the recurence rule, left/periodic has a start date and duration
        kind: { left: { tz: '~', d: 3600000 } }, // tz => timezone, d => ????????????
        args: {
          Start: { da: 1104537600000 }, // start date in unix miliseconds
          Period: { dr: 86400000 }, // duration of the event?????
        },
        meta: {
          name,
          description,
        },
      },
    };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  deleteSpan: async (spanId: string) => {
    const json = {
      'delete-span': {
        eid: spanId,
      },
    };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
};
