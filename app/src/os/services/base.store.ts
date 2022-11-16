import { castToSnapshot, onPatch, onSnapshot } from 'mobx-state-tree';
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
    store: any,
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

    const isEmpty =
      !this.persisted.store || Object.keys(this.persisted.store).length === 0;

    this.model = store.create(
      !isEmpty ? castToSnapshot(this.persisted.store) : defaults
    );
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
