import moment from 'moment';

export const fromNow = (time: number) => {
  const now = moment();
  const pastTime = moment(time);
  const days = pastTime.diff(now, 'days');
  const hours = pastTime.diff(now, 'hours');
  const minutes = pastTime.diff(now, 'minutes');
  if (days < 0) {
    if (days === -1) {
      return 'yesterday';
    }
    if (days > -3) {
      return moment.duration(days, 'days').humanize(true);
    }
    return pastTime.format('HH-MM-YYYY');
  }
  if (hours < 0) {
    return moment.duration(hours, 'hours').humanize(true);
  }
  if (minutes < 0) {
    return moment.duration(minutes, 'minutes').humanize(true);
  }
  return pastTime.format('HH-MM-YYYY');
};

// moment.duration(1, "minutes").humanize(); // a minute
// moment.duration(2, "minutes").humanize(); // 2 minutes
// moment.duration(24, "hours").humanize();  // a day
// moment.duration(-1, "minutes").humanize(true); // a minute ago
// moment.duration(-1, 'week').humanize(true, {d: 7, w: 4}); // a week ago
// moment.duration(-1, 'week').humanize({d: 7, w: 4}); // a week
