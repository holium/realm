import Urbit from '@urbit/http-api';
import { TomeOptions } from '../../../../app/src/tome/pkg/types';

export const initTome = async (
  api?: Urbit,
  app?: string,
  options: TomeOptions = {}
) => {
  return await window.electron.tome.initTome(api, app, options);
};
