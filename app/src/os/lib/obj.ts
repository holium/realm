const camelToSnake = (key: string) => {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
};

export const snakeify = (obj: { [key: string]: any }) => {
  let newObject: any = {};
  for (var camel in obj) {
    newObject[camelToSnake(camel)] = obj[camel];
  }
  return newObject;
};
