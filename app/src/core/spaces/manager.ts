import { ipcMain, ipcRenderer } from 'electron';
import { EventEmitter } from 'stream';
import isDev from 'electron-is-dev';
import { types, Instance, flow } from 'mobx-state-tree';
import { SpaceStore, SpaceStoreType } from './model';
import { Conduit } from '../conduit';

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
  private mst: SpaceStoreType;
  private conduit: Conduit;

  constructor(conduit: Conduit) {
    super();
    this.mst = SpaceStore.create({ apps: [], pinned: [] });
    this.conduit = conduit;
    this.onEffect = this.onEffect.bind(this);
  }

  initialize() {
    // this.conduit.initialize('docket', '/charges', this.onEffect);
  }

  onEffect(data: any) {
    // console.log(data);
    this.emit('on-effect', data);
  }
}
