export const pluralize = (word: string, amount: number) => {
  return `${word}${amount === 1 ? '' : 's'}`;
};
