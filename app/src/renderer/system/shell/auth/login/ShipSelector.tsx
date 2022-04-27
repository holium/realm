import { FC, useState } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { useMst } from '../../../../logic/store';

import { Flex, Sigil, Tooltip } from '../../../../components';
import { ShipModelType } from '../../../../logic/ship/store';

// ----------------------------------------
// -------- Local style components --------
// ----------------------------------------

const SelectedLine = styled(motion.div)`
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
  // TODO optimize
  const { shipStore } = useMst();
  // const [draggingPatp, setDraggingPatp] = useState('');
  const selectedShip = shipStore.session;

  return (
    <Reorder.Group
      axis="x"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
      }}
      values={shipStore.order}
      onReorder={(newOrder: any) => shipStore.setOrder(newOrder)}
    >
      {shipStore.order.map((ship: ShipModelType) => {
        const selected = selectedShip && ship.patp === selectedShip.patp;
        // const isDragging = draggingPatp === ship.patp;
        return (
          <Reorder.Item
            key={ship.patp}
            value={ship}
            style={{ zIndex: 1 }}
            whileDrag={{ zIndex: 20 }}
            // onDragStart={() => setDraggingPatp(ship.patp)}
            // onDragEnd={() => setDraggingPatp('')}
            onClick={() => {
              shipStore.setSession(ship);
            }}
          >
            <Flex position="relative" height="100%">
              <Tooltip
                id={ship.patp}
                placement="top-right"
                content={ship.patp || ship.nickname}
              >
                <motion.div
                  style={{
                    x: 0,
                    cursor: 'pointer',
                    // zIndex: isDragging ? 2 : 1,
                  }}
                  whileHover={{ scale: 1.1 }}
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
