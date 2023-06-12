import { Top } from 'react-spaces';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';

import { Flex, Text } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';

import { TrafficLightButton, TrafficLights } from './TrafficLights';

export const TITLEBAR_HEIGHT = 40;

type RealmTitlebarContainerProps = {
  isFullscreen: boolean;
};

const RealmTitlebarContainer = styled.div<RealmTitlebarContainerProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${TITLEBAR_HEIGHT}px;
  width: 100%;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: var(--blur);
  transition: var(--transition);

  ${(props) =>
    !props.isFullscreen &&
    css`
      -webkit-app-region: drag;
    `}
  ${(props) =>
    props.isFullscreen &&
    css`
      &:not(:hover) {
        ${TrafficLightButton} {
          opacity: 0;
        }
      }
      &:hover {
        ${TrafficLightButton} {
          opacity: 1;
        }
      }
    `}
`;

export const RealmTitlebarPresenter = () => {
  const { shellStore } = useAppState();

  return (
    <Top zIndex={20} size={TITLEBAR_HEIGHT}>
      <RealmTitlebarContainer isFullscreen={shellStore.isFullscreen}>
        <TrafficLights />
      </RealmTitlebarContainer>
    </Top>
  );
};

export const RealmTitlebar = observer(RealmTitlebarPresenter);

const StandAloneChatTitlebarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${TITLEBAR_HEIGHT}px;
  padding: 1px 12px 0 12px;
  background: var(--rlm-window-color);
  z-index: 100;
  -webkit-user-select: none;
  -webkit-app-region: drag;
`;

export const StandAloneChatTitlebar = () => (
  <Top zIndex={20} size={TITLEBAR_HEIGHT}>
    <StandAloneChatTitlebarContainer>
      <Flex
        position="relative"
        flex={1}
        alignItems="center"
        justifyContent="center"
      >
        <Flex position="absolute" left={0}>
          <TrafficLights />
        </Flex>
        <Text.Body
          style={{
            opacity: 0.9,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Realm Chat
        </Text.Body>
      </Flex>
    </StandAloneChatTitlebarContainer>
  </Top>
);
