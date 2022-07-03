import { FC, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import AppWindow from './components/AppWindow';
import { getCenteredXY } from 'os/services/shell/lib/window-manager';
import { dialogRenderers } from 'renderer/apps/dialog';

type DialogManagerProps = {
  dialogId?: string;
};

export const DialogManager: FC<DialogManagerProps> = observer(
  (props: DialogManagerProps) => {
    const { dialogId } = props;

    const { shell } = useServices();
    const { desktop, theme } = shell;
    const desktopRef = useRef<any>(null);
    let dialogWindow: React.ReactNode | undefined;
    const isOpen = dialogId !== undefined;
    if (isOpen) {
      const dialogConfig = dialogRenderers[dialogId];
      const dimensions = {
        ...dialogConfig.window.dimensions,
        ...getCenteredXY(
          dialogConfig.window.dimensions,
          desktop.desktopDimensions
        ),
      };
      dialogWindow = (
        <AppWindow
          desktopRef={desktopRef}
          window={{
            ...dialogConfig.window,
            dimensions,
          }}
          theme={desktop.theme}
        />
      );
    }
    return (
      <motion.div
        id="dialog-fill"
        ref={desktopRef}
        animate={{
          display: isOpen ? 'block' : 'none',
        }}
        style={{
          bottom: 0,
          padding: '8px',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: `calc(100vh - ${0}px)`,
          paddingTop: desktop.isFullscreen ? 0 : 30,
        }}
      >
        {dialogWindow}
      </motion.div>
    );
  }
);
