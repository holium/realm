import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

// import { ConnectionStatus } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';

const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name);

const ShellPresenter = () => {
  const { settingsStore } = useShipStore();
  const { shellStore, authStore } = useAppState();
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
  ]);

  return (
    <ViewPort>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <Desktop />
    </ViewPort>
  );
};

export const Shell = observer(ShellPresenter);
