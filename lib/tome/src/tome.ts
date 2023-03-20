import { TomeOptions } from './types';

/* TODO add docstring */
export const initTome = async (
  urbit: boolean = false,
  app?: string,
  options: TomeOptions = {}
) => {
  return await window.electron.os.tome.initTome(urbit, app, options);
};
