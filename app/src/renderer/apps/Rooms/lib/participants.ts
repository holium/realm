export const getParticipantCount = (count: number) => {
  if (count === 0 || count === undefined) {
    return 1;
  }
  return count;
};
