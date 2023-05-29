import { useEffect, useMemo } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

// import { ConnectionStatus } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';

import { Desktop } from './desktop/Desktop';
import { DialogManager } from './dialog/DialogManager';

const ShellPresenter = () => {
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
    if (session?.color) {
      shellStore.setMouseColor(session?.color);
    }
  }, [session?.color]);

  return (
    <ViewPort>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <Desktop />
    </ViewPort>
  );
};

export const Shell = observer(ShellPresenter);
