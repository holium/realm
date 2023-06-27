import { types } from 'mobx-state-tree';

export const TroveStore = types
  .model('TroveStore', {
    update: types.optional(types.frozen(), {}),
  })
  .views((self) => ({
    get getUpdate() {
      return self.update;
    },
  }))
  .actions((self) => ({
    setUpdate(newUpdate: any) {
      self.update = newUpdate;
    },
    reset() {
      self.update = {};
    },
  }));
