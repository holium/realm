import { ipcMain, session, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
  applySnapshot,
} from 'mobx-state-tree';

import Realm from '../..';
import { BaseService } from '../base.service';
import { OnboardingStore, OnboardingStoreType } from './onboarding.model';

export class OnboardingService extends BaseService {
  private db?: Store<OnboardingStoreType>; // for persistance
  private state?: OnboardingStoreType; // for state management

  handlers = {
    'realm.onboarding.agreedToDisclaimer': this.agreedToDisclaimer,
    'realm.onboarding.selfHosted': this.setSelfHosted,
    'realm.onboarding.clear': this.clear
  }

  static preload = {
    clear() {
      return ipcRenderer.invoke('realm.onboarding.clear');
    },

    agreedToDisclaimer() {
      return ipcRenderer.invoke('realm.onboarding.agreedToDisclaimer');
    },

    setSelfHosted(selfHosted: boolean) {
      return ipcRenderer.invoke('realm.onboarding.selfHosted', selfHosted);
    }
  }

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });
  }

  async load(patp: string, mouseColor: string) {
    this.db = new Store({
      name: `realm.onboarding.${patp}`,
      accessPropertiesByDotNotation: true,
    });

    let persistedState: OnboardingStoreType = this.db.store;
    this.state = OnboardingStore.create(castToSnapshot(persistedState));

    onSnapshot(this.state, (snapshot) => {
      this.db!.store = castToSnapshot(snapshot);
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'desktop',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });
  }

  clear() {
    this.state?.clear();
  }

  agreedToDisclaimer() {
    this.state?.agreedToDisclaimer();
  }

  setSelfHosted(selfHosted: boolean) {
    this.state?.setSelfHosted(selfHosted);
  }
}
