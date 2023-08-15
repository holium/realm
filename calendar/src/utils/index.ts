import memoize from 'lodash/memoize';

const isDev = () => true;

export const shipName = memoize(() => {
  return 'botweb';
});
export const shipCode = memoize(() => {
  return 'novput-dapdun-riglur-dosmeb';
});
export const shipURI = memoize(() => {
  return 'http://localhost:8080';
});

export const log = (...args: any) => {
  //console log, only displays results in dev mode
  if (!isDev()) return;
  console.log(...args);
};
export const formatMap = {
  long: { weekday: 'long', month: 'long', day: 'numeric' },
  default: {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  },
};
/**
 * Gets a display date in the following format:
 *  04/07/22 05:47 AM
 *
 * @param {number} timestamp
 * @return {*}  {string}
 */
export const formatDate = (
  timestamp: number,
  options?: { dayOnly?: boolean; long?: boolean }
): string => {
  const date = new Date(timestamp * 1);
  let time = '';
  let format: any = formatMap.default;
  if (options && !options.dayOnly) {
    time = ` ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
  if (options && options.long) {
    format = formatMap.long;
  }
  return date.toLocaleDateString('en-us', format) + time;
};
export const displayDate = (date: number): string => {
  return formatDate(date, { long: false, dayOnly: true });
};
export const convertH2M = (timeInHour: string) => {
  const timeParts = timeInHour.split(':');
  return Number(timeParts[0]) * 60 + Number(timeParts[1]);
};
export const convertDateToHHMM = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getDayOfWeekJS = (dayCount: number): string => {
  //converts js Date.getDay() to a week day string (sunday, monday...)
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return daysOfWeek[dayCount];
};
export const getOccurrenceOfDayInMonth = (
  date: any,
  dayOfWeek: number
): number => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay();

  let dayOffset = dayOfWeek - firstDayOfWeek;
  if (dayOffset < 0) {
    dayOffset += 7;
  }

  const occurrence = Math.floor((date.getDate() + dayOffset - 1) / 7) + 1;
  return occurrence;
};
export const getMonthAndDay = (date: any): string => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  const formattedDate = `${month} ${day}`;
  return formattedDate; //august 10..
};
export const addOrdinal = (num: number): string => {
  switch (num) {
    case 1:
      return num + 'st';
      break;
    case 2:
      return num + 'nd';
      break;
    case 3:
      return num + 'rd';
      break;
    default:
      return num + 'th';
  }
};
export const addOrdinal2 = (
  num: number
): 'first' | 'second' | 'third' | 'fourth' | 'last' => {
  switch (num) {
    case 1:
      return 'first';
      break;
    case 2:
      return 'second';
      break;
    case 3:
      return 'third';
      break;
    case 4:
      return 'fourth';
      break;
    default:
      return 'last';
  }
};
export const formatHoursMinutes = (date: any): string => {
  return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0'); // => hh:mm
};
export const formatDateToYYYYMMDD = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`; // =>yyyy-mm-dd
};

export const countDaysBetweenDates = (
  startDate: Date,
  endDate: string
): number => {
  // Convert the dates to Date objects if they are provided as strings
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Calculate the time difference in milliseconds
  const timeDiffMillis = endDateObj.getTime() - startDateObj.getTime();

  // Convert the time difference to days
  const daysDiff = Math.ceil(timeDiffMillis / (1000 * 60 * 60 * 24));

  return daysDiff < 0 ? 0 : daysDiff;
};
export const countWeekdaysBetweenDates = (
  startDate: Date,
  endDate: string
): number => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  let countWeekdays = 0;
  const dayOfWeek = startDateObj.getDay();

  // Adjust the start date to the next Monday if it's a weekend (0: Sunday, 6: Saturday)
  if (dayOfWeek === 0) {
    startDateObj.setDate(startDateObj.getDate() + 1);
  } else if (dayOfWeek === 6) {
    startDateObj.setDate(startDateObj.getDate() + (8 - dayOfWeek)); // Adjust by 2 days landing on Monday
  }

  // Calculate the number of weekdays by iterating through each day between the start and end dates
  while (startDateObj <= endDateObj) {
    // Check if the current day is a weekday (Monday to Friday)
    if (startDateObj.getDay() !== 0 && startDateObj.getDay() !== 6) {
      countWeekdays++;
    }
    startDateObj.setDate(startDateObj.getDate() + 1);
  }

  return countWeekdays;
};
export const countWeekendsBetweenDates = (
  startDate: Date,
  endDate: string
): number => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  let countWeekends = 0;
  const dayOfWeek = startDateObj.getDay();

  // Adjust the start date to the next Saturday if it's a weekday (0: Sunday, 6: Saturday)
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    startDateObj.setDate(startDateObj.getDate() + (6 - dayOfWeek));
  }

  // Calculate the number of weekends by iterating through each day between the start and end dates
  while (startDateObj <= endDateObj) {
    // Check if the current day is a weekend (Saturday or Sunday)
    if (startDateObj.getDay() === 0 || startDateObj.getDay() === 6) {
      countWeekends++;
    }
    startDateObj.setDate(startDateObj.getDate() + 1);
  }

  return countWeekends;
};
export const countWeekDayOccurenceBetweenDates = (
  startDate: Date,
  endDate: string,
  selectedDayOfWeek: number
): number => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  let countWeekends = 0;

  // Calculate encounters with selectedDayOfWeek as we iterate through days between start and end dates
  while (startDateObj <= endDateObj) {
    // Check if the current day is a weekend (Saturday or Sunday)
    if (startDateObj.getDay() === selectedDayOfWeek) {
      countWeekends++;
    }
    startDateObj.setDate(startDateObj.getDate() + 1);
  }

  return countWeekends;
};
export const countNthWeekdaysBetweenDates = (
  startDate: Date,
  endDate: string,
  dayOfWeek: number,
  nthInstance: number
) => {
  const startDateObj = new Date(startDate);
  //make sure startDate is the first day of the month
  startDateObj.setDate(1);

  const endDateObj = new Date(endDate);

  let countNthWeekdays = 0;
  let currentInstance = 0;
  // Iterate through each day between the start and end dates
  while (startDateObj <= endDateObj) {
    log(currentInstance);
    // Check if the current day is the desired weekday (0: Sunday, 1: Monday, ..., 6: Saturday)
    // if it's a new month, reset the currentInstance to 0
    if (startDateObj.getDate() === 1) currentInstance = 0;
    if (startDateObj.getDay() === dayOfWeek) {
      currentInstance++;
      if (currentInstance === nthInstance) {
        countNthWeekdays++;
        currentInstance = 0; // Reset the current instance counter for the next month
        startDateObj.setMonth(startDateObj.getMonth() + 1); // Move to the next month
        startDateObj.setDate(1); // Reset the day to the first day of the next month
        continue;
      }
    }
    startDateObj.setDate(startDateObj.getDate() + 1); // Move to the next day
  }

  return countNthWeekdays;
};
export const isDateValidInYear = (
  year: number,
  month: number,
  day: number
): boolean => {
  // Create a new Date instance with the given year, month (0-11), and day (1-31)
  const dateToCheck = new Date(year, month, day);

  // Check if the new Date instance is a valid date and has the same year, month, and day as the provided values
  return (
    dateToCheck.getFullYear() === year &&
    dateToCheck.getMonth() === month &&
    dateToCheck.getDate() === day
  );
};
export const splitLastOccurrence = (
  str: string,
  substring: string
): [string, string] => {
  const lastIndex = str.lastIndexOf(substring);

  const before = str.slice(0, lastIndex);

  const after = str.slice(lastIndex + 1);

  return [before, after];
};
export const reccurenceTypeOptionsDS = [
  { value: 'noRepeat', label: 'Dont repeat' },
  { value: 'everyday', label: 'Everyday' },
  { value: 'weekdays', label: 'Week days (mon to fri)' },
  { value: 'weekend', label: 'Weekend (sat-sun)' },
  { value: 'everyToday', label: 'Every (today)' },
  {
    value: 'everyMonth',
    label: 'Monthly on (first/second.... (today) of the month)',
  },
  {
    value: 'everyYearToday',
    label: 'Annually on (whatever date of the month today is)',
  },
];
export const reccurenceRuleParse = (
  rule: string
): { display: string; reccurenceTypeOption: string } => {
  const slicedRule = splitLastOccurrence(rule, '/');

  switch (slicedRule[1]) {
    case 'single-0': {
      return {
        display: 'Single',
        reccurenceTypeOption: reccurenceTypeOptionsDS[0].value,
      };
    }
    case 'periodic-0': {
      return {
        display: 'Daily',
        reccurenceTypeOption: reccurenceTypeOptionsDS[1].value,
      };
    }
    case 'days-of-week-0': {
      return {
        display: 'Weekly',
        reccurenceTypeOption: reccurenceTypeOptionsDS[2].value, // TODO: this has two possible values
      };
    }
    case 'monthly-nth-weekday-0': {
      return {
        display: 'Monthly',
        reccurenceTypeOption: reccurenceTypeOptionsDS[4].value,
      };
    }
    case 'yearly-on-date-0': {
      return {
        display: 'Yearly',
        reccurenceTypeOption: reccurenceTypeOptionsDS[5].value,
      };
    }
    default: {
      // Leave default case for single events?
      return {
        display: 'Single',
        reccurenceTypeOption: reccurenceTypeOptionsDS[0].value,
      };
    }
  }
};
export const isOur = (space: string): boolean => {
  const spaceName = space.split('/')?.[1];
  if (spaceName && spaceName === 'our') return true;
  return false;
};
export const copyToClipboard = (text: string) => {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    // Use navigator clipboard API if available
    return navigator.clipboard.writeText(text);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported('copy')
  ) {
    // Use document.execCommand('copy') fallback
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  } else {
    console.error('Clipboard access not supported');
    return false;
  }
};

