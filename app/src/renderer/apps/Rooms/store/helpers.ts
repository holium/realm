export const serialize = (data: any) => {
  return JSON.stringify(data);
};

export const unserialize = (data: string) => {
  try {
    return JSON.parse(data.toString());
  } catch (e) {
    return undefined;
  }
};
