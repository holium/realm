export const isImgUrl = (url: string): Promise<boolean> => {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
  });
};

export const pluralize = (word: string, amount: number) => {
  return `${word}${amount === 1 ? '' : 's'}`;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
