import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { darken, lighten, rgba, saturate } from 'polished';
import styled, { css } from 'styled-components';

import { Flex, Icon, Spinner, Text } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';

interface ConnStatusStyleProps {
  baseColor: string;
  mode: 'light' | 'dark';
}

const ConnStatusStyle = styled(motion.div)<ConnStatusStyleProps>`
  border-radius: 36px;
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  backdrop-filter: var(--blur);
  user-select: none;
  ${(props: ConnStatusStyleProps) =>
    props.mode === 'light'
      ? css`
          color: ${darken(0.4, saturate(0.3, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: var(--transition);
          :hover {
            transition: var(--transition);
            background: ${rgba(props.baseColor, 0.7)};
          }
          :active {
            transition: var(--transition);
            background: ${rgba(props.baseColor, 0.9)};
          }
        `
      : css`
          color: ${darken(0.3, saturate(0.9, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: var(--transition);
          :hover {
            transition: var(--transition);
            background: ${rgba(props.baseColor, 0.7)};
          }
          :active {
            transition: var(--transition);
            background: ${rgba(props.baseColor, 0.9)};
          }
        `};
`;

const ConnIndicator = styled(motion.div)`
  height: 8px;
  width: 8px;
  border-radius: 50%;
`;

export const ConnectionStatus = observer(() => {
  const { loggedInAccount, theme } = useAppState();
  const [isReconnecting, setIsReconnecting] = useState(false);
  // const status = connectionStatus;
  const online = true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, _setStatus] = useState<
    | 'online'
    | 'offline'
    | 'failed'
    | 'refreshing'
    | 'refreshed'
    | 'connected'
    | 'connecting'
    | 'initialized'
  >('online');

  const mode = theme.mode;
  const onReconnect = () => {
    // OSActions.reconnect();
  };
  // console.log('render status => %o', status);
  let color = '#34C676';
  let statusText = 'Connected';
  let leftIcon = <div />;
  if (status === 'failed') {
    color = '#C65734';
    leftIcon = <Icon name="Error" iconColor={lighten(0.34, color)} />;
    statusText = 'Connection error';
  }
  if (status === 'offline') {
    if (!online) {
      color = '#C65734';
      leftIcon = <Icon name="Error" iconColor={lighten(0.34, color)} />;
      statusText = 'No internet';
    } else {
      color = '#C69D34';
      leftIcon = <Icon name="Refresh" iconColor={lighten(0.34, color)} />;
      statusText = 'Reconnect';
    }
  } else if (status === 'refreshing') {
    color = '#C69D34';
    leftIcon = <Icon name="Refresh" iconColor={lighten(0.34, color)} />;
    statusText = 'Reestablishing connection...';
  }
  const indicatorColor = lighten(0.34, color);
  useEffect(() => {
    if (status === 'connected' && isReconnecting) {
      setIsReconnecting(false);
    }
  }, [status]);

  return useMemo(
    () => (
      <Flex
        zIndex={20}
        initial={{ top: -50 }}
        animate={{
          display: !loggedInAccount ? 'none' : 'flex',
          top:
            status === 'refreshed' ||
            status === 'connected' ||
            status === 'initialized'
              ? -50
              : 20,
        }}
        transition={{
          top: { duration: 0.25 },
        }}
        exit={{ opacity: 0 }}
        width="250px"
        position="absolute"
        justifyContent="center"
        right={'calc(50% - 125px)'}
      >
        <ConnStatusStyle
          initial={{ opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            scale: 0.5,
            background: { duration: 0.25 },
            width: 0.25,
          }}
          exit={{ opacity: 0 }}
          baseColor={color}
          mode={mode as any}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: status === 'offline' && online ? `pointer` : `default`,
          }}
          onClick={() => {
            if (status === 'offline' && online) {
              setIsReconnecting(true);
              onReconnect();
            }
          }}
        >
          {status === 'offline' && !isReconnecting && leftIcon}
          {status !== 'offline' && (
            <ConnIndicator style={{ background: color }} />
          )}
          {(status === 'refreshing' ||
            (status === 'offline' && isReconnecting)) && (
            <Spinner size={0} color={indicatorColor} />
          )}
          <Text.Custom fontWeight={500} style={{ color: 'white' }} fontSize={2}>
            {statusText}
          </Text.Custom>
        </ConnStatusStyle>
      </Flex>
    ),
    [status, isReconnecting, loggedInAccount?.serverId]
  );
});
