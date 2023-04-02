// import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { darken, rgba } from 'polished';

import { Pulser } from 'renderer/components';
import { Box, Flex, Avatar } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';

import { motion } from 'framer-motion';
import { TrayClock } from '../Clock';
import styled from 'styled-components';

type AccountTrayProps = {
  unreadCount: number;
  onClick: (evt: any) => void;
};

const AccountTrayPresenter = ({ unreadCount, onClick }: AccountTrayProps) => {
  const { ship, theme } = useServices();

  return (
    <Flex gap={8} alignItems="center">
      <motion.div
        id="account-tray-icon"
        className="realm-cursor-hover"
        style={{
          position: 'relative',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ scale: 0.2 }}
        onClick={onClick}
      >
        {ship ? (
          <AccountPaneStyle>
            <TrayClock />
            <Avatar
              simple
              clickable={true}
              avatar={ship.avatar}
              patp={ship.patp}
              size={26}
              borderRadiusOverride="4px"
              sigilColor={[ship.color || '#000000', '#FFF']}
            />
          </AccountPaneStyle>
        ) : (
          <Flex>
            <Pulser
              background={rgba(theme.currentTheme.backgroundColor, 0.5)}
              borderRadius={4}
              height={28}
              width={28}
            />
          </Flex>
        )}
        {unreadCount > 0 && (
          <Box
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              default: { duration: 0.2 },
            }}
            style={{
              position: 'absolute',
              background: '#4E9EFD',
              border: `2px solid ${darken(
                0.025,
                theme.currentTheme.dockColor
              )}`,
              borderRadius: '50%',
              right: -2,
              bottom: -2,
              height: 11,
              width: 11,
            }}
          />
        )}
      </motion.div>
    </Flex>
  );
};

export const AccountTray = observer(AccountTrayPresenter);

const AccountPaneStyle = styled(Flex)<{ isActive?: boolean }>`
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 4px 2px 6px;
  border-radius: 4px;
  transition: var(--transition);
  background: ${(props) =>
    props.isActive ? 'rgba(var(--rlm-overlay-active-rgba))' : 'transparent'};
  &:hover {
    transition: var(--transition);
    background: rgba(var(--rlm-overlay-hover-rgba));
  }
`;
