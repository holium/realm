import { Urbit } from '../urbit/api';

export const SpacesDemoApi = {
  getSpaces: async (conduit: Urbit) => {
    const response = await conduit.scry({
      app: 'spaces-demo',
      path: '/spaces',
    });
    return response;
  },
  createSpace: async (conduit: Urbit, data?: any) => {
    const response = await conduit.sendAction(data);
    return response;
  },
  subscribe: async (conduit: Urbit, onEffect: (effect: any) => any) => {
    conduit.subscribe({
      app: 'spaces-demo',
      path: '/http-response',
      event: (data: any) => {
        console.log('we are here,', data);
        onEffect(data);
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
  // syncGraphMetadata: async (conduit: Urbit, metadataStore: any) => {
  //   conduit.subscribe({
  //     app: 'metadata-store',
  //     path: '/app-name/graph',
  //     event: (data: any) => {
  //       if (data['metadata-update'] && data['metadata-update'].associations) {
  //         Object.assign(
  //           metadataStore['graph'],
  //           data['metadata-update'].associations
  //         );
  //       }
  //     },
  //     err: () => console.log('Subscription rejected'),
  //     quit: () => console.log('Kicked from subscription'),
  //   });
  // },
};

// const sample = {
//   app: 'realm',
//   path: '/spaces/api/actions',
//   body: {
//     action: 'create-space',
//     resource: 'spaces',
//     //  to create a top-level (parent) space, make sure context is empty
//     context: {
//       // to create a child-space, include a "parentSpaceId"
//       // [optional] "parentSpaceId": "parent-space-id"
//     },
//     data: {
//       path: 'the-swolesome-fund',
//       name: 'The Swolesome Fund',
//       color: '#FF0101',
//       type: 'group',
//       picture:
//         'https://archiv.nyc3.digitaloceanspaces.com/littel-wolfur/2022.2.13..05.27.08-jacked.png',
//       theme: {
//         themeId: 'the-swolesome-fund',
//         backgroundColor: '#c4c3bf',
//         dockColor: '#f5f5f4',
//         iconColor: 'rgba(95,94,88,0.5)',
//         textColor: '#2a2927',
//         textTheme: 'light',
//         wallpaper:
//           'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=100',
//         windowColor: '#f5f5f4',
//       },
//       apps: {
//         pinned: [],
//         endorsed: {},
//         installed: {},
//       },
//     },
//   },
// };
