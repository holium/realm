import {
  castToSnapshot,
  IAnyType,
  onPatch,
  onSnapshot,
  typecheck,
} from 'mobx-state-tree';
import Store from 'electron-store';
import { Patp } from 'os/types';

export class DiskStore {
  name: string;
  persisted: any;
  model: any;
  constructor(
    name: string,
    patp: Patp,
    secretKey: string,
    store: IAnyType,
    defaults: any = {}
  ) {
    this.name = name;
    const baseParams = {
      name,
      cwd: `realm.${patp}`, // base folder
    };

    // this.persisted =
    //   process.env.NODE_ENV === 'development'
    //     ? new Store<any>(baseParams)
    //     : new EncryptedStore<any>({
    //         secretKey,
    //         ...baseParams,
    //       });
    this.persisted = new Store<any>(baseParams);

    try {
      typecheck(store, this.persisted.store);
      // console.log(`typecheck passed: ${store.name}`);
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
