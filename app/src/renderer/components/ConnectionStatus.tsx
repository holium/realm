import { FC, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { darken, lighten, rgba, saturate } from 'polished';
import { ThemeType } from '../theme';
import { Text, Icons, Flex, Spinner } from 'renderer/components';
import { observer } from 'mobx-react';
import { useCore, useServices } from 'renderer/logic/store';
import { OSActions } from 'renderer/logic/actions/os';

type ConnStatusStyleProps = {
  theme: ThemeType;
  baseColor: string;
  mode: 'light' | 'dark';
};

const ConnStatusStyle = styled(motion.div)<ConnStatusStyleProps>`
  border-radius: 36px;
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  backdrop-filter: var(--blur-enabled);
  user-select: none;
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  ${(props: ConnStatusStyleProps) =>
    props.mode === 'light'
      ? css`
          color: ${darken(0.4, saturate(0.3, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: ${props.theme.transition};
          :hover {
            transition: ${props.theme.transition};
            background: ${rgba(props.baseColor, 0.7)};
          }
          :active {
            transition: ${props.theme.transition};
            background: ${rgba(props.baseColor, 0.9)};
          }
        `
      : css`
          color: ${darken(0.3, saturate(0.9, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: ${props.theme.transition};
          :hover {
            transition: ${props.theme.transition};
            background: ${rgba(props.baseColor, 0.7)};
          }
          :active {
            transition: ${props.theme.transition};
            background: ${rgba(props.baseColor, 0.9)};
          }
        `};
`;

// const
type ConnStatusProps = {};

const ConnIndicator = styled(motion.div)`
  height: 8px;
  width: 8px;
  border-radius: 50%;
`;

export const ConnectionStatus: FC<ConnStatusProps> = observer(
  (props: ConnStatusProps) => {
    const { online, connectionStatus } = useCore();
    const { ship, theme } = useServices();
    const [isReconnecting, setIsReconnecting] = useState(false);
    const status = connectionStatus;
    const mode = theme.currentTheme.mode;
    const onReconnect = () => {
      OSActions.reconnect();
    };
    let color = '#34C676';
    let statusText = 'Connected';
    let leftIcon = <div />;
    if (status === 'failed') {
      color = '#C65734';
      leftIcon = <Icons name="Error" fill={lighten(0.34, color)} />;
      statusText = 'Connection error';
    }
    if (status === 'offline') {
      if (!online) {
        color = '#C65734';
        leftIcon = <Icons name="Error" fill={lighten(0.34, color)} />;
        statusText = 'No internet';
      } else {
        color = '#C69D34';
        leftIcon = <Icons name="Refresh" fill={lighten(0.34, color)} />;
        statusText = 'Reconnect';
      }
    }
    let indicatorColor = lighten(0.34, color);
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
            display: !ship ? 'none' : 'flex',
            top: status === 'connected' || status === 'initialized' ? -50 : 20,
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
            mode={mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsReconnecting(true);
              onReconnect();
            }}
          >
            {status === 'offline' && !isReconnecting && leftIcon}
            {status !== 'offline' && (
              <ConnIndicator style={{ background: color }} />
            )}
            {status === 'offline' && isReconnecting && (
              <Spinner size={0} color={indicatorColor} />
            )}
            <Text fontWeight={500} color="white" fontSize={2}>
              {statusText}
            </Text>
          </ConnStatusStyle>
        </Flex>
      ),
      [status, isReconnecting]
    );
  }
);

ConnectionStatus.defaultProps = {};
