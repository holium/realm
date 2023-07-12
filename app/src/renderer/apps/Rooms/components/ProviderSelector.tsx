import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { useRoomsStore } from '../store/RoomsStoreContext';

const ProviderStyle = styled(Flex)`
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
  onClick: (evt: any) => void;
}

const ProviderSelectorPresenter = ({ onClick }: ProviderSelectorProps) => {
  const roomsStore = useRoomsStore();
  const [provider, setProvider] = useState<string>(
    roomsStore.provider.split('.')[0]
  );

  useEffect(() => {
    setProvider(roomsStore.provider.split('.')[0]);
  }, [roomsStore.provider]);
  return (
    <ProviderStyle onClick={(evt: any) => onClick(evt)}>
      <Icon size={18} opacity={0.7} name="BaseStation" />
      <Text.Custom fontSize={1} opacity={0.7} isSkeleton={!roomsStore.provider}>
        {provider}
      </Text.Custom>
    </ProviderStyle>
  );
};

export const ProviderSelector = observer(ProviderSelectorPresenter);
