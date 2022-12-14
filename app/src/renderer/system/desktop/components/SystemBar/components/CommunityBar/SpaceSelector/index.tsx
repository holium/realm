import { createRef, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { Flex, Pulser, Divider } from 'renderer/components';
import { TrayButton } from '../../TrayButton';
import { SelectedSpace } from './SelectedSpace';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

const position = 'top-right';
const anchorOffset = { x: 4, y: 16 };
const dimensions = { height: 500, width: 380 };

export const SpaceSelector = observer(() => {
  const { ship, spaces, theme } = useServices();
  const selectorRef = createRef<HTMLDivElement>();

  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const { dockColor, mode } = theme.currentTheme;

  const dividerBg = useMemo(
    () =>
      mode === 'dark'
        ? rgba(darken(0.2, dockColor), 0.3)
        : rgba(lighten(0.4, dockColor), 0.6),
    [dockColor, mode]
  );

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
    [activeApp, setTrayAppCoords, setTrayAppDimensions, setActiveApp]
  );

  const isLoaded = spaces.isLoaded || spaces.selected;

  return (
    <Flex
      id="spaces-tray-icon"
      ref={selectorRef}
      className="realm-cursor-hover"
      position="relative"
      alignItems="center"
      onClick={isLoaded && onButtonClick}
    >
      {isLoaded ? (
        <SelectedSpace selectorRef={selectorRef} />
      ) : (
        <TrayButton
          ref={selectorRef}
          whileTap={{ scale: 0.975 }}
          transition={{ scale: 0.2 }}
          customBg={dockColor}
        >
          <Flex>
            <Pulser
              background={rgba(theme.currentTheme.backgroundColor, 0.5)}
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
              background={rgba(theme.currentTheme.backgroundColor, 0.5)}
              borderRadius={4}
              height={12}
              width={40}
            />
            <Pulser
              background={rgba(theme.currentTheme.backgroundColor, 0.5)}
              borderRadius={4}
              height={14}
              width={90}
            />
          </Flex>
        </TrayButton>
      )}
      {ship && (
        <Divider
          initial={{ backgroundColor: dividerBg }}
          animate={{ backgroundColor: dividerBg }}
          transition={{ backgroundColor: { duration: 0.5 } }}
          customBg={dividerBg}
          ml={2}
          mr={2}
        />
      )}
    </Flex>
  );
});

export default { SpaceSelector };
