import { createRef, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { Flex, Pulser, Divider } from 'renderer/components';
import { SelectedSpace } from './SelectedSpace';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/lib/position';
import { BarButton } from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';
import { useAppState } from 'renderer/stores/app.store';
import { SystemTrayRegistry } from 'renderer/apps/registry';

const { position, anchorOffset, dimensions } = SystemTrayRegistry.spaces;

const SpaceSelectorPresenter = () => {
  const { theme } = useAppState();
  const { ship, spacesStore } = useShipStore();
  const selectorRef = createRef<HTMLDivElement>();

  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const { dockColor, mode } = theme;

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

  const isLoaded = spacesStore.isLoaded || spacesStore.selected;

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
        <SelectedSpace />
      ) : (
        <BarButton whileTap={{ scale: 0.975 }} transition={{ scale: 0.2 }}>
          <Flex>
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
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
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={12}
              width={40}
            />
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={14}
              width={90}
            />
          </Flex>
        </BarButton>
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
};

export const SpaceSelector = observer(SpaceSelectorPresenter);
