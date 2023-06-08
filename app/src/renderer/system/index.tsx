import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { RoomsStoreProvider } from 'renderer/apps/Rooms/store/RoomsStoreProvider';
// import { ConnectionStatus } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';
// import { RealmTitlebar } from './Titlebar';

const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name);

const ShellPresenter = () => {
  const { settingsStore } = useShipStore();
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

  if (!loggedInAccount) {
    return null;
  }

  return (
    <RoomsStoreProvider ourId={loggedInAccount.serverId}>
      <ViewPort>
        {/* {showTitleBar && <RealmTitlebar />} */}
        <Layer zIndex={2}>{DialogLayer}</Layer>
        <Desktop />
        <Layer zIndex={20}>{/* <ConnectionStatus /> */}</Layer>
      </ViewPort>
    </RoomsStoreProvider>
  );
};

export const Shell = observer(ShellPresenter);
