import { Conduit } from '@holium/conduit';
import { Patp } from 'os/types';

export const CourierApi = {
  getDMList: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms`,
    });
    return response['inbox'];
  },
  getDMLog: async (to: Patp, conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'courier',
      path: `/dms/${to}`,
    });
    return response['dm-log'];
  },
};
