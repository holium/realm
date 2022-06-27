import { ThemeModel } from '../theme/store';
import { EventEmitter } from 'stream';

import Store from 'electron-store';
import {
  onSnapshot,
  onPatch,
  castToSnapshot,
  getSnapshot,
  destroy,
} from 'mobx-state-tree';
import { SpacesStore, SpacesStoreType } from './stores/spaces';
import { Conduit } from '../conduit';
import { Urbit } from '../urbit/api';
import { SpacesApi } from './api/spaces';
import { quickPoke } from '../lib/poke';

/**
 * SpaceManager: Realm has the concept of spaces. A space is a context in which
 * you are computing. A space can be your space (ie. your ship) or a space can be
 * a community space (ie. your group).
 *
 *
 * V1: Only the ship space
 * V2: Group/DAO and ship spaces
 * V3: Interspace
 */
export class SpaceManager extends EventEmitter {
  ship: string = '';
  private conduit?: Urbit;
  private localStore?: Store<SpacesStoreType>;
  private spacesStore?: SpacesStoreType;

  constructor() {
    super();

    this.onEffect = this.onEffect.bind(this);
  }

  /**
   * Connects to a ship to start syncing data
   *
   * @param conduit
   * @param ship
   * @param shipInfo
   */
  subscribe(conduit: Urbit, ship: string, shipInfo: any) {
    this.ship = ship;
    this.conduit = conduit;
    this.localStore = new Store<SpacesStoreType>({
      name: `space.manager.${ship}`,
      accessPropertiesByDotNotation: true,
    });
    let persistedState: SpacesStoreType = this.localStore.store;

    // this.spacesStore = SpacesStore.create({
    //   our: persistedState.our
    //     ? castToSnapshot(persistedState.our)
    //     : {
    //         path: `${ship}/our`,
    //         name: ship,
    //         type: 'our',
    //         theme: ThemeModel.create({ themeId: `${ship}/our` }),
    //       },
    //   spaces: persistedState.spaces || [],
    // });

    // onSnapshot(this.spacesStore, (snapshot: any) => {
    //   this.localStore!.store = snapshot;
    // });

    // onPatch(this.spacesStore, (patch) => {
    //   const patchEffect = {
    //     patch,
    //     resource: 'spaces',
    //     key: this.ship,
    //     response: 'patch',
    //   };
    //   this.onEffect(patchEffect);
    // });

    // // SpacesApi.initial(this.conduit, this.spacesStore);
    // SpacesApi.initial(this.conduit, this.spacesStore);

    // const syncEffect = {
    //   model: getSnapshot(this.spacesStore!),
    //   resource: 'spaces',
    //   key: this.ship,
    //   response: 'initial',
    // };
    // // console.log(syncEffect);
    // this.onEffect(syncEffect);
  }

  onEffect(data: any) {
    this.emit('on-effect', data);
  }
}
