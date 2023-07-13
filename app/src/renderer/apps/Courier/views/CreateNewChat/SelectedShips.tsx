import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import {
  Avatar,
  Button,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

const RemoveWrapper = styled(motion.div)`
  position: absolute;
  z-index: 4;
  top: -6px;
  right: -6px;

  .new-chat-remove-ship {
    justify-content: center;
    align-items: center;
    background-color: rgba(var(--rlm-intent-alert-rgba));
    svg {
      fill: #fff;
    }
    transition: var(--transition);
    &:hover {
      transition: var(--transition);
      filter: brightness(0.95);
    }
  }
`;

type Props = {
  ships: Set<string>;
  onRemove: (contact: [string, string?]) => void;
};

const SelectedShipsPresenter = ({ ships, onRemove }: Props) => {
  const { friends } = useShipStore();

  return (
    <Flex flex={1} pt="6px" pb="4px" gap={12} overflowX="scroll">
      {Array.from(ships).map((ship) => {
        const metadata = ship
          ? friends.getContactAvatarMetadata(ship)
          : { patp: ship, color: '#000', nickname: '', avatar: '' };

        return (
          <Flex
            key={ship}
            width={50}
            position="relative"
            flexDirection="column"
          >
            <Avatar
              patp={metadata.patp}
              avatar={metadata.avatar}
              size={50}
              sigilColor={[metadata.color, '#ffffff']}
              simple
            />
            <Text.Custom mt={1} width={50} truncate opacity={0.7} fontSize={1}>
              {metadata.nickname || ship}
            </Text.Custom>
            <RemoveWrapper>
              <Button.Base
                className="new-chat-remove-ship"
                size={18}
                borderRadius={11}
                onClick={(evt) => {
                  evt.stopPropagation();
                  onRemove([ship, '']);
                }}
              >
                <Icon name="Close" size={16} />
              </Button.Base>
            </RemoveWrapper>
          </Flex>
        );
      })}
    </Flex>
  );
};

export const SelectedShips = observer(SelectedShipsPresenter);
