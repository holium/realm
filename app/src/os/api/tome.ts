import { Conduit } from '@holium/conduit';
import { Patp } from 'os/types';

export const TomeApi = {
  initTome: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string
  ) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: 'tome',
        mark: 'tome-action',
        json: {
          'init-tome': {
            ship,
            space,
            app,
          },
        },
        onSuccess: (id: number) => {
          resolve(id);
        },
        onError: (e: any) => {
          reject(
            `Tome: Initializing Tome on ship ${ship} failed.  Make sure the ship and Tome agent are both running.\nError: ${e}`
          );
        },
      });
    });
  },
};
