import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { ConnectionStatus } from '@holium/design-system';

import { ConduitState } from 'os/services/api';
import { useAppState } from 'renderer/stores/app.store';
import { RealmIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';

const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name);

const ShellPresenter = () => {
  const { loggedInAccount, shellStore, authStore, theme, connectionStatus } =
    useAppState();
  const { settingsStore } = useShipStore();
  const { session } = authStore;

  const DialogLayer = useMemo(
    () => (
      <DialogManager
        dialogId={shellStore.dialogId}
        dialogProps={shellStore.dialogProps}
      />
    ),
    [shellStore.dialogId, shellStore.dialogProps]
  );

  useEffect(() => {
    const mouseRgba = getCssVar('--rlm-mouse-color');

    // Sync mouse layer. Wait for a bit to make sure it is mounted.
    setTimeout(() => {
      if (settingsStore.profileColorForCursorEnabled) {
        window.electron.app.setMouseColor(session?.color ?? '#4E9EFD');
      } else {
        window.electron.app.setMouseColor(mouseRgba ?? '#4E9EFD');
      }
    }, 500);
  }, [
    session?.color,
    settingsStore.realmCursorEnabled,
    settingsStore.profileColorForCursorEnabled,
    loggedInAccount?.serverId, // For switching ships with different settings.
  ]);

  return (
    <ViewPort>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <Desktop />
      <Layer zIndex={20}>
        <ConnectionStatus
          serverId={loggedInAccount?.serverId || ''}
          themeMode={theme.mode as 'light' | 'dark'}
          status={connectionStatus as ConduitState}
          onReconnect={() => {
            console.log('reconnect');
            RealmIPC.reconnectConduit();
          }}
          onSendBugReport={() => {
            console.log('send bug report');
          }}
        />
      </Layer>
      {/* TODO make DragBar work */}
      {/* <Layer zIndex={21}>{!isFullscreen && <DragBar />}</Layer> */}
    </ViewPort>
  );
};

export const Shell = observer(ShellPresenter);
