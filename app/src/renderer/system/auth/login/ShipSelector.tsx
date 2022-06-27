import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { debounce, delay } from 'lodash';

import { Flex, Sigil, Tooltip } from 'renderer/components';
import { useServices } from 'renderer/logic/store-2';
import { AuthApi } from 'renderer/logic/auth';
import { getSnapshot } from 'mobx-state-tree';

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
  const { identity } = useServices();
  const { auth } = identity;
  const selectedShip = useMemo(() => auth.currentShip, [auth.currentShip]);
  const [orderedList, setOrder] = useState(auth.order || []);
  const [dragging, setDragging] = useState(false);
  const shipList = orderedList.map((shipKey: any) => {
    const ship = auth.ships.get(shipKey)!;
    const selected = selectedShip && ship.id === selectedShip.id;
    return (
      <Reorder.Item
        key={ship.patp}
        value={shipKey}
        style={{ zIndex: 1 }}
        whileDrag={{ zIndex: 20 }}
        onDragStart={(evt: any) => setDragging(true)}
        onClick={() => {
          !dragging && AuthApi.setSelected(ship.patp);
        }}
        onMouseUp={() => {
          setDragging(false);
        }}
        onDragEnd={(_event: any) => {
          delay(() => AuthApi.setOrder(toJS(auth.order)), 1500);
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Flex>
      </Reorder.Item>
    );
  });

  useEffect(() => {
    auth.order && setOrder(auth.order);
  });

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
      onReorder={(newOrder: any) => {
        auth.setOrder(newOrder);
      }}
    >
      {shipList}
    </Reorder.Group>
  );
});
