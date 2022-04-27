/**
 * Gets a display date in the following format:
 *  04/07/22 05:47 AM
 *
 * @param {number} timestamp
 * @return {*}  {string}
 */
export const displayDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString('en-us', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    }) +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
};
