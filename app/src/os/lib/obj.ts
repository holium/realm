export const camelToSnake = (key: string) => {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
};

export const snakeify = (obj: { [key: string]: any }) => {
  const newObject: any = {};
  for (const camel in obj) {
    newObject[camelToSnake(camel)] = obj[camel];
  }
  return newObject;
};
