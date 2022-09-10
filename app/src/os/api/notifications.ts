// import { Conduit } from '@holium/conduit';
// import { ShipModelType } from '../services/ship/models/ship';
// // var util = require('util');
// import { decToUd, unixToDa } from '@urbit/api';

// export const NotificationsApi = {
//   watch: (conduit: Conduit, shipState: ShipModelType) => {
//     conduit.watch({
//       app: 'hark-store',
//       path: '/updates',

//       onEvent: async (data: any) => {
//         console.log(`hark-store: ${util.inspect(data, false, 10, true)}`);
//         if (data.more) {
//           // shipState.notifications.initial(data.more);
//           // console.log(shipState.notifications.list);
//         }
//       },
//       onError: () => console.log('Subscription rejected'),
//       onQuit: () => console.log('Kicked from subscription'),
//     });
//   },
//   getRange: async (conduit: Conduit, timestamp: number, length: number) => {
//     const da = decToUd(unixToDa(timestamp).toString());
//     const response = await conduit.scry({
//       app: 'hark-store',
//       path: `/recent/inbox/${da}/${length}`,
//     });
//     // console.log(response);
//     return response;
//   },
//   // allStats: async (conduit: Urbit, shipState: ShipModelType) => {
//   //   const response = await conduit.scry({
//   //     app: 'hark-store',
//   //     path: `/all-stats`,
//   //   });
//   //   shipState.notifications.setAllStats(response);
//   // },
// };

// import { Conduit } from '@holium/conduit';

import bigInt from 'big-integer';
import { ShipModelType } from '../services/ship/models/ship';
import { decToUd, unixToDa, daToUnix, udToDec } from '@urbit/api';
import { Conduit } from '@holium/conduit';
import {
  RawTimeBoxType,
  RawNotificationType,
  RawNotificationBody,
  NotificationModelType,
  NotificationModel,
  NotificationStoreType,
} from '../services/ship/models/notifications';

export const NotificationApi: any = {
  allStats: async (conduit: Conduit, notifications: NotificationStoreType) => {
    const response = await conduit.scry({
      app: 'hark-store',
      path: `/all-stats`,
    });
    console.log(
      `/recent/inbox/${decToUd(unixToDa(Date.now() * 1000).toString())}/10`
    );
    // console.log(response.more[0]['all-stats']);
    notifications.setAllStats(response);
  },
  initial: async (conduit: Conduit, notifications: NotificationStoreType) => {
    const response = await conduit.scry({
      app: 'hark-store',
      path: `/recent/inbox/${decToUd(
        unixToDa(Date.now() * 1000).toString()
      )}/10`,
    });
    // console.log('notif => %o', response['more'][0].timebox.notifications);
    // notifications.setInitial(response);
    return response;
  },
  updates: (conduit: Conduit, notifications: NotificationStoreType) => {
    conduit.watch({
      app: 'hark-store',
      path: '/updates',
      onEvent: async (data: any, id?: number, mark?: string) => {
        console.log(data, mark);
        if (data['more']) {
          // console.log(
          //   'unread notifications => %o',
          //   data['more'][0].timebox.notifications[1].body[0]
          // );
          notifications.setWatchUpdate(data);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  opened: async (conduit: Conduit) => {
    // await conduit.poke({
    //   app: 'hark-store',
    //   mark: 'hark-action',
    //   json: { opened: null },
    // });
    return;
  },
  dismiss: async (conduit: Conduit, notification: NotificationModelType) => {
    // const payload = [
    //   {
    //     id: 145,
    //     action: 'poke',
    //     ship: 'lomder-librun',
    //     app: 'hark-store',
    //     mark: 'hark-action',
    //     json: {
    //       archive: {
    //         lid: { seen: null },
    //         bin: {
    //           place: {
    //             desk: 'landscape',
    //             path: '/graph/0v1.vqpmh.djee1.ef0ug.k7658.80igd',
    //           },
    //           path: '/',
    //         },
    //       },
    //     },
    //   },
    // ];
    await conduit.poke({
      app: 'hark-store',
      mark: 'hark-action',
      json: {
        archive: {
          lid: { seen: null },
          bin: {
            place: {
              desk: 'landscape',
              path: '/graph/0v1.vqpmh.djee1.ef0ug.k7658.80igd',
            },
            path: '/',
          },
        },
      },
    });
  },
  //
  archive: async (
    lid: { archive: string },
    bin: {
      place: {
        desk: string;
        path: string;
      };
      path: string;
    },
    bowl: {
      ourShip: string;
      credentials: any;
    }
  ) => {
    // ::  %archive: archive single notification
    // ::  if .time is ~, then archiving unread notification
    // ::  else, archiving read notification
    // [%archive =lid =bin]
    // const payload = {
    //   app: 'dm-hook',
    //   mark: `graph-update-3`,
    //   json: {
    //     'add-nodes': {
    //       resource: { ship: bowl.ourShip, name: 'dm-inbox' },
    //       nodes: {
    //         [post.index]: {
    //           post,
    //           children: null,
    //         },
    //       },
    //     },
    //   },
    // };
    // return await quickPoke(bowl.ourShip, payload, bowl.credentials);
  },
  // requestTreaty: async (
  //   ship: string,
  //   desk: string,
  //   stateTree: any,
  //   conduit: Urbit,
  //   metadataStore: any
  // ) => {
  //   const { apps } = stateTree;

  //   const key = `${ship}/${desk}`;
  //   if (key in apps) {
  //     return apps[key];
  //   }
  //   return new Promise((resolve, reject) => {
  //     conduit.subscribe({
  //       app: 'treaty',
  //       path: `/treaty/${key}`,
  //       event: (data: any) => {
  //         resolve(data);
  //         metadataStore[key] = data;
  //       },
  //       err: () => {
  //         reject('Subscription rejected');
  //       },
  //       quit: () => console.log('Kicked from subscription'),
  //     });
  //   });
  // },
};
