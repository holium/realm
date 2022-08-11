import { FC, createRef, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Flex, IconButton, Icons } from 'renderer/components';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { AssemblyRow } from 'renderer/apps/Assembly/components/AssemblyRow';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

type AssemblyTrayProps = {};

const iconSize = 28;

export const AssemblyTray: FC<AssemblyTrayProps> = observer(
  (props: AssemblyTrayProps) => {
    const { desktop } = useServices();

    const {
      activeApp,
      assemblyApp,
      setActiveApp,
      setTrayAppCoords,
      setTrayAppDimensions,
    } = useTrayApps();
    const { dockColor, textColor } = desktop.theme;
    const roomsButtonRef = createRef<HTMLButtonElement>();

    const dimensions = {
      height: 500,
      width: 360,
    };

    const position = 'top-left';
    const anchorOffset = { x: 8, y: 26 };

    const onButtonClick = useCallback(
      (evt: any) => {
        if (activeApp === 'rooms-tray') {
          setActiveApp(null);
          evt.stopPropagation();
          return;
        }
        // ------------------------------------------------
        // ------------------------------------------------
        const { left, bottom }: any = calculateAnchorPoint(
          evt,
          anchorOffset,
          position,
          dimensions
        );
        // TODO hacky fix for positioning issue with larger button
        setTrayAppCoords({
          left: assemblyApp.live ? left + 4 : left,
          bottom: assemblyApp.live ? bottom - 2 : bottom,
        });
        setTrayAppDimensions(dimensions);
        setActiveApp('rooms-tray');
        if (assemblyApp.live) {
          assemblyApp.setSelected(assemblyApp.live);
          assemblyApp.setView('room');
        }
      },
      [activeApp, anchorOffset, position, dimensions]
    );

    const iconHoverColor = useMemo(
      () => rgba(darken(0.05, desktop.theme.dockColor), 0.5),
      [desktop.theme.windowColor]
    );

    return (
      <motion.div
        id="rooms-tray-icon"
        className="realm-cursor-hover"
        // @ts-expect-error -
        ref={roomsButtonRef}
        whileTap={{ scale: 0.975 }}
        transition={{ scale: 0.2 }}
        position="relative"
        onClick={onButtonClick}
      >
        {assemblyApp.live ? (
          <Flex style={{ pointerEvents: 'none' }}>
            <AssemblyRow
              tray
              {...assemblyApp.live}
              rightChildren={
                <Icons
                  // mb="2px"
                  size={iconSize - 4}
                  color={textColor}
                  name="Connect"
                  pointerEvents="none"
                />
              }
            />
          </Flex>
        ) : (
          <IconButton
            id="rooms-tray-icon"
            ref={roomsButtonRef}
            size={iconSize}
            customBg={iconHoverColor}
            color={textColor}
            mt="2px"
            // mb="-2px"
          >
            <Icons name="Connect" pointerEvents="none" />
          </IconButton>
        )}
      </motion.div>
    );
  }
);
