import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { Flex, Pulser, Sigil, IconButton, Icons } from 'renderer/components';

import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { AssemblyApp } from 'renderer/apps/Assembly';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';

type AssemblyTrayProps = {};

const iconSize = 28;

export const AssemblyTray: FC<AssemblyTrayProps> = observer(
  (props: AssemblyTrayProps) => {
    const { shell } = useServices();

    const { windowColor, dockColor, textColor } = shell.desktop.theme;
    const roomsButtonRef = createRef<HTMLButtonElement>();
    const appRef = createRef<HTMLDivElement>();

    const dimensions = {
      height: 500,
      width: 360,
    };

    return (
      <TrayMenu
        id="rooms-tray"
        appRef={appRef}
        buttonRef={roomsButtonRef}
        dimensions={dimensions}
        content={
          <MiniApp
            id="rooms-tray-app"
            ref={appRef}
            dimensions={dimensions}
            backgroundColor={windowColor}
            textColor={textColor}
          >
            <AssemblyApp theme={shell.desktop.theme} dimensions={dimensions} />
          </MiniApp>
        }
      >
        <motion.div
          id="rooms-tray-icon"
          className="realm-cursor-hover"
          // @ts-expect-error -
          ref={roomsButtonRef}
          whileTap={{ scale: 0.9 }}
          transition={{ scale: 0.2 }}
        >
          <IconButton
            id="rooms-tray-icon"
            ref={roomsButtonRef}
            size={iconSize}
            customBg={dockColor}
            // data-selected
            color={textColor}
            whileTap={{ scale: 0.9 }}
            transition={{ scale: 0.1 }}
            ml={1}
          >
            <Icons name="Connect" pointerEvents="none" />
          </IconButton>
        </motion.div>
      </TrayMenu>
    );
  }
);
