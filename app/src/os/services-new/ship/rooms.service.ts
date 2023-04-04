import AbstractService, { ServiceOptions } from '../abstract.service';
import log from 'electron-log';
import APIConnection from '../conduit';
import { PokeParams, Scry } from '@holium/conduit/src/types';

export class RoomsService extends AbstractService {
  constructor(options?: ServiceOptions) {
    super('roomsService', options);
    if (options?.preload) {
      return;
    }
    APIConnection.getInstance().conduit.watch({
      app: 'rooms-v2',
      path: '/lib',
      onEvent: async (data, _id, mark) => {
        this.sendUpdate({ mark, data });
      },
      onError: () => console.log('rooms subscription rejected'),
      onQuit: () => {
        console.log('Kicked from rooms subscription');
      },
    });
  }
  public poke(payload: PokeParams) {
    return APIConnection.getInstance().conduit.poke(payload);
  }
  public scry(payload: Scry) {
    return APIConnection.getInstance().conduit.scry(payload);
  }
}

export default RoomsService;

// Generate preload
export const roomsPreload = RoomsService.preload(
  new RoomsService({ preload: true })
);
