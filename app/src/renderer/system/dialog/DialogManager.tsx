import { useRef } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useServices } from 'renderer/logic/store';
import AppWindow from '../desktop/components/Window/Window';
import { getCenteredXY } from 'os/services/shell/lib/window-manager';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { ShellActions } from 'renderer/logic/actions/shell';

interface DialogManagerProps {
  dialogId?: string;
  dialogProps: any;
}

const DialogManagerPresenter = ({
  dialogId,
  dialogProps,
}: DialogManagerProps) => {
  const { shell } = useServices();
  const desktopRef = useRef<HTMLDivElement>(null);

  let dialogConfig: DialogConfig;
  let dialogWindow: React.ReactNode | undefined;
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

  if (isOpen) {
    const dialogRenderer = dialogRenderers[dialogId];
    dialogConfig =
      dialogRenderer instanceof Function
        ? dialogRenderer(dialogProps.toJSON())
        : dialogRenderer;
    dialogWindow = (
      <AppWindow
        desktopRef={desktopRef}
        window={{
          ...dialogConfig.window,
          bounds: {
            ...dialogConfig.window.bounds,
            ...getCenteredXY(
              dialogConfig!.window.bounds,
              shell.desktopDimensions
            ),
          },
        }}
      />
    );
  }

  return (
    <motion.div
      id="dialog-fill"
      ref={desktopRef}
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
      {dialogWindow as any}
    </motion.div>
  );
};

export const DialogManager = observer(DialogManagerPresenter);
