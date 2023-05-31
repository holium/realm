import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { RoomsStoreProvider } from 'renderer/apps/Rooms/store/RoomsStoreProvider';
// import { ConnectionStatus } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';

const ShellPresenter = () => {
  const { shellStore, authStore, loggedInAccount } = useAppState();
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

  if (!loggedInAccount) {
    return null;
  }

  return (
    <RoomsStoreProvider ourId={loggedInAccount.serverId}>
      <ViewPort>
        <Layer zIndex={2}>{DialogLayer}</Layer>
        <Desktop />
        <Layer zIndex={20}>{/* <ConnectionStatus /> */}</Layer>
        {/* TODO make DragBar work */}
        {/* <Layer zIndex={21}>{!isFullscreen && <DragBar />}</Layer> */}
      </ViewPort>
    </RoomsStoreProvider>
  );
};

export const Shell = observer(ShellPresenter);
