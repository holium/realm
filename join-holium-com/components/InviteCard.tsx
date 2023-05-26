import React from 'react';
import { Space, SpaceInvite } from '@prisma/client';
import Link from 'next/link';
import styled from 'styled-components';

import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

export const InviteCardContainer = styled(Flex)`
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

const SpacePictureContainer = styled.div<{ color: string }>`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background-color: ${({ color }) => color};
  overflow: hidden;
`;

const SpacePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

type Props = {
  invite: SpaceInvite & {
    space: Space;
  };
};

export const InviteCard = ({ invite }: Props) => {
  const joining = useToggle(false);
  const dontHaveRealm = useToggle(false);

  const onClickJoin = () => {
    joining.toggleOn();
    // Open alert that tries to open deeplink to realm.
    const base = 'realm://';
    const param = `join-${invite.space.path}`;
    window.location.href = `${base}${param}`;

    setTimeout(() => {
      joining.toggleOff();
      dontHaveRealm.toggleOn();
    }, 1000);
  };

  return (
    <InviteCardContainer>
      <Flex flexDirection="column" gap="20px" alignItems="center">
        <SpacePictureContainer color={invite.space.color}>
          {invite.space.picture && (
            <SpacePicture src={invite.space.picture} alt={invite.space.name} />
          )}
        </SpacePictureContainer>
        <Flex flexDirection="column" gap="8px" alignItems="center">
          <Text.H1 style={{ fontSize: '20px' }}>{invite.space.name}</Text.H1>
          <Flex gap="6px" alignItems="center">
            <Icon name="Members" size={14} />
            <Text.Body opacity={0.5} style={{ fontSize: '14px' }}>
              {invite.space.membersCount} members
            </Text.Body>
          </Flex>
        </Flex>
        <Text.Body
          opacity={0.5}
          textAlign="center"
          style={{ fontSize: '15px' }}
        >
          {invite.space.description}
        </Text.Body>
      </Flex>
      <Flex width="100%" flexDirection="column" gap="16px" alignItems="center">
        <Button.Primary
          width="100%"
          maxWidth="216px"
          height="40px"
          alignItems="center"
          justifyContent="center"
          borderRadius="10px"
          style={{ fontWeight: 500 }}
          onClick={onClickJoin}
        >
          {joining.isOn ? <Spinner size={0} /> : 'Join'}
        </Button.Primary>
        {dontHaveRealm.isOn && (
          <Text.Body
            opacity={0.5}
            textAlign="center"
            style={{ fontSize: '12px' }}
          >
            Trouble joining?{' '}
            <Link
              style={{
                color: 'inherit',
              }}
              href="https://holium.com"
            >
              Download Realm
            </Link>
          </Text.Body>
        )}
      </Flex>
    </InviteCardContainer>
  );
};
