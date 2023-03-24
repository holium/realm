import { TomeOptions } from './types';
import { Tome } from '../../../app/src/os/services/tomedb/models/tomedb';

/* TODO add docstring */
export const initTome = async (
  app?: string,
  options: TomeOptions = {}
): Promise<Tome> => {
  return await window.electron.os.tomedb.initTome(app, options);
};
