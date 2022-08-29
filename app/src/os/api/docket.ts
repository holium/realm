import { Conduit } from '@holium/conduit';
import { cleanNounColor } from '../lib/color';

export const DocketApi = {
  getApps: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'docket',
      path: '/charges',
    });
    const appMap = response.initial;
    Object.keys(appMap).forEach((appKey: string) => {
      const appColor = appMap[appKey].color;
      appMap[appKey].color = appColor && cleanNounColor(appColor);
    });
    return appMap;
  },
  requestTreaty: async (
    ship: string,
    desk: string,
    stateTree: any,
    conduit: Conduit,
    metadataStore: any
  ): Promise<number> => {
    const { apps } = stateTree;

    const key = `${ship}/${desk}`;
    if (key in apps) {
      return apps[key];
    }
    return new Promise((resolve, reject) => {
      conduit.watch({
        app: 'treaty',
        path: `/treaty/${key}`,
        onEvent: (data: any) => {
          resolve(data);
          metadataStore[key] = data;
        },
        onError: () => {
          reject('Subscription rejected');
        },
        onQuit: () => console.log('Kicked from subscription'),
      });
    });
    // conduit.subscribe({
    //   app: 'treaty',
    //   path: `/treaty/${key}`,
    //   event: (data: any) => {
    //     // stateTree.
    //     Object.assign(metadataStore, data['metadata-update'].associations); //.data['metadata-update'].associations;
    //   },
    //   err: () => console.log('Subscription rejected'),
    //   quit: () => console.log('Kicked from subscription'),
    // });
    // const treaty = { ...normalizeDocket(result, desk), ship };
    // set((state) => ({
    //   treaties: { ...state.treaties, [key]: treaty },
    // }));
    // return treaty;
  },
};