export const spansToEvents = (
  spans: any,
  setEvents: (events: any) => void,
  selectedCalendar: null | string
) => {
  const getSpanData = (item: any) => {
    if (Object.prototype.hasOwnProperty.call(item, 'span')) {
      return item.span.instance;
    } else if (Object.prototype.hasOwnProperty.call(item, 'fuld')) {
      return item.fuld.instance;
    }
  };
  const isFullDay = (item: any) => !!item.fuld;
  const isSkip = (item: any) =>
    Object.prototype.hasOwnProperty.call(item, 'skip'); // This instance has most likely been deleted
  const newEvents: any = [];
  spans.forEach((span: any) => {
    const metaData = span.metadata[span['def-data']];
    const reccurenceRule = span.rules[span['def-rule']]?.rid;
    for (const item of span.instances) {
      if (isSkip(item.instance)) continue;
      let newEvent;
      if (isFullDay(item.instance)) {
        // NOTE: can use a unix milisecond for these start/end date params instead
        const startDate = new Date(getSpanData(item.instance));
        //params starting with _ are included in event's extendedProps (passed to <Event /> component)
        newEvent = {
          start: startDate, //js date object
          _startDate: startDate,
          _isFullday: true,
          allDay: true,
        };
      } else {
        // NOTE: can use a unix milisecond for these start/end date params instead
        const spanData = getSpanData(item.instance);
        const startDate = new Date(spanData.start);
        const endDate = new Date(spanData.end);
        // TODO: make a typescript type for events in the project
        //params starting with _ are included in event's extendedProps (passed to <Event /> component)
        newEvent = {
          start: startDate, //js date object
          end: endDate, //js date object
          _startDate: startDate,
          _endDate: endDate,
          _isFullday: false,
          allDay: false,
        };
      }
      newEvent = {
        ...newEvent,
        _spanId: span.id,
        _instanceId: item.idx,
        _calendarId: selectedCalendar,
        title: metaData.name,
        description: metaData.description,
        _color: metaData.color,
        _reccurenceRule: reccurenceRule,
      };
      newEvents.push(newEvent);
    }
  });

  setEvents(newEvents);
};

export const toUTCDateTime = (date: Date): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  return new Date(
    Date.UTC(
      year,
      month,
      day,
      hours,
      minutes + date.getTimezoneOffset(),
      seconds,
      milliseconds
    )
  );
};
export const toUTCDate = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};
