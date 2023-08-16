import Urbit from '@urbit/http-api';
import memoize from 'lodash/memoize';

import useCalendarStore from './CalendarStore';
import { log, shipCode, shipName, splitLastOccurrence } from './utils';
type RepeatCount = { l: number; r: number };
export type Roles = 'admin' | 'viewer' | 'guest' | 'member';
export type Perms = {
  admins: Roles;
  member: null | Roles;
  custom: { [key: string]: Roles };
};
export type Offset = { sign: '+' | '-'; d: number };
export type Meta = { name: string; description: string; color: string };

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
    urb.subscribe(generalUpdates);
    urb.connect();

    return urb;
  }),
  /**
   * Subscription handlers
    -keep the current subscribed to calendar in a store var
    -when user switches calendars unsub from that calendar (if any) and sub to the new one
  */
  subCalendarUpdates: async (calendarId: string) => {
    const calUpdateObj = calendarUpdates(calendarId);
    return api.createApi().subscribe(calUpdateObj);
  },
  unsubCalendarUpdates: async (subNumber: number) => {
    return api.createApi().unsubscribe(subNumber);
  },
  /**
   * Rules related
   */
  getRules: async () => {
    return api.createApi().scry({ app: 'calendar', path: '/rules' });
  },
  getRule: async (ruleId: string) => {
    const res = await api.getRules();
    return res.rules[ruleId];
  },
  /**
   * Calendar related
   */

  createCalendar: async (
    space: string,
    title: string,
    description = '',
    perms: Perms
  ) => {
    const json = { space: { title, description, space, perms } };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-async-create', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  repermCalendar: async (space: string, calendarId: string, perms: Perms) => {
    const json = {
      space: space,
      axn: { reperm: { cid: calendarId, perms: perms } },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-crud-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  deleteCalendar: async (space: string, calendarId: string) => {
    const json = { space: space, axn: { delete: calendarId } };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-crud-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  updateCalendar: async (
    calendarId: string,
    options: {
      title?: string;
      description?: string;
      defaultRole?: string;
      publish?: boolean;
    }
  ) => {
    return await api.updateCalendarAction(calendarId, options);
  },
  getCalendarsSpace: async (space: string) => {
    return api
      .createApi()
      .scry({ app: 'calendar-spaces', path: '/calendars/' + space });
  },
  getCalendarList: async () => {
    return api.createApi().scry({ app: 'calendar', path: '/calendars' });
  },
  getCalendarData: async (id: string) => {
    return api.createApi().scry({ app: 'calendar', path: '/calendar/' + id });
  },
  getClearWebCalendarData: async (calendarId: string) => {
    // HTTP GET request
    return fetch('/apps/calendar/scry/calendar/' + calendarId);
  },
  getSpaces: async () => {
    return api.createApi().scry({ app: 'calendar-spaces', path: '/spaces' });
  },
  getOurCalendar: async () => {
    return api.createApi().scry({ app: 'calendar-spaces', path: '/our' });
  },
  getAlmanac: async () => {
    return api.createApi().scry({ app: 'calendar-spaces', path: '/almanac' });
  },
  getCurrentLink: async () => {
    return api.createApi().scry({ app: 'calendar', path: '/url-prefix' });
  },
  updateBannedShips: async (space: string, banned: string[]) => {
    const json = { space: space, axn: { banned: banned } };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-crud-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  repermSpaceCalendar: async (space: string, calendarId: string) => {
    const perms = {
      admins: 'admin',
      member: 'member',
      custom: {},
    };
    const json = {
      space: space,
      axn: { reperm: { cid: calendarId, perms: perms } },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-crud-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  /**
   * Span event related
   */
  parseToDateOffset: (datetime: number): { date: number; offset: Offset } => {
    const time = datetime % (24 * 60 * 60 * 1000);
    const offset: Offset = { sign: '+', d: time };
    return { date: datetime - time, offset };
  },
  createSpanLeftSingle: async (
    calendarId: string,
    startDateMS: number,
    durationMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreate(
      calendarId,
      { l: 0, r: 0 },
      '~/left/single-0',
      { left: { tz: null, d: durationMS } },
      { Start: { dx: { i: 0, d: startDateMS } } },
      { name, description, color }
    );
  },
  createSpanFullDaySingle: async (
    calendarId: string,
    startDateMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreate(
      calendarId,
      { l: 0, r: 0 },
      '~/fuld/single-0',
      { fuld: null },
      { Date: { da: startDateMS } },
      { name, description, color }
    );
  },
  createSpanBothSingle: async (
    calendarId: string,
    startDateMS: number,
    endDateMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreate(
      calendarId,
      { l: 0, r: 0 },
      '~/both/single-0',
      { both: { lz: null, rz: null } },
      {
        Start: { dx: { i: 0, d: startDateMS } },
        End: { dx: { i: 0, d: endDateMS } },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicDaily: async (
    calendarId: string,
    startDateTimeMS: number,
    endDateMS: number,
    timeBetweenEvents: number,
    durationMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    const { date, offset } = api.parseToDateOffset(startDateTimeMS);
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/left/periodic-0',
      { left: { tz: null, d: durationMS } },
      {
        Start: { da: date },
        Offset: { dl: offset },
        Period: { dr: timeBetweenEvents },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicFullDayDaily: async (
    calendarId: string,
    startDateMs: number,
    endDateMS: number,
    timeBetweenEvents: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/fuld/periodic-0',
      { fuld: null },
      {
        Start: { da: startDateMs },
        Period: { dr: timeBetweenEvents },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicWeekly: async (
    calendarId: string,
    startDateTimeMS: number,
    endDateMS: number,
    durationMS: number,
    includedWeekDays: number[],
    name: string,
    description = '',
    color = ''
  ) => {
    const { date, offset } = api.parseToDateOffset(startDateTimeMS);
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/left/days-of-week-0',
      { left: { tz: null, d: durationMS } },
      {
        Start: { da: date },
        Offset: { dl: offset },
        Weekdays: {
          wl: includedWeekDays, // [0,1,2,3,4] a list of weekdays, 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
        },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicFullDayWeekly: async (
    calendarId: string,
    startDateMs: number,
    endDateMS: number,
    includedWeekDays: number[],
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/fuld/days-of-week-0',
      { fuld: null },
      {
        Start: { da: startDateMs },
        Weekdays: {
          wl: includedWeekDays, // [0,1,2,3,4] a list of weekdays, 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
        },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicMonthlyNthWeekday: async (
    calendarId: string,
    startDateMs: number,
    endDateMS: number,
    durationMS: number,
    ordinal: 'first' | 'second' | 'third' | 'fourth' | 'last',
    dayOfWeek: number,
    name: string,
    description = '',
    color = ''
  ) => {
    const { date, offset } = api.parseToDateOffset(startDateMs);
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/left/monthly-nth-weekday-0',
      { left: { tz: null, d: durationMS } },
      {
        Start: { da: date },
        Offset: { dl: offset },
        Ordinal: {
          od: ordinal, // first, second, third, fourth, or last
        },
        Weekday: {
          ud: dayOfWeek, // 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
        },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicFullDayMonthlyNthWeekday: async (
    calendarId: string,
    startDateMs: number,
    endDateMS: number,
    ordinal: 'first' | 'second' | 'third' | 'fourth' | 'last',
    dayOfWeek: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/fuld/monthly-nth-weekday-0',
      { fuld: null },
      {
        Start: { da: endDateMS },
        Ordinal: {
          od: ordinal, // first, second, third, fourth, or last
        },
        Weekday: {
          ud: dayOfWeek, // 0-mon, 1-tue, 2-wed, 3-thu, 4-fri, 5-sat, 6-sun
        },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicYearlyOnDate: async (
    calendarId: string,
    startDateTimeMS: number,
    endDateMS: number,
    durationMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    const { date, offset } = api.parseToDateOffset(startDateTimeMS);
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/left/yearly-on-date-0',
      { left: { tz: null, d: durationMS } },
      {
        Start: { da: date },
        Offset: { dl: offset },
      },
      { name, description, color }
    );
  },
  createSpanPeriodicFullDayYearlyOnDate: async (
    calendarId: string,
    startDateMs: number,
    endDateMS: number,
    name: string,
    description = '',
    color = ''
  ) => {
    return await api.eventAsyncCreateUntil(
      calendarId,
      endDateMS,
      '~/fuld/yearly-on-date-0',
      { fuld: null },
      { Start: { da: startDateMs } },
      { name, description, color }
    );
  },
  deleteSpan: async (calendarId: string, spanId: string) => {
    return await api.deleteEventAction(calendarId, spanId);
  },
  /**
   * Instances / Instance updates
   */
  deleteSpanInstance: async (
    calendarId: string,
    spanId: string,
    instanceId: number
  ) => {
    return api.updateInstancesEventAction(
      calendarId,
      spanId,
      { l: instanceId, r: instanceId },
      { argId: '0v0' } // reserved id of skip rule
    );
  },
  /**
   * Inbox/Outbox related
   */
  inviteToCalendar: async (
    calendarId: string,
    ship: string,
    message: string
  ) => {
    const json = { cid: calendarId, ship: ship, msg: message };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-async-invite', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  cancelCalendarInvite: async (calendarId: string, ship: string) => {
    const json = {
      p: calendarId,
      q: { cancel: { ship: ship } },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-invite-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  kickFromCalendar: async (calendarId: string, ship: string) => {
    const json = {
      p: calendarId,
      q: { kick: { ship: ship } },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-invite-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  acceptCalendarInvite: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: { accept: null },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-invite-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  rejectCalendarInvite: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: { reject: null },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-invite-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  joinCalendar: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: { join: null },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-join-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  leaveCalendar: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: { leave: null },
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'boxes-join-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  /**
   * OurSpace related
   */
  createCalendarOur: async (title: string, description = '') => {
    const json = { our: { title, description } };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-async-create', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  deleteCalendarOur: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: 'delete',
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-our-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  acceptInviteOur: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: 'accept',
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-our-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  leaveCalendarOur: async (calendarId: string) => {
    const json = {
      p: calendarId,
      q: 'leave',
    };
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar-spaces', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'spaces-our-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: json, // the actual poke content
    });
  },
  /**
   * Fundamental API
   */
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
  asyncCreateVent: async (body: any) => {
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'calendar-async-create', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: body, // the actual poke content
    });
  },
  calendarActionVent: async (body: any) => {
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'calendar-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: body, // the actual poke content
    });
  },
  eventActionVent: async (body: any) => {
    return await api.vent({
      ship: shipName(), // the ship to poke
      dude: 'calendar', // the agent to poke
      inputDesk: 'calendar', // where does the input mark live
      inputMark: 'event-action', // name of input mark
      outputDesk: 'calendar', // where does the output mark live
      outputMark: 'calendar-vent', // name of output mark
      body: body, // the actual poke content
    });
  },
  /**
   * Fundamental API: Async Creates
   */
  calendarAsyncCreate: async (title: string, description: string) => {
    return await api.asyncCreateVent({ calendar: { title, description } });
  },
  eventAsyncCreate: async (
    calendarId: string,
    dom: RepeatCount,
    rule: string,
    kind: any,
    args: any,
    meta: Meta
  ) => {
    const json = {
      event: {
        cid: calendarId,
        dom,
        rid: rule,
        kind,
        args,
        meta,
      },
    };
    return await api.asyncCreateVent(json);
  },
  eventAsyncCreateUntil: async (
    calendarId: string,
    until: number,
    rule: string,
    kind: any,
    args: any,
    meta: Meta
  ) => {
    const json = {
      'event-until': { cid: calendarId, until, rule, kind, args, meta },
    };
    return await api.asyncCreateVent(json);
  },
  eventRuleAsyncCreate: async (
    calendarId: string,
    eid: string,
    rule: string,
    kind: any,
    args: any
  ) => {
    const json = { 'event-rule': { calendarId, eid, rule, kind, args } };
    return await api.asyncCreateVent(json);
  },
  eventMetadataAsyncCreate: async (
    calendarId: string,
    eid: string,
    meta: Meta
  ) => {
    const json = { 'event-metadata': { calendarId, eid, meta } };
    return await api.asyncCreateVent(json);
  },
  /**
   * Fundamental API: Calendar Actions
   */
  updateCalendarAction: async (
    calendarId: string,
    fields: {
      title?: string;
      description?: string;
      defaultRole?: string;
      publish?: boolean;
    }
  ) => {
    const { title, description, defaultRole, publish } = fields;
    const fieldsList = [
      typeof title === 'string' ? { title: title } : null,
      typeof description === 'string' ? { description: description } : null,
      typeof defaultRole === 'string' ? { 'default-role': defaultRole } : null,
      typeof publish === 'boolean' ? { publish: publish } : null,
    ].filter(Boolean);
    const json = {
      p: calendarId,
      q: { update: fieldsList },
    };
    return await api.calendarActionVent(json);
  },
  deleteCalendarAction: async (calendarId: string) => {
    const json = { p: calendarId, q: { delete: null } };
    return await api.calendarActionVent(json);
  },
  /**
   * Fundamental API: Event Actions
   */
  updateEventAction: async (
    calendarId: string,
    eventId: string,
    fields: {
      defRule?: string;
      defData?: string;
    }
  ) => {
    const { defRule, defData } = fields;
    const fieldsList = [
      typeof defRule === 'string' ? { defRule: defRule } : null,
      typeof defData === 'string' ? { defData: defData } : null,
    ].filter(Boolean);
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { update: fieldsList },
    };
    return await api.eventActionVent(json);
  },
  deleteEventAction: async (calendarId: string, eventId: string) => {
    const json = { p: { cid: calendarId, eid: eventId }, q: { delete: null } };
    return await api.eventActionVent(json);
  },
  createRuleEventAction: async (
    calendarId: string,
    eventId: string,
    argId: string,
    rule: string,
    kind: any,
    args: any
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'create-rule': { aid: argId, rid: rule, kind: kind, args: args } },
    };
    return await api.eventActionVent(json);
  },
  updateRuleEventAction: async (
    calendarId: string,
    eventId: string,
    argId: string,
    rule: string,
    kind: any,
    args: any
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'update-rule': { aid: argId, rid: rule, kind: kind, args: args } },
    };
    return await api.eventActionVent(json);
  },
  deleteRuleEventAction: async (
    calendarId: string,
    eventId: string,
    argId: string
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'delete-rule': { aid: argId } },
    };
    return await api.eventActionVent(json);
  },
  createMetadataEventAction: async (
    calendarId: string,
    eventId: string,
    metaId: string,
    meta: Meta
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'create-metadata': { mid: metaId, meta: meta } },
    };
    return await api.eventActionVent(json);
  },
  updateMetadataEventAction: async (
    calendarId: string,
    eventId: string,
    metaId: string,
    fields: {
      name?: string;
      description?: string;
      color?: string;
    }
  ) => {
    const { name, description, color } = fields;
    const fieldsList = [
      typeof name === 'string' ? { name: name } : null,
      typeof description === 'string' ? { description: description } : null,
      typeof color === 'string' ? { color: color } : null,
    ].filter(Boolean);
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'update-metadata': { mid: metaId, fields: fieldsList } },
    };
    return await api.eventActionVent(json);
  },
  deleteMetadataEventAction: async (
    calendarId: string,
    eventId: string,
    metaId: string
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'delete-metadata': { mid: metaId } },
    };
    return await api.eventActionVent(json);
  },
  updateInstancesEventAction: async (
    calendarId: string,
    eventId: string,
    dom: RepeatCount,
    fields: {
      argId?: string;
      metaId?: string;
    }
  ) => {
    const { argId, metaId } = fields;
    const fieldsList = [
      typeof argId === 'string' ? { aid: argId } : null,
      typeof metaId === 'string' ? { mid: metaId } : null,
    ].filter(Boolean);
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'update-instances': { dom: dom, fields: fieldsList } },
    };
    return await api.eventActionVent(json);
  },
  updateDomainEventAction: async (
    calendarId: string,
    eventId: string,
    dom: RepeatCount
  ) => {
    const json = {
      p: { cid: calendarId, eid: eventId },
      q: { 'update-domain': { dom: dom } },
    };
    return await api.eventActionVent(json);
  },
};
const updateHandler = (update: any) => {
  log('update', update);
  if (Object.prototype.hasOwnProperty.call(update, 'event')) {
    // Update instance
    if (Object.prototype.hasOwnProperty.call(update.event, 'put')) {
      const eventId = update.event.put.eid;
      const newEvent = { id: eventId, ...update.event.put.event };
      const state = useCalendarStore.getState();
      const spans = state.spans;
      // Find the event and update it
      let eventExists = false;
      const newSpans = spans.map((item: any) => {
        if (item.id === eventId) {
          // find the instance and update it
          eventExists = true;
          return {
            ...item,
            ...newEvent,
          };
        }
        return item;
      });
      // Event doesn't exist, it's a new one. Add it to the list
      if (!eventExists) {
        newSpans.push(newEvent);
      }
      state.setSpans(newSpans);
    }
    // Delete event
    if (Object.prototype.hasOwnProperty.call(update.event, 'del')) {
      const state = useCalendarStore.getState();
      const spans = state.spans;
      const eventId = update.event.del.eid;
      // Filter out this event using the id
      const newSpans = spans.filter((item: any) => item.id !== eventId);
      state.setSpans(newSpans);
    }
  } else if (Object.prototype.hasOwnProperty.call(update, 'add-calendar')) {
    // Add calendar
    const newCalId = update['add-calendar'].cid;
    const newCalTitle = splitLastOccurrence(newCalId, '/')[1];
    const state = useCalendarStore.getState();
    // Create the new cal entry
    const newCalendar = {
      id: newCalId,
      title: newCalTitle,
      ...update['add-calendar'],
    };
    // push it to the new calendar list
    const newCalendarList = state.calendarList;
    newCalendarList.push(newCalendar);
    state.setCalendarList(newCalendarList);
  } else if (Object.prototype.hasOwnProperty.call(update, 'del-calendar')) {
    // Delete calendar
    const delCalId = update['del-calendar'].cid;
    const state = useCalendarStore.getState();
    // Filter out the deleted calendar
    const newCalendarList = state.calendarList.filter(
      (item: any) => item.id !== delCalId
    );

    state.setCalendarList(newCalendarList);
  } else if (Object.prototype.hasOwnProperty.call(update, 'title')) {
    // Update the currently selected calendar's title
    // TODO changing space should null selectedCalendar
    const state = useCalendarStore.getState();
    const selectedCalendar = state.selectedCalendar;
    const newCalendarList = state.calendarList.map((item: any) => {
      if (item.id === selectedCalendar) {
        return { ...item, title: update.title };
      }
      return item;
    });
    state.setCalendarList(newCalendarList);
  } else if (Object.prototype.hasOwnProperty.call(update, 'perms')) {
    // Update the perms for this calendar
    const calId = update.perms.cid;
    const state = useCalendarStore.getState();

    const newCalendarList = state.calendarList.map((item: any) => {
      if (item.id === calId) {
        return { ...item, perms: update.perms.perms };
      }
      return item;
    });
    state.setCalendarList(newCalendarList);
  } else if (Object.prototype.hasOwnProperty.call(update, 'publish')) {
    const state = useCalendarStore.getState();
    const selectedCalendar = state.selectedCalendar;
    const newCalendarList = state.calendarList.map((item: any) => {
      if (item.id === selectedCalendar) {
        return { ...item, publish: update.publish };
      }
      return item;
    });
    state.setCalendarList(newCalendarList);
  }
};
const calendarUpdates = (calendarId: string) => {
  return {
    app: 'calendar',
    path: '/ui/calendar/' + calendarId,
    event: updateHandler,
    //TODO: handle sub death/kick/err
    err: () => log('Subscription rejected'),
    quit: (e: any) => log('Kicked from subscription', e),
  };
};
const generalUpdates = {
  app: 'calendar-spaces',
  path: '/ui',
  event: updateHandler,
  //TODO: handle sub death/kick/err
  err: () => log('Subscription rejected'),
  quit: (e: any) => log('Kicked from subscription', e),
};
