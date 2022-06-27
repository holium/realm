import { Urbit } from '../../urbit/api';
import { SpacesStoreType } from '../stores/spaces';

export const SpacesApi = {
  initial: async (conduit: Urbit, spacesStore: SpacesStoreType) => {
    const response = await conduit.scry({
      app: 'spaces-demo',
      path: '/spaces',
    });
    // console.log(response);
    spacesStore.setInitial(response);
    // spacesStore.initialize()
    // console.log(response);
    return response;
  },
  createSpace: async (
    conduit: Urbit,
    spacesStore: SpacesStoreType,
    ourShip: string,
    body: any
  ) => {
    const response = await conduit.sendAction({
      app: 'realm/spaces',
      path: '/api/actions',
      body: {
        action: 'create-space',
        resource: 'spaces',
        context: {},
        data: body,
      },
    });
    return response;
  },
  createSubspace: async (
    conduit: Urbit,
    spacesStore: SpacesStoreType,
    body: any
  ) => {},
  deleteSpace: async (
    conduit: Urbit,
    spacesStore: SpacesStoreType,
    spaceId: any
  ) => {
    const response = await conduit.sendAction({
      app: 'realm/spaces',
      path: '/api/actions',
      body: {
        action: 'delete-space',
        resource: 'spaces',
        context: {
          spaceId,
        },
      },
    });
    return response;
  },
  // syncGroupMetadata: async (
  //   conduit: Urbit,
  //   metadataStore: { [key: string]: any }
  // ) => {
  // conduit.subscribe({
  //   app: 'metadata-store',
  //   path: '/app-name/groups',
  //   event: (data: any) => {
  //     // stateTree.
  //     Object.assign(metadataStore, data['metadata-update'].associations); //.data['metadata-update'].associations;
  //   },
  //   err: () => console.log('Subscription rejected'),
  //   quit: () => console.log('Kicked from subscription'),
  // });
  // },
  // syncGraphMetadata: async (conduit: Urbit, metadataStore: any) => {
  //   conduit.subscribe({
  //     app: 'metadata-store',
  //     path: '/app-name/graph',
  //     event: (data: any) => {
  //       // stateTree.
  //       Object.assign(metadataStore, data['metadata-update'].associations); //.data['metadata-update'].associations;
  //     },
  //     err: () => console.log('Subscription rejected'),
  //     quit: () => console.log('Kicked from subscription'),
  //   });
  // },
};

// await conduit.sendAction({
//   app: 'realm/spaces',
//   path: '/api/actions',
//   body: {
//     action: 'edit-space',
//     resource: 'spaces',
//     context: {
//       spaceId: 'space-1656073293331',
//     },
//     data: {
//       name: '~fes',
//       type: 'our',
//       picture: null,
//       theme: {
//         backgroundColor: '#c4c3bf',
//         dockColor: '#f5f5f4',
//         iconColor: 'rgba(95,94,88,0.5)',
//         mouseColor: '#d00b0b',
//         textColor: '#2a2927',
//         textTheme: 'light',
//         wallpaper:
//           'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
//         windowColor: '#f5f5f4',
//       },
//       apps: {
//         pinned: ['ballot'],
//         endorsed: [],
//         installed: {
//           realm: {
//             id: 'realm',
//             title: 'Realm',
//             info: 'A desktop environment for DAOs and communities. Developed by Holium.',
//             color: '#cebef0',
//             type: 'urbit',
//             image: null,
//             href: {
//               glob: {
//                 base: 'realm',
//                 'glob-reference': {
//                   location: {
//                     ames: '~zod',
//                   },
//                   hash: '0v0',
//                 },
//               },
//             },
//             version: '0.1.0',
//             website: 'https://holium.com',
//             license: 'MIT',
//           },
//           playground: {
//             id: 'playground',
//             title: 'Playground',
//             info: 'A simple app that can be used to test various feature injection through an Urbit AppWindow.',
//             color: '#2e4347',
//             type: 'urbit',
//             image: null,
//             href: {
//               glob: {
//                 base: 'playground',
//                 'glob-reference': {
//                   location: {
//                     http: 'https://bootstrap.urbit.org/glob-0v5.hurm4.ejod5.ngg9h.iub9i.n1j7o.glob',
//                   },
//                   hash: '0v5.hurm4.ejod5.ngg9h.iub9i.n1j7o',
//                 },
//               },
//             },
//             version: '0.0.1',
//             website: 'https://github.com/holium/realm/playground',
//             license: 'MIT',
//           },
//           webterm: {
//             id: 'webterm',
//             title: 'Terminal',
//             info: "A web interface to your Urbit's command line.",
//             color: '#2e4347',
//             type: 'urbit',
//             image: null,
//             href: {
//               glob: {
//                 base: 'webterm',
//                 'glob-reference': {
//                   location: {
//                     http: 'https://bootstrap.urbit.org/glob-0v7.1hgb7.euged.6oj3e.cdhdg.rah02.glob',
//                   },
//                   hash: '0v7.1hgb7.euged.6oj3e.cdhdg.rah02',
//                 },
//               },
//             },
//             version: '1.0.1',
//             website: 'https://tlon.io',
//             license: 'MIT',
//           },
//           landscape: {
//             id: 'landscape',
//             title: 'Groups',
//             info: 'A suite of applications to communicate on Urbit',
//             color: '#ee5432',
//             type: 'urbit',
//             image: null,
//             href: {
//               glob: {
//                 base: 'landscape',
//                 'glob-reference': {
//                   location: {
//                     http: 'https://bootstrap.urbit.org/glob-0v7.bmftr.90ktq.cma0h.da190.bs8b1.glob',
//                   },
//                   hash: '0v7.bmftr.90ktq.cma0h.da190.bs8b1',
//                 },
//               },
//             },
//             version: '1.0.11',
//             website: 'https://tlon.io',
//             license: 'MIT',
//           },
//           bitcoin: {
//             id: 'bitcoin',
//             title: 'Bitcoin',
//             info: 'A Bitcoin Wallet that lets you send and receive Bitcoin directly to and from other Urbit users',
//             color: '#f98e40',
//             type: 'urbit',
//             image:
//               'https://urbit.ewr1.vultrobjects.com/hastuc-dibtux/2021.8.24..02.57.38-bitcoin.svg',
//             href: {
//               glob: {
//                 base: 'bitcoin',
//                 'glob-reference': {
//                   location: {
//                     http: 'https://bootstrap.urbit.org/glob-0v3.7b5q1.gn30e.cpfem.abmqg.qh77v.glob',
//                   },
//                   hash: '0v3.7b5q1.gn30e.cpfem.abmqg.qh77v',
//                 },
//               },
//             },
//             version: '0.0.1',
//             website: 'https://tlon.io',
//             license: 'MIT',
//           },
//         },
//       },
//       permissions: {
//         'update-space-theme': ['owner', 'admin'],
//         'add-person': ['owner', 'admin'],
//         'kick-person': ['owner', 'admin'],
//       },
//       token: null,
//     },
//   },
// });
