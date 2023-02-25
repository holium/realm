import { FC, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { useTrayApps } from 'renderer/apps/store';
import { Icon } from '@holium/design-system';
import { motion } from 'framer-motion';
import { getSnapshot } from 'mobx-state-tree';

const ICON_SIZE = 28;

export const AirliftTray: FC = observer(() => {
  const { airlift } = useServices();

  const isDragging = useMemo(() => {
    return airlift.flowStore.nodes.filter((node) => node.dragging).length > 0;
  }, [getSnapshot(airlift.flowStore.nodes)]);
  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const dimensions = {
    height: 180,
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
    <motion.div
      id="airlift-tray-icon"
      className="realm-cursor-hover"
      style={{
        position: 'relative',
        display: 'flex',
        justifyItems: 'center',
        alignContent: 'center',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.2 }}
      onClick={onButtonClick}
    >
      {isDragging ? (
        <Icon
          name="TrashBin"
          stroke={'red'}
          strokeWidth={1.5}
          size={ICON_SIZE}
          pointerEvents="none"
          overflow={'visible'}
        />
      ) : (
        <Icon
          name="Airlift"
          size={ICON_SIZE}
          pointerEvents="none"
          opacity={1}
        />
      )}
    </motion.div>
  );
});
