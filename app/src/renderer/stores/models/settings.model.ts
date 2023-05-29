import { applySnapshot, flow, types } from 'mobx-state-tree';

import { Setting } from 'os/services/ship/settings.service';

import { SettingsIPC } from '../ipc';

export const SettingsModel = types
  .model({
    identity: types.string,
    isolationModeEnabled: types.boolean,
    realmCursorEnabled: types.boolean,
  })
  .actions((self) => ({
    init: flow(function* (identity: string) {
      try {
        const setting: Setting = yield SettingsIPC.get(identity);

        if (!setting) {
          self.identity = identity;
          self.isolationModeEnabled = false;
          self.realmCursorEnabled = true;
          return;
        } else {
          self.identity = setting.identity;
          self.isolationModeEnabled = Boolean(setting.isolationModeEnabled);
          self.realmCursorEnabled = Boolean(setting.realmCursorEnabled);

          // Sync Electron isolation mode with settings.
          if (self.isolationModeEnabled) {
            window.electron.app.enableIsolationMode();
          } else {
            window.electron.app.disableIsolationMode();
          }
        }
      } catch (error) {
        console.error(error);
      }
    }),
    toggleIsolationMode() {
      const newIsolationModeEnabled = !self.isolationModeEnabled;
      self.isolationModeEnabled = newIsolationModeEnabled;

      if (newIsolationModeEnabled) {
        window.electron.app.enableIsolationMode();
      } else {
        window.electron.app.disableIsolationMode();
      }

      SettingsIPC.set({
        identity: self.identity,
        isolationModeEnabled: newIsolationModeEnabled ? 1 : 0,
        realmCursorEnabled: self.realmCursorEnabled ? 1 : 0,
      });
    },
    toggleRealmCursor() {
      const newRealmCursorEnabled = !self.realmCursorEnabled;
      self.realmCursorEnabled = newRealmCursorEnabled;

      SettingsIPC.set({
        identity: self.identity,
        realmCursorEnabled: newRealmCursorEnabled ? 1 : 0,
        isolationModeEnabled: self.isolationModeEnabled ? 1 : 0,
      });
    },
    reset() {
      applySnapshot(self, {
        identity: '',
        isolationModeEnabled: false,
        realmCursorEnabled: false,
      });
    },
  }));
