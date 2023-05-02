import styled from 'styled-components';

import { Avatar, Box, Flex, Row, Text } from '@holium/design-system';

import { MobXAccount } from 'renderer/stores/models/account.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';

const Wrapper = styled(Box)`
  position: absolute;
  z-index: 3;
  bottom: -12px;
  left: -12px;
  right: -12px;
  padding: 12px;
  height: 70px;
  width: calc(100% + 24px);
`;
interface SpaceRowProps {
  account: MobXAccount;
  space: SpaceModelType;
  selected?: boolean;
  onSelect: (spaceKey: string) => void;
}

export const YouRow = ({
  account,
  selected,
  space,
  onSelect,
}: SpaceRowProps) => {
  if (!account) return null;

  return (
    <Wrapper>
      <Row
        data-close-tray="true"
        style={{ width: '100%' }}
        className="realm-cursor-hover"
        selected={selected}
        onClick={() => {
          onSelect(space.path);
        }}
      >
        <Flex gap={8} alignItems="center" style={{ pointerEvents: 'none' }}>
          <Avatar
            simple
            borderRadiusOverride="6px"
            size={32}
            avatar={account.avatar}
            patp={account.serverId}
            sigilColor={[account.color || '#000000', 'white']}
          />
          <Flex ml={2} flexDirection="column">
            <Text.Custom fontSize={3} fontWeight={500}>
              {account.nickname || account.serverId}
            </Text.Custom>
          </Flex>
        </Flex>
      </Row>
    </Wrapper>
  );
};
