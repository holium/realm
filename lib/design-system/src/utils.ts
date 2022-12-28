export const getVar = (varName: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    varName
  );

  return value.replace(/\s/g, '');
};
