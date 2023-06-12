import { motion } from 'framer-motion';
import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

type TrafficLightButtonProps = {
  color: string;
};

export const TrafficLightButton = styled(
  motion.button
)<TrafficLightButtonProps>`
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

export const TrafficLights = () => {
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
    <Flex gap={8}>
      <TrafficLightButton color="#EC6A5E" onClick={onClose} />
      <TrafficLightButton color="#F5BF4F" onClick={onMinimize} />
      <TrafficLightButton color="#61C554" onClick={onFullscreen} />
    </Flex>
  );
};
