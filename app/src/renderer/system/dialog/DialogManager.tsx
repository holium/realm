import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { getCenteredPosition } from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';

import { AppWindow } from '../desktop/components/AppWindow/AppWindow';

interface DialogManagerProps {
  dialogId?: string;
  dialogProps: Record<string, any>;
}

const DialogManagerPresenter = ({
  dialogId,
  dialogProps,
}: DialogManagerProps) => {
  const { shellStore } = useAppState();
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [dialogWindow, setDialogWindow] = useState<ReactNode>(null);

  const isOpen = useMemo(() => Boolean(dialogId), [dialogId]);

  const onEsc = useCallback(() => {
    if (!dialogId) return;
    if (isOpen && dialogConfig?.hasCloseButton) {
      shellStore.closeDialog();
      if (dialogConfig.unblurOnClose) shellStore.setIsBlurred(false);
    }
  }, [dialogId, dialogConfig, isOpen]);

  // Clear dialog on escape press, if closable.
  useHotkeys('esc', onEsc, { enableOnTags: ['INPUT', 'TEXTAREA', 'SELECT'] });

  const openAndSetDialogWindow = useCallback(
    async (did: string) => {
      const dialogRenderer = dialogRenderers[did];

      const newDialogConfig =
        dialogRenderer instanceof Function
          ? dialogRenderer(dialogProps.toJSON())
          : dialogRenderer;
      setDialogConfig(newDialogConfig);

      const appWindow = shellStore.openDialogWindow(
        newDialogConfig.getWindowProps(shellStore.desktopDimensions)
      );

      setDialogWindow(
        <AppWindow
          appWindow={{
            ...appWindow,
            bounds: {
              ...appWindow.bounds,
              ...getCenteredPosition(appWindow.bounds),
            },
          }}
        />
      );
    },
    [dialogProps, shellStore.desktopDimensions]
  );

  useEffect(() => {
    if (dialogId) openAndSetDialogWindow(dialogId);
  }, [dialogId, openAndSetDialogWindow]);

  return (
    <motion.div
      id="dialog-fill"
      style={{
        display: isOpen ? 'block' : 'none',
        bottom: 0,
        padding: '8px',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        height: '100vh',
        paddingTop: shellStore.isFullscreen ? 0 : 30,
      }}
    >
      {dialogWindow}
    </motion.div>
  );
};

export const DialogManager = observer(DialogManagerPresenter);
