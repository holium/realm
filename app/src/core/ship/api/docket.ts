import { Urbit } from './../../urbit/api';
import { cleanNounColor } from '../../../renderer/logic/utils/color';
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
  // updates: (conduit: Urbit, shipState: ShipModelType) => {
  //   conduit.subscribe({
  //     app: 'docket',
  //     path: '/updates',
  //     event: (data: any) => {
  //       console.log('incoming-data', data);
  //       if (data['dm-hook-action']) {
  //         const [action, payload] = Object.entries<any>(
  //           data['dm-hook-action']
  //         )[0];
  //         switch (action) {
  //           case 'pendings':
  //             const pendings: string[] = payload;
  //             shipState.chat.setPendingDms(pendings);
  //             break;
  //           case 'screen':
  //             console.log('screen set');
  //             break;
  //           default:
  //             console.log('action', action);
  //             break;
  //         }
  //       }
  //     },
  //     err: () => console.log('Subscription rejected'),
  //     quit: () => console.log('Kicked from subscription'),
  //   });
  // },
};
