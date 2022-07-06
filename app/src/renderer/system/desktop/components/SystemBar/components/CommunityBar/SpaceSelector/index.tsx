import { FC, createRef, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { Flex, Pulser, Divider } from 'renderer/components';
import { TrayButton } from '../../TrayButton';
import { SelectedSpace } from './SelectedSpace';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

type SpaceSelectorProps = {};

export const SpaceSelector: FC<SpaceSelectorProps> = observer(
  (props: SpaceSelectorProps) => {
    const { ship, spaces, shell } = useServices();
    const { desktop } = shell;
    const selectorRef = createRef<HTMLDivElement>();

    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const { dockColor, mode } = desktop.theme;

    const dividerBg = useMemo(
      () =>
        mode === 'dark'
          ? rgba(lighten(0.2, dockColor), 0.3)
          : rgba(lighten(0.2, dockColor), 0.3),
      [desktop.theme]
    );

    const dimensions = {
      height: 500,
      width: 380,
    };

    const position = 'top-right';
    const anchorOffset = { x: 4, y: 16 };

    const onButtonClick = useCallback(
      (evt: any) => {
        if (activeApp === 'spaces-tray') {
          setActiveApp(null);
          evt.stopPropagation();
          return;
        }
        const { left, bottom }: any = calculateAnchorPoint(
          evt,
          anchorOffset,
          position,
          dimensions
        );
        // TODO hacky fix for positioning issue with larger button
        setTrayAppCoords({
          left,
          bottom,
        });
        setTrayAppDimensions(dimensions);
        setActiveApp('spaces-tray');
      },
      [activeApp, anchorOffset, position, dimensions]
    );

    return (
      <Flex
        id="spaces-tray-icon"
        ref={selectorRef}
        className="realm-cursor-hover"
        position="relative"
        alignItems="center"
        onClick={onButtonClick}
      >
        {spaces.isLoaded ? (
          <SelectedSpace selectorRef={selectorRef} />
        ) : (
          <TrayButton
            // id="spaces-tray-icon"
            ref={selectorRef}
            whileTap={{ scale: 0.975 }}
            transition={{ scale: 0.2 }}
            customBg={dockColor}
          >
            <Flex>
              <Pulser
                background={rgba(desktop.theme.backgroundColor, 0.5)}
                borderRadius={4}
                height={28}
                width={28}
              />
            </Flex>
            <Flex
              style={{ pointerEvents: 'none' }}
              flexDirection="column"
              justifyContent="center"
            >
              <Pulser
                style={{ marginBottom: 2 }}
                background={rgba(desktop.theme.backgroundColor, 0.5)}
                borderRadius={4}
                height={12}
                width={40}
              />
              <Pulser
                background={rgba(desktop.theme.backgroundColor, 0.5)}
                borderRadius={4}
                height={14}
                width={90}
              />
            </Flex>
          </TrayButton>
        )}
        {ship && <Divider customBg={dividerBg} ml={2} mr={2} />}
      </Flex>
    );
  }
);

export default { SpaceSelector };
