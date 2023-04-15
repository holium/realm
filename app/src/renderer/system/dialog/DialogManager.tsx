import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { getCenteredPosition } from 'os/services/shell/lib/window-manager';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
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
  const { shell } = useServices();
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [dialogWindow, setDialogWindow] = useState<ReactNode>(null);

  const isOpen = useMemo(() => Boolean(dialogId), [dialogId]);

  const onEsc = useCallback(() => {
    if (!dialogId) return;
    const notOnboardingDialog = !Object.values(OnboardingStep).includes(
      dialogId as OnboardingStep
    );
    if (isOpen && notOnboardingDialog && dialogConfig?.hasCloseButton) {
      ShellActions.closeDialog();
      if (dialogConfig.unblurOnClose) ShellActions.setBlur(false);
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

      const appWindow = await DesktopActions.openDialog(
        newDialogConfig.getWindowProps(shell.desktopDimensions)
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
    [dialogProps, shell.desktopDimensions]
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
        paddingTop: shell.isFullscreen ? 0 : 30,
      }}
    >
      {dialogWindow}
    </motion.div>
  );
};

export const DialogManager = observer(DialogManagerPresenter);
