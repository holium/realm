import React from 'react';
import { Space, SpaceInvite } from '@prisma/client';
import styled from 'styled-components';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';

const InviteCardContainer = styled(Flex)`
  width: 100%;
  max-width: 377px;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  padding: 40px;
  background-color: var(--rlm-window-bg-color);
  border-radius: 12px;
  box-shadow: var(--rlm-box-shadow-1);
`;

const SpacePicture = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  background-color: rgba(var(--rlm-text-rgba), 0.1);
`;

type Props = {
  invite: SpaceInvite & {
    space: Space;
  };
};

export const InviteCard = ({ invite }: Props) => (
  <InviteCardContainer>
    <Flex flexDirection="column" gap="20px" alignItems="center">
      <SpacePicture src={invite.space.picture} alt={invite.space.name} />
      <Flex flexDirection="column" gap="8px">
        <Text.H1 style={{ fontSize: '20px' }}>{invite.space.name}</Text.H1>
        <Flex gap="4px">
          <Icon name="Members" size={1} />
          <Text.Body opacity={0.5} style={{ fontSize: '14px' }}>
            {invite.space.membersCount} members
          </Text.Body>
        </Flex>
      </Flex>
      <Text.Body opacity={0.5} style={{ fontSize: '15px' }}>
        {invite.space.description}
      </Text.Body>
    </Flex>
    <Button.Primary
      width="100%"
      maxWidth="216px"
      justifyContent="center"
      borderRadius="10px"
      style={{ padding: '8px', fontWeight: 500 }}
    >
      Join
    </Button.Primary>
  </InviteCardContainer>
);
