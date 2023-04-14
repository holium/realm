import APIConnection from 'os/services-new/conduit';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { UqbarApi } from 'os/api/uqbar';

export class WalletService extends AbstractService {
  constructor(options?: ServiceOptions) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    // APIConnection.getInstance().conduit.watch({
    //   app: 'rooms-v2',
    //   path: '/lib',
    //   onEvent: async (data, _id, mark) => {
    //     this.sendUpdate({ mark, data });
    //   },
    //   onError: () => console.log('rooms subscription rejected'),
    //   onQuit: () => {
    //     console.log('Kicked from rooms subscription');
    //   },
    // });
  }
  // public poke(payload: PokeParams) {
  //   return APIConnection.getInstance().conduit.poke(payload);
  // }
  // public scry(payload: Scry) {
  //   console.log('scry', payload);
  //   return APIConnection.getInstance().conduit.scry(payload);
  // }

  async uqbarDeskExists(_evt: any) {
    return await UqbarApi.uqbarDeskExists(APIConnection.getInstance().conduit);
  }
}

export default WalletService;

// Generate preload
export const walletPreload = WalletService.preload(
  new WalletService({ preload: true })
);
