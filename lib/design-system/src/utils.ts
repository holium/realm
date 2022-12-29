export const getVar = (varName: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    varName
  );
  console.log('getVar', varName, value);
  return value.replace(/\s/g, '');
};

export const isImgUrl = (url: string): Promise<boolean> => {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
  });
};
