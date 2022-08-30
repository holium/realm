import moment from 'moment';

export const fromNow = (time: number) => {
  const now = moment();
  const pastTime = moment(time);
  const days = pastTime.diff(now, 'days');
  const hours = pastTime.diff(now, 'hours');
  const minutes = pastTime.diff(now, 'minutes');
  // console.log(days, hours, minutes);
  if (days < 0) {
    if (days === -1) {
      return 'yesterday';
    }
    if (days > -3) {
      return moment.duration(days, 'days').humanize(true);
    }
    return pastTime.format('MM-DD-YYYY');
  }
  if (hours < 0) {
    return moment.duration(hours, 'hours').humanize(true);
  }
  if (minutes < 0) {
    return moment.duration(minutes, 'minutes').humanize(true);
  }
  const seconds = pastTime.diff(now, 'seconds');
  return moment.duration(seconds, 'seconds').humanize(true);
};
