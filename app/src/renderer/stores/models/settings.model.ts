import { applySnapshot, flow, types } from 'mobx-state-tree';

import { Setting } from 'os/services/ship/settings.service';

import { SettingsIPC } from '../ipc';

export const SettingsModel = types
  .model({
    identity: types.string,
    isolationModeEnabled: types.boolean,
    realmCursorEnabled: types.boolean,
    profileColorForCursorEnabled: types.boolean,
  })
  .actions((self) => ({
    init: flow(function* (identity: string) {
      try {
        const setting: Setting = yield SettingsIPC.get(identity);

        if (!setting) {
          self.identity = identity;
          self.isolationModeEnabled = false;
          self.realmCursorEnabled = true;
          self.profileColorForCursorEnabled = true;
          return;
        } else {
          self.identity = setting.identity;
          self.isolationModeEnabled = Boolean(setting.isolationModeEnabled);
          self.realmCursorEnabled = Boolean(setting.realmCursorEnabled);
          self.profileColorForCursorEnabled = Boolean(
            setting.profileColorForCursorEnabled
          );

          // Sync Electron isolation mode with settings.
          if (self.isolationModeEnabled) {
            window.electron.app.enableIsolationMode();
          } else {
            window.electron.app.disableIsolationMode();
          }

          if (self.realmCursorEnabled) {
            // Don't refresh since CSS has already been injected.
            window.electron.app.enableRealmCursor();
          } else {
            window.electron.app.disableRealmCursor();
          }
        }
      } catch (error) {
        console.error(error);
      }
    }),
    _getCurrentSettings() {
      return {
        identity: self.identity,
        isolationModeEnabled: self.isolationModeEnabled ? 1 : 0,
        realmCursorEnabled: self.realmCursorEnabled ? 1 : 0,
        profileColorForCursorEnabled: self.profileColorForCursorEnabled ? 1 : 0,
      };
    },
    toggleIsolationMode() {
      const newIsolationModeEnabled = !self.isolationModeEnabled;
      self.isolationModeEnabled = newIsolationModeEnabled;

      SettingsIPC.set({
        ...this._getCurrentSettings(),
        isolationModeEnabled: newIsolationModeEnabled ? 1 : 0,
      });

      if (newIsolationModeEnabled) {
        window.electron.app.enableIsolationMode();
      } else {
        window.electron.app.disableIsolationMode();
      }
    },
    setRealmCursor(enabled: boolean) {
      self.realmCursorEnabled = enabled;

      SettingsIPC.set({
        ...this._getCurrentSettings(),
        realmCursorEnabled: enabled ? 1 : 0,
      });

      if (enabled) {
        // Refresh since CSS has not been injected yet.
        window.electron.app.enableRealmCursor(true);
      } else {
        window.electron.app.disableRealmCursor(true);
      }
    },
    setProfileColorForCursor(enabled: boolean) {
      self.profileColorForCursorEnabled = enabled;

      SettingsIPC.set({
        ...this._getCurrentSettings(),
        profileColorForCursorEnabled: enabled ? 1 : 0,
      });
    },
    reset() {
      applySnapshot(self, {
        identity: '',
        isolationModeEnabled: false,
        realmCursorEnabled: true,
        profileColorForCursorEnabled: true,
      });
    },
  }));
