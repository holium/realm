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
  createSpanLeftSingle: async (
    calendarId: string,
    startDateMS: number,
    durationMS: number,
    name: string,
    description = ''
  ) => {
    const json = {
      'create-span': {
        cid: calendarId, // the calendar id (I WILL be changing this format)
        dom: { l: 0, r: 0 }, // domain, the numbers between l and r inclusive will be the basis for the instances of the event, in this case one instance, the 0th
        rid: '~/left/single-0', // the rule id, in this case a single event defined by a start and a duration
        kind: { left: { tz: null, d: durationMS } }, // the kind of span, in this case instances are defined by a start and a duration
        args: {
          // arguments to the rule, in this case a single event defined by a start and a duration
          Start: { dx: { i: 0, d: startDateMS } }, // this single span is defined by the start
        },
        meta: {
          name,
          description,
        },
      },
    };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  createSpanBothSingle: async (
    calendarId: string,
    startDateMS: number,
    endDateMS: number,
    name: string,
    description = ''
  ) => {
    // an event that has both a start and end
    const json = {
      'create-span': {
        cid: calendarId, //  '0v2j60e.mtk5c.b0hp1.an1v3.0v4b4', the calendar id (I WILL be changing this format)
        dom: { l: 0, r: 0 }, // domain, the numbers between l and are inclusive will be the basis for the instances of the event, in this case one instance, the 0th
        rid: '~/both/single-0', // the rule id, in this case a single event
        kind: { both: { lz: null, rz: null } }, // the kind of span, in this case both start and end are defined by the rule
        args: {
          // arguments for the rule, in this case a single event defined by start/end
          Start: { dx: { i: 0, d: startDateMS } }, // the start of the single event (ex: d => 1104537600000)
          End: { dx: { i: 0, d: endDateMS } }, // the end of the single event (ex: d =>1104537600000)
        },
        meta: {
          name,
          description,
        },
      },
    };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  createSpanPeriodicDaily: async (
    calendarId: string,
    startDateMS: number,
    repeatCount: { l: number; r: number },
    timeBetweenEvents: number,
    durationMS: number,
    name: string,
    description = ''
  ) => {
    // an event that has both a start and end
    const json = {
      'create-span': {
        cid: calendarId,
        dom: repeatCount, //number of total events (10 here)
        rid: '~/left/periodic-0',
        kind: { left: { tz: null, d: durationMS } }, //duration of the instance
        args: {
          Start: { da: startDateMS }, //start date
          Period: { dr: timeBetweenEvents }, //the time between events
        },
        meta: {
          name,
          description,
        },
      },
    };
    return api.createApi().poke({ app: 'cal2', mark: 'calendar-action', json });
  },
  createSpanPeriodicWeekly: async (
    calendarId: string,
    startDateMS: number,
    durationMS: number,
    includedWeekDays: number[],
    name: string,
    description = ''
  ) => {
    const json = {
      'create-span': {
        cid: calendarId,
        dom: {
          l: 0,
          r: 10,
        },
        rid: '~/left/days-of-week-0',
        kind: {
          left: {
            tz: null,
            d: durationMS, //duration
          },
        },
        args: {
          Start: {
            da: startDateMS,
          },
          Weekdays: {
            wl: includedWeekDays, // [0,1,2,3,4] a list of weekdays, 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
          },
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
