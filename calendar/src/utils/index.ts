import memoize from 'lodash/memoize';

const isDev = () => true;

export const shipName = memoize(() => {
  return 'lux';
});
export const shipCode = memoize(() => {
  return 'hidmeg-donfep-pagtyd-witfur';
});
export const shipURI = memoize(() => {
  return 'http://localhost:8008';
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
export const toUTCDate = (date: Date): Date => {
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
