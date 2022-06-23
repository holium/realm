import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { useAuth } from 'renderer/logic/store';

import { Flex, Sigil, Tooltip } from 'renderer/components';

// ----------------------------------------
// -------- Local style components --------
// ----------------------------------------

export const SelectedLine = styled(motion.div)`
  left: 11px;
  bottom: -12px;
  width: 10px;
  height: 5px;
  border-radius: 4px;
  position: absolute;
  background-color: ${(props: any) =>
    lighten(0.05, props.theme.colors.brand.primary)};
`;

export const ShipSelector: FC = observer(() => {
  const { authStore } = useAuth();

  const selectedShip = useMemo(
    () => authStore.currentShip,
    [authStore.currentShip]
  );
  const orderedList = useMemo(() => authStore.order, [authStore.order]);

  return (
    <Reorder.Group
      axis="x"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
      }}
      values={orderedList}
      onReorder={(newOrder: any) => authStore.setOrder(newOrder)}
    >
      {orderedList.length > 0 &&
        orderedList.map((ship: any) => {
          const selected = selectedShip && ship.id === selectedShip.id;
          return (
            <Reorder.Item
              key={ship.patp}
              value={ship}
              style={{ zIndex: 1 }}
              whileDrag={{ zIndex: 20 }}
              // onDragStart={() => setDraggingPatp(ship.patp)}
              // onDragEnd={() => setDraggingPatp('')}
              onClick={() => {
                authStore.setSession(ship);
              }}
            >
              <Flex position="relative" height="100%">
                <Tooltip
                  id={ship.patp}
                  placement="top-right"
                  content={ship.patp || ship.nickname}
                >
                  <motion.div
                    className="realm-cursor-hover"
                    style={{
                      x: 0,
                      // cursor: 'pointer',
                      // zIndex: isDragging ? 2 : 1,
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ scale: 0.2 }}
                    whileTap={{ scale: 1.0 }}
                  >
                    <Sigil
                      simple
                      isLogin
                      size={32}
                      avatar={ship.avatar}
                      patp={ship.patp}
                      color={[ship.color || '#000000', 'white']}
                    />
                  </motion.div>
                </Tooltip>
                {selected && (
                  <SelectedLine
                    layoutId="selected-ship"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Flex>
            </Reorder.Item>
          );
        })}
    </Reorder.Group>
  );
});
