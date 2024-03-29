import memoize from 'lodash/memoize';

export const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export const shipName = memoize(() => {
  //TODO: use realm data here
  return '';
});
export const shipCode = memoize(() => {
  //TODO: use realm data here
  return 'hidmeg-donfep-pagtyd-witfur';
});
export const shipURI = memoize(() => {
  //TODO: use realm data here
  return 'http://localhost:8545';
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
  return formatDate(date, { long: false, dayOnly: false });
};
