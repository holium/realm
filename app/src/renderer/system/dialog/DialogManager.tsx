import { useState, ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useServices } from 'renderer/logic/store';
import { AppWindow } from '../desktop/components/AppWindow/AppWindow';
import { getCenteredPosition } from 'os/services/shell/lib/window-manager';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { ShellActions } from 'renderer/logic/actions/shell';
import { DesktopActions } from 'renderer/logic/actions/desktop';

interface DialogManagerProps {
  dialogId?: string;
  dialogProps: Record<string, any>;
}

const DialogManagerPresenter = ({
  dialogId,
  dialogProps,
}: DialogManagerProps) => {
  const { shell } = useServices();
  const [dialogWindow, setDialogWindow] = useState<ReactNode>(null);

  let dialogConfig: DialogConfig;
  const isOpen = dialogId !== undefined;

  // clear dialog on escape pressed if closable
  useHotkeys(
    'esc',
    () => {
      const notOnboardingDialog = !Object.values(OnboardingStep).includes(
        dialogId as any
      );
      if (isOpen && notOnboardingDialog && dialogConfig.hasCloseButton) {
        ShellActions.closeDialog();
        if (dialogConfig.unblurOnClose) ShellActions.setBlur(false);
      }
    },
    { enableOnTags: ['INPUT', 'TEXTAREA', 'SELECT'] }
  );

  useEffect(() => {
    const openDialogWindow = async (did: string) => {
      const dialogRenderer = dialogRenderers[did];
      dialogConfig =
        dialogRenderer instanceof Function
          ? dialogRenderer(dialogProps.toJSON())
          : dialogRenderer;
      const appWindow = await DesktopActions.openDialog(
        dialogConfig.getWindowProps(shell.desktopDimensions)
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
    };

    if (dialogId) openDialogWindow(dialogId);
  }, [dialogId, shell.desktopDimensions]);

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
        height: `calc(100vh - ${0}px)`,
        paddingTop: shell.isFullscreen ? 0 : 30,
      }}
    >
      {dialogWindow}
    </motion.div>
  );
};

export const DialogManager = observer(DialogManagerPresenter);
