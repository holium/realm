import { useState } from 'react';
import { Avatar, Flex, Tooltip } from '@holium/design-system';
import { LayoutGroup, motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import { useAppState } from 'renderer/stores/app.store';
import styled from 'styled-components';

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
  background-color: #4e9efd;
`;

const ShipSelectorPresenter = () => {
  const { setTheme, authStore } = useAppState();
  const { accounts, selected: selectedShip, setSelected: onSelect } = authStore;

  const [orderedList, _setOrder] = useState(accounts.map((a) => a.patp) || []);
  const [dragging, setDragging] = useState(false);

  // useEffect(() => {
  //   auth.order && setOrder(auth.order);
  // });

  const shipList = orderedList
    .map((shipKey: any) => {
      const ship = accounts.find((a) => a.patp === shipKey);
      if (!ship) return null;

      const selected = selectedShip && ship.patp === selectedShip.patp;
      return (
        <Reorder.Item
          key={ship.patp}
          value={shipKey}
          style={{ zIndex: 1 }}
          whileDrag={{ zIndex: 20 }}
          onDragStart={() => setDragging(true)}
          onClick={async () => {
            onSelect(ship.patp);
            if (!dragging) {
              onSelect(ship.patp);
              setTheme(ship.theme);
              // const selectedPatp = await AuthActions.getSelected();
              // if (selectedPatp) {
              //   if (selectedPatp !== ship.patp) {
              //     !dragging && AuthActions.setSelected(ship.patp);
              //     setLoginError('');
              //     const currTheme = await AuthActions.getShipTheme(ship.patp);
              //     if (currTheme) {
              //       theme.setCurrentTheme(currTheme);
              //     } else {
              //       console.error('Error: no theme found for ship:', ship.patp);
              //     }
              //   }
            }
          }}
          onMouseUp={() => {
            setDragging(false);
          }}
          onDragEnd={(_event: any) => {
            // delay(
            //   async () => await AuthActions.setOrder(toJS(auth.order)),
            //   1500
            // );
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
                layoutId="selectedLine"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
            )}
          </Flex>
        </Reorder.Item>
      );
    })
    .filter(Boolean);

  return (
    <LayoutGroup>
      <Reorder.Group
        axis="x"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
        }}
        values={orderedList}
        onReorder={(_newOrder: any) => {
          // auth.setOrder(newOrder);
        }}
      >
        {shipList}
      </Reorder.Group>
    </LayoutGroup>
  );
};

export const ShipSelector = observer(ShipSelectorPresenter);
