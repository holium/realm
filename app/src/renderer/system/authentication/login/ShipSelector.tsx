import { useState } from 'react';
import { LayoutGroup, motion, Reorder } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Avatar, Flex, Tooltip } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderedList, _setOrder] = useState(
    accounts.map((a) => a.serverId) || []
  );
  const [dragging, setDragging] = useState(false);

  // useEffect(() => {
  //   auth.order && setOrder(auth.order);
  // });

  const shipList = orderedList
    .map((shipKey: any) => {
      const account = accounts.find((a) => a.serverId === shipKey);
      if (!account) return null;

      const selected =
        selectedShip && account.serverId === selectedShip.serverId;
      return (
        <Reorder.Item
          key={account.serverId}
          value={shipKey}
          style={{ zIndex: 1 }}
          whileDrag={{ zIndex: 20 }}
          onDragStart={() => setDragging(true)}
          onClick={async () => {
            onSelect(account.serverId);
            if (!dragging) {
              onSelect(account.serverId);
              setTheme(account.theme);
              // const selectedIdentity = await AuthActions.getSelected();
              // if (selectedIdentity) {
              //   if (selectedIdentity !== account.serverId) {
              //     !dragging && AuthActions.setSelected(account.serverId);
              //     setLoginError('');
              //     const currTheme = await AuthActions.getShipTheme(account.serverId);
              //     if (currTheme) {
              //       theme.setCurrentTheme(currTheme);
              //     } else {
              //       console.error('Error: no theme found for account:', account.serverId);
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
              id={account.serverId}
              placement="top-right"
              content={account.serverId || account.nickname}
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
                  size={32}
                  avatar={account.avatar}
                  patp={account.serverId}
                  sigilColor={[account.color || '#000000', 'white']}
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
