import log from 'electron-log';

import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection, PokeParams, Scry } from '../api';

export class RoomsService extends AbstractService<any> {
  constructor(options?: ServiceOptions) {
    super('roomsService', options);
    if (options?.preload) {
      return;
    }
    APIConnection.getInstance().conduit.watch({
      app: 'rooms-v2',
      path: '/lib',
      onEvent: async (data, _id, mark) => {
        const event = Object.keys(data)[0];
        this.sendUpdate({ mark, type: event, payload: data[event] });
      },
      onError: () => console.log('rooms subscription rejected'),
      onQuit: () => {
        console.log('Kicked from rooms subscription');
      },
    });

    if (options?.verbose) {
      log.info('rooms.service.ts:', 'Constructed.');
    }
  }
  public poke(payload: PokeParams) {
    return APIConnection.getInstance().conduit.poke(payload);
  }
  public scry(payload: Scry) {
    return APIConnection.getInstance().conduit.scry(payload);
  }
  public setProvider(provider: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'rooms-v2',
      mark: 'rooms-v2-session-action',
      json: {
        'set-provider': provider,
      },
    });
  }
  async getSession(): Promise<void> {
    try {
      const response = await this.scry({
        app: 'rooms-v2',
        path: '/session',
      });
      return response.session;
    } catch (e) {
      console.error(e);
    }
  }
}

export default RoomsService;

// Generate preload
export const roomsPreload = RoomsService.preload(
  new RoomsService({ preload: true })
);
