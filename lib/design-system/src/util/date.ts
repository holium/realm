import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/en';
dayjs.extend(relativeTime);

export const timelineDate = (date: Date) => {
  if (dayjs(date).isSame(dayjs(), 'hour')) {
    return `${dayjs().minute() - dayjs(date).minute()}m`;
  } else if (dayjs(date).isSame(dayjs(), 'day')) {
    return dayjs(date).format('h:mm A');
  } else if (dayjs(date).isSame(dayjs(), 'week')) {
    return dayjs(date).fromNow();
  } else if (dayjs(date).isSame(dayjs(), 'year')) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } else {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const chatDate = (date: Date) => {
  if (dayjs(date).isSame(dayjs(), 'hour')) {
    return `${dayjs().minute() - dayjs(date).minute()}m`;
  } else {
    return dayjs(date).format('h:mm A');
  }
};
