export const formPathObj = (path: string) => {
  const pathArr = path.split('/');
  return {
    ship: pathArr[1],
    space: pathArr[2],
  };
};

export const pathToObj = (path: string) => {
  const pathArr = path.split('/');
  return {
    ship: pathArr[1],
    space: pathArr[2],
  };
};
