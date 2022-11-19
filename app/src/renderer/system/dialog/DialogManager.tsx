import { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useServices } from 'renderer/logic/store';
import AppWindow from '../desktop/components/Window';
import { getCenteredXY } from 'os/services/shell/lib/window-manager';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { ShellActions } from 'renderer/logic/actions/shell';

interface DialogManagerProps {
  dialogId?: string;
  dialogProps: any;
}

export const DialogManager: FC<DialogManagerProps> = observer(
  (props: DialogManagerProps) => {
    const { dialogId, dialogProps } = props;

    const { shell } = useServices();

    const desktopRef = useRef<any>(null);
    let dialogWindow: React.ReactNode | undefined;
    const isOpen = dialogId !== undefined;

    let dialogConfig: DialogConfig;
    if (isOpen) {
      const dialogRenderer = dialogRenderers[dialogId];
      dialogConfig =
        dialogRenderer instanceof Function
          ? dialogRenderer(dialogProps.toJSON())
          : dialogRenderer;
    }

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
      const dimensions = {
        ...dialogConfig!.window.dimensions,
        ...getCenteredXY(
          dialogConfig!.window.dimensions,
          shell.desktopDimensions
        ),
      };

      dialogWindow = (
        <AppWindow
          desktopRef={desktopRef}
          window={{
            ...dialogConfig!.window,
            dimensions,
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
  }
);
