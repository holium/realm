import { Flex, Icon, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import styled from 'styled-components';

import { useRooms } from '../useRooms';

interface CommCircleProps {
  customBg: string;
}

const ProviderStyle = styled(Flex)<CommCircleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px 0px 8px;
  height: 24px;
  border-radius: 12px;
  gap: 6px;
  background: rgba(var(--rlm-overlay-hover-rgba));
  transition: var(--transition);
  &:hover {
    background: rgba(var(--rlm-overlay-active-rgba));
    transition: var(--transition);
  }
`;

interface ProviderSelectorProps {
  connected?: boolean;
  seedColor: string;
  onClick: (evt: any) => void;
}

const ProviderSelectorPresenter = ({ onClick }: ProviderSelectorProps) => {
  const { theme } = useAppState();
  const { ship } = useShipStore();
  const { windowColor } = theme;
  const roomsManager = useRooms(ship?.patp);

  return (
    <ProviderStyle customBg={windowColor} onClick={(evt: any) => onClick(evt)}>
      <Icon size={18} opacity={0.7} name="BaseStation" />
      <Text.Custom fontSize={1} opacity={0.7}>
        {roomsManager?.protocol.provider}
      </Text.Custom>
    </ProviderStyle>
  );
};

export const ProviderSelector = observer(ProviderSelectorPresenter);
