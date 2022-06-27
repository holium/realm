import { Urbit } from '../../urbit/api';
import { cleanNounColor } from '../../../renderer/logic-old/utils/color';
import { ShipModelType } from '../stores/ship';

export const DocketApi = {
  getApps: async (conduit: Urbit) => {
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
    conduit: Urbit,
    metadataStore: any
  ) => {
    const { apps } = stateTree;

    const key = `${ship}/${desk}`;
    if (key in apps) {
      return apps[key];
    }
    return new Promise((resolve, reject) => {
      conduit.subscribe({
        app: 'treaty',
        path: `/treaty/${key}`,
        event: (data: any) => {
          resolve(data);
          metadataStore[key] = data;
        },
        err: () => {
          reject('Subscription rejected');
        },
        quit: () => console.log('Kicked from subscription'),
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
