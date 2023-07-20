import Urbit from '@urbit/http-api';
import memoize from 'lodash/memoize';

import { log, shipCode, shipName } from './utils';
type RepeatCount = { l: number; r: number };
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
  vent: async (vnt: any) => {
    const result: any = await api.createApi().thread({
      inputMark: 'vent-package', // input to thread, contains poke
      outputMark: vnt.outputMark,
      threadName: 'venter',
      body: {
        dock: {
          ship: vnt.ship,
          dude: vnt.dude,
        },
        input: {
          desk: vnt.inputDesk,
          mark: vnt.inputMark, // mark of the poke itself
        },
        output: {
          desk: vnt.outputDesk,
          mark: vnt.outputMark,
        },
        body: vnt.body,
      },
      desk: 'calendar',
    });
    if (
      result !== null &&
      result.term &&
      result.tang &&
      Array.isArray(result.tang)
    ) {
      throw new Error(`\n${result.term}\n${result.tang.join('\n')}`);
    } else {
      return result;
    }
  },
  createCalendar: async (title: string, description = '') => {
    const json = { title, description };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'calendar-async-create', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  deleteCalendar: async (id: string) => {
    const json = {
      p: id,
      q: { delete: null },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'calendar-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  getCalendarList: async () => {
    return api.createApi().scry({ app: 'calendar', path: '/calendars' });
  },
  getCalendarData: async (id: string) => {
    return api.createApi().scry({ app: 'calendar', path: '/calendar/' + id });
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
      p: calendarId,
      q: {
        create: {
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
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
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
      p: calendarId,
      q: {
        create: {
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
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  createSpanPeriodicDaily: async (
    calendarId: string,
    startDateMS: number,
    repeatCount: RepeatCount,
    timeBetweenEvents: number,
    durationMS: number,
    name: string,
    description = ''
  ) => {
    // an event that has both a start and end
    const json = {
      p: calendarId,
      q: {
        create: {
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
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  createSpanPeriodicWeekly: async (
    calendarId: string,
    startDateMS: number,
    repeatCountObject: RepeatCount,
    durationMS: number,
    includedWeekDays: number[],
    name: string,
    description = ''
  ) => {
    const json = {
      p: calendarId,
      q: {
        create: {
          dom: repeatCountObject,
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
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  createSpanPeriodicMonthlyNthWeekday: async (
    calendarId: string,
    startDateMS: number,
    repeatCountObject: RepeatCount,
    durationMS: number,
    ordinal: 'first' | 'second' | 'third' | 'fourth' | 'last',
    dayOfWeek: number,
    name: string,
    description = ''
  ) => {
    const json = {
      p: calendarId,
      q: {
        create: {
          dom: repeatCountObject,
          rid: '~/left/monthly-nth-weekday-0',
          kind: {
            left: {
              tz: null,
              d: durationMS,
            },
          },
          args: {
            Start: {
              da: startDateMS,
            },
            Ordinal: {
              od: ordinal, // first, second, third, fourth, or last
            },
            Weekday: {
              ud: dayOfWeek, // 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
            },
          },
          meta: {
            name,
            description,
          },
        },
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  createSpanPeriodicYearlyOnDate: async (
    calendarId: string,
    startDateMS: number,
    repeatCountObject: RepeatCount,
    durationMS: number,
    name: string,
    description = ''
  ) => {
    const json = {
      p: calendarId,
      q: {
        'create-span': {
          cid: calendarId,
          dom: repeatCountObject,
          rid: '~/left/yearly-on-date-0',
          kind: {
            left: {
              tz: null,
              d: durationMS,
            },
          },
          args: {
            Start: {
              da: startDateMS,
            },
          },
          meta: {
            name,
            description,
          },
        },
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  deleteSpan: async (calendarId: string, spanId: string) => {
    const json = {
      p: calendarId,
      q: { delete: { eid: spanId } },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  deleteSpanInstance: async (
    calendarId: string,
    spanId: string,
    instanceId: number,
    name: string,
    description: string
  ) => {
    // we make the changes to delete this instance
    const json = {
      p: calendarId,
      q: {
        'update-instances': {
          eid: spanId,
          dom: { l: instanceId, r: instanceId },
          def: true,
          rid: '~/left/skip-0',
          kind: { left: { tz: null, d: 0 } },
          args: {},
          meta: {
            name,
            description,
          },
        },
      },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'span-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
};
