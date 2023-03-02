import { FC, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Icon } from '@holium/design-system';
import { getSnapshot } from 'mobx-state-tree';

const ICON_SIZE = 28;

export const AirliftTray: FC = observer(() => {
  const { airlift, spaces } = useServices();

  const isDragging = useMemo(() => {
    return (
      (spaces.selected
        ? airlift.nodes
            .get(spaces.selected?.path)
            ?.filter((node) => node.dragging).length || 0
        : 0) > 0
    );
  }, [getSnapshot(airlift.nodes)]);
  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const dimensions = {
    height: 350,
    width: 380,
  };

  const position = 'top-left';
  const anchorOffset = { x: 8, y: 26 };

  const onButtonClick = useCallback(
    (evt: any) => {
      if (activeApp === 'airlift-tray') {
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
        left,
        bottom,
      });
      setTrayAppDimensions(dimensions);
      setActiveApp('airlift-tray');
    },
    [activeApp, anchorOffset, position, dimensions]
  );

  return (
    <Flex
      id="airlift-tray-icon"
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.2 }}
      onClick={onButtonClick}
      opacity={1}
    >
      {isDragging ? (
        <Icon
          id="trash-bin-icon"
          name="TrashBin"
          stroke={'red'}
          strokeWidth={1.5}
          size={ICON_SIZE}
          pointerEvents="none"
          overflow={'visible'}
          mr={-1}
          onDragOver={() => {
            console.log('got dragover');
          }}
        />
      ) : (
        <Icon
          id="airlift-icon"
          name="Airlift"
          size={ICON_SIZE}
          pointerEvents="none"
          opacity={1}
        />
      )}
    </Flex>
  );
});
