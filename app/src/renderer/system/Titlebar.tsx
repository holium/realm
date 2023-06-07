import { Top } from 'react-spaces';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';

import { Flex } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';

export const TITLEBAR_HEIGHT = 40;

type TrafficButtonProps = {
  color: string;
};

const TrafficButton = styled(motion.button)<TrafficButtonProps>`
  position: relative;
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  -webkit-app-region: no-drag;
  &:hover {
    filter: brightness(0.9);
  }
`;

type TitlebarContainerProps = {
  isFullscreen: boolean;
};

const TitlebarContainer = styled.div<TitlebarContainerProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${TITLEBAR_HEIGHT}px;
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: var(--blur);
  ${(props) =>
    !props.isFullscreen &&
    css`
      -webkit-app-region: drag;
    `}
  ${(props) =>
    props.isFullscreen &&
    css`
      &:not(:hover) {
        ${TrafficButton} {
          transition: var(--transition);
          opacity: 0;
        }
      }
      &:hover {
        ${TrafficButton} {
          transition: var(--transition);
          opacity: 1;
        }
      }
    `}
`;

export const RealmTitlebarPresenter = () => {
  const { shellStore } = useAppState();
  const onMinimize = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    window.electron.app.toggleMinimized();
  };
  const onClose = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    window.electron.app.closeRealm();
  };
  const onFullscreen = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    window.electron.app.toggleFullscreen();
  };
  return (
    <Top zIndex={20} size={TITLEBAR_HEIGHT}>
      <TitlebarContainer isFullscreen={shellStore.isFullscreen}>
        <Flex ml="14px" gap={8}>
          <TrafficButton color="#EC6A5E" onClick={onClose} />
          <TrafficButton color="#F5BF4F" onClick={onMinimize} />
          <TrafficButton color="#61C554" onClick={onFullscreen} />
        </Flex>
      </TitlebarContainer>
    </Top>
  );
};

export const RealmTitlebar = observer(RealmTitlebarPresenter);