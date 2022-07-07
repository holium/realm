import { clear } from 'console';
import {
  detach,
  flow,
  Instance,
  types,
  applySnapshot,
  castToSnapshot,
} from 'mobx-state-tree';

export const OnboardingStore = types
  .model({
    agreedToDisclaimer: false,
    selfHosted: false
  })
  .actions((self) => ({

    agreedToDisclaimer() {
      self.agreedToDisclaimer = true;
    },

    setSelfHosted(selfHosted: boolean) {
      self.selfHosted = selfHosted;
    },

    clear() {
      applySnapshot(self, {})
    }
  }))

export type OnboardingStoreType = Instance<typeof OnboardingStore>
