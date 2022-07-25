import { Urbit } from './../urbit/api';
// import { cleanNounColor } from '../lib/color';

export const GroupsApi = {
  getOur: async (conduit: Urbit, groupMetadata: any): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      conduit.subscribe({
        app: 'group-store',
        path: `/groups`,
        event: async (data: any) => {
          const host = `~${conduit.ship}`;
          if (data['groupUpdate']) {
            const ourGroupList = Object.entries(data['groupUpdate']['initial'])
              .filter(([key, group]: [key: string, group: any]) => {
                if (group.hidden) return false;
                if (key.split('/')[2] !== host) return false;
                return true;
              })
              .map(([key, ourGroup]: [key: string, ourGroup: any]) => {
                return {
                  ...ourGroup,
                  ...groupMetadata[key],
                };
              });
            resolve(ourGroupList);
          }
        },
        err: () => reject('Subscription rejected'),
        quit: () => console.log('Kicked from subscription'),
      });
    });
  },
};
