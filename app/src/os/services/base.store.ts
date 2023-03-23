import {
  applySnapshot,
  castToSnapshot,
  getSnapshot,
  IAnyType,
  onPatch,
  onSnapshot,
  typecheck,
} from 'mobx-state-tree';
import Store from 'electron-store';
import { Patp } from '../types';

export class DiskStore {
  name: string;
  persisted: any;
  model: any;
  defaults: any;
  store: IAnyType;
  constructor(
    name: string,
    patp: Patp,
    _secretKey: string | null,
    store: IAnyType,
    defaults: any = {}
  ) {
    this.name = name;
    this.defaults = defaults;
    this.store = store;
    const baseParams = {
      name,
      cwd: `realm.${patp}`, // base folder
      defaults,
      accessPropertiesByDotNotation: true,
    };

    this.persisted = new Store<typeof store>(baseParams);
    // this.persisted =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store<any>(baseParams)
    //     : new EncryptedStore<any>({
    //         secretKey,
    //         ...baseParams,
    //       });

    try {
      typecheck(store, this.persisted.store);
      console.log(`typecheck passed: ${store.name}`);
      this.model = store.create(castToSnapshot(this.persisted.store));
    } catch (err) {
      console.error(`typecheck failed: ${store.name} rebuilding...`);
      this.model = store.create(defaults);
    }

    // autosave snapshots
    onSnapshot(this.model, (snapshot) => {
      this.persisted.store = castToSnapshot(snapshot);
    });
  }

  get state() {
    return this.persisted.store;
  }

  initialUpdate(onEffect: (patch: any) => void) {
    const patchEffect = {
      model: getSnapshot(this.model),
      resource: this.name,
      response: 'initial',
    };

    onEffect(patchEffect);
  }

  resetToDefaults() {
    applySnapshot(this.model, this.defaults);
  }

  registerPatches(onEffect: (patch: any) => void) {
    onPatch(this.model, (patch) => {
      const patchEffect = {
        patch,
        resource: this.name,
        response: 'patch',
      };
      onEffect(patchEffect);
    });
  }
}
