import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { ConnectionStatus } from '@holium/design-system';

import { ConduitState } from 'os/services/api';
import { useAppState } from 'renderer/stores/app.store';
import { RealmIPC } from 'renderer/stores/ipc';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';

const ShellPresenter = () => {
  const { loggedInAccount, shellStore, authStore, theme, connectionStatus } =
    useAppState();
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
    // Sync Electron with MobX state.
    if (shellStore.isIsolationMode) {
      shellStore.enableIsolationMode();
    } else {
      shellStore.disableIsolationMode();
    }
    if (session?.color) {
      shellStore.setMouseColor(session?.color);
    }
  }, [shellStore.isIsolationMode, session?.color]);

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
