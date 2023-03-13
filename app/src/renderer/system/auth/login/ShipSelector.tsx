import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { delay } from 'lodash';

import { Flex, Tooltip } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { AuthActions } from 'renderer/logic/actions/auth';
import { Avatar } from '@holium/design-system';

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

const ShipSelectorPresenter = () => {
  const { identity } = useServices();
  const { auth } = identity;
  const selectedShip = useMemo(() => auth.currentShip, [auth.currentShip]);
  const [orderedList, setOrder] = useState(auth.order || []);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    auth.order && setOrder(auth.order);
  });

  const shipList = orderedList
    .map((shipKey: any) => {
      const ship = auth.ships.get(shipKey);
      if (!ship) return null;

      const selected = selectedShip && ship.id === selectedShip.id;
      return (
        <Reorder.Item
          key={ship.patp}
          value={shipKey}
          style={{ zIndex: 1 }}
          whileDrag={{ zIndex: 20 }}
          onDragStart={() => setDragging(true)}
          onClick={() => {
            !dragging && AuthActions.setSelected(ship.patp);
          }}
          onMouseUp={() => {
            setDragging(false);
          }}
          onDragEnd={(_event: any) => {
            delay(
              async () => await AuthActions.setOrder(toJS(auth.order)),
              1500
            );
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
                <Avatar
                  simple
                  isLogin
                  size={32}
                  avatar={ship.avatar}
                  patp={ship.patp}
                  sigilColor={[ship.color || '#000000', 'white']}
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
    })
    .filter(Boolean);

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
};

export const ShipSelector = observer(ShipSelectorPresenter);
