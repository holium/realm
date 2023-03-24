import { TomeOptions } from './types';

/* TODO add docstring */
export const initTome = async (app?: string, options: TomeOptions = {}) => {
  return await window.electron.os.tome.initTome(app, options);
};
