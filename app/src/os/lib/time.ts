/**
 * Returns a timestamp in the format HH:MM AM/PM.
 * @param timestamp
 */
export const displayTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minutesStr} ${ampm}`;
};

/**
 * Returns a date in the format M/D/YYYY if the date is not today or yesterday.
 * @param timestamp
 */
export const displayDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
};
