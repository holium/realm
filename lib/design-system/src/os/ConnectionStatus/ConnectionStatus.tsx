import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { darken, lighten, rgba, saturate } from 'polished';
import styled, { css } from 'styled-components';

import { Button, Flex, Icon, Spinner, Text } from '../../';

interface ConnStatusStyleProps {
  baseColor: string;
  preventClick?: boolean;
  mode: 'light' | 'dark';
}

const ConnStatusStyle = styled(motion.div)<ConnStatusStyleProps>`
  border-radius: 36px;
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: fit-content;
  backdrop-filter: var(--blur);
  user-select: none;
  ${(props: ConnStatusStyleProps) =>
    props.mode === 'light'
      ? css`
          color: ${darken(0.4, saturate(0.3, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: var(--transition);
          ${!props.preventClick &&
          `
            :hover {
              transition: var(--transition);
              background: ${rgba(props.baseColor, 0.7)};
            }
            :active {
              transition: var(--transition);
              background: ${rgba(props.baseColor, 0.9)};
            }
          `}
        `
      : css`
          color: ${darken(0.3, saturate(0.9, props.baseColor))};
          background: ${rgba(props.baseColor, 0.5)};
          transition: var(--transition);
          ${!props.preventClick &&
          `
            :hover {
              transition: var(--transition);
              background: ${rgba(props.baseColor, 0.7)};
            }
            :active {
              transition: var(--transition);
              background: ${rgba(props.baseColor, 0.9)};
            }
          `}
        `};
`;

const ReportBugButton = styled(Button.Base)<ConnStatusStyleProps>`
  ${(props: ConnStatusStyleProps) => css`
    padding: 4px 6px 4px 8px;
    border-radius: 12px;
    background: ${darken(0.05, props.baseColor)};
    :hover {
      background: ${darken(0.07, props.baseColor)};
    }
    :active {
      background: ${darken(0.1, props.baseColor)};
    }
  `}
`;

const ConnIndicator = styled(motion.div)`
  height: 8px;
  width: 8px;
  border-radius: 50%;
`;

type ConnectionStatusProps = {
  serverId: string;
  themeMode: 'light' | 'dark';
  status:
    | 'initialized'
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'failed'
    | 'stale'
    | 'refreshing'
    | 'refreshed'
    | 'no-internet';

  onReconnect: () => void;
  onSendBugReport: () => void;
};

export const ConnectionStatus = ({
  serverId,
  themeMode,
  status,
  onReconnect,
  onSendBugReport,
}: ConnectionStatusProps) => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reportedBug, setReportedBug] = useState(false);

  let color = '#34C676';
  let statusText = 'Connected';
  let leftIcon = <div />;
  if (status === 'failed') {
    color = '#C65734';
    leftIcon = <Icon name="Error" iconColor={lighten(0.34, color)} />;
    statusText = 'Connection error';
  } else if (status === 'disconnected') {
    color = '#C69D34';
    leftIcon = <Icon name="Refresh" iconColor={lighten(0.34, color)} />;
    statusText = 'Reconnect';
  } else if (status === 'no-internet') {
    color = '#C65734';
    leftIcon = <Icon name="Error" iconColor={lighten(0.34, color)} />;
    statusText = 'No internet';
  } else if (status === 'refreshing') {
    color = '#C69D34';
    leftIcon = <Icon name="Refresh" iconColor={lighten(0.34, color)} />;
    statusText = 'Re-establishing connection...';
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
          display: !serverId ? 'none' : 'flex',
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
        width="500px"
        position="absolute"
        justifyContent="center"
        right={'calc(50% - 250px)'}
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
          preventClick={status === 'failed' || status === 'no-internet'}
          baseColor={color}
          mode={themeMode}
          whileTap={status === 'disconnected' ? { scale: 0.95 } : {}}
          style={{
            cursor: status === 'disconnected' ? `pointer` : `default`,
            // pointerEvents: status === 'disconnected' ? 'all' : 'none',
          }}
          onClick={() => {
            if (status === 'disconnected') {
              setIsReconnecting(true);
              onReconnect();
            }
          }}
        >
          {status === 'disconnected' && !isReconnecting && leftIcon}
          {status !== 'disconnected' && (
            <ConnIndicator style={{ background: color }} />
          )}
          {(status === 'refreshing' ||
            (status === 'disconnected' && isReconnecting)) && (
            <Spinner size={0} color={indicatorColor} />
          )}
          <Text.Custom fontWeight={500} style={{ color: 'white' }} fontSize={2}>
            {statusText}
          </Text.Custom>
          {status === 'failed' && (
            <Flex row width="fit-content">
              <ReportBugButton
                ml={2}
                baseColor={color}
                mode={themeMode}
                disabled={reportedBug}
                width={100}
                style={{
                  pointerEvents: 'all',
                }}
                onClick={(evt) => {
                  evt.stopPropagation();
                  setReportedBug(true);
                  setTimeout(() => {
                    setReportedBug(false);
                  }, 5000);
                  onSendBugReport();
                  // TODO send bug report
                }}
              >
                <Text.Custom
                  textAlign="center"
                  fontWeight={500}
                  width={100}
                  style={{ color: 'white', pointerEvents: 'none' }}
                  fontSize={1}
                >
                  {reportedBug ? 'Reported' : 'Send Report'}
                </Text.Custom>
              </ReportBugButton>
              <ReportBugButton
                ml={2}
                baseColor={color}
                mode={themeMode}
                disabled={isReconnecting}
                width={130}
                style={{
                  pointerEvents: 'all',
                }}
                onClick={(evt) => {
                  evt.stopPropagation();
                  setIsReconnecting(true);
                  setTimeout(() => {
                    setIsReconnecting(false);
                  }, 10000);
                  onReconnect();
                }}
              >
                {isReconnecting ? (
                  <Spinner size={0} color={indicatorColor} />
                ) : (
                  <Icon name="Refresh" iconColor={lighten(0.34, color)} />
                )}
                <Text.Custom
                  textAlign="center"
                  fontWeight={500}
                  width={120}
                  style={{ color: 'white', pointerEvents: 'none' }}
                  fontSize={1}
                >
                  {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                </Text.Custom>
              </ReportBugButton>
            </Flex>
          )}
        </ConnStatusStyle>
      </Flex>
    ),
    [status, isReconnecting, serverId, reportedBug]
  );
};
