import { TomeOptions } from '../../../app/src/tome/types';

/* TODO add docstring */
export const initTome = async (
  urbit: boolean = false,
  app?: string,
  options: TomeOptions = {}
) => {
  return await window.electron.tome.initTome(urbit, app, options);
};
