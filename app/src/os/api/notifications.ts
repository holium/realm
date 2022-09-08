import { Conduit } from '@holium/conduit';
import { ShipModelType } from '../services/ship/models/ship';
// var util = require('util');
import { decToUd, unixToDa } from '@urbit/api';

export const NotificationsApi = {
  watch: (conduit: Conduit, shipState: ShipModelType) => {
    conduit.watch({
      app: 'hark-store',
      path: '/updates',

      onEvent: async (data: any) => {
        console.log(`hark-store: ${util.inspect(data, false, 10, true)}`);
        if (data.more) {
          // shipState.notifications.initial(data.more);
          // console.log(shipState.notifications.list);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  getRange: async (conduit: Conduit, timestamp: number, length: number) => {
    const da = decToUd(unixToDa(timestamp).toString());
    const response = await conduit.scry({
      app: 'hark-store',
      path: `/recent/inbox/${da}/${length}`,
    });
    // console.log(response);
    return response;
  },
  // allStats: async (conduit: Urbit, shipState: ShipModelType) => {
  //   const response = await conduit.scry({
  //     app: 'hark-store',
  //     path: `/all-stats`,
  //   });
  //   shipState.notifications.setAllStats(response);
  // },
};
