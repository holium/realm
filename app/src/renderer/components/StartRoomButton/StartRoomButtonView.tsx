import styled from 'styled-components';

import {
  AvatarRow,
  Button,
  ContactData,
  Flex,
  Text,
} from '@holium/design-system/general';

import { StartRoomSvg } from './StartRoomSvg';

const PillContainer = styled(Flex)`
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 5px 6px;
  background-color: rgba(var(--rlm-accent-rgba), 0.12);
  border-radius: 999px;
`;
type StartRoomButtonState = 'start' | 'join' | 'leave';

const buttonCopy: Record<StartRoomButtonState, string> = {
  start: 'Start room',
  join: 'Join',
  leave: 'Leave',
};

type Props = {
  state: StartRoomButtonState;
  participants: ContactData[];
  onClick: () => void;
};

export const StartRoomButtonView = ({
  state,
  participants,
  onClick,
}: Props) => {
  const firstThreeParticipants = participants.slice(0, 3);
  const remainingParticipants = participants.slice(3);

  return (
    <PillContainer>
      <Flex gap="8px" alignItems="center">
        <Button.Primary
          style={{
            fontWeight: 500,
            color:
              state === 'leave'
                ? 'var(--rlm-intent-alert-color)'
                : 'var(--rlm-accent-color)',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
          }}
          onClick={onClick}
        >
          {buttonCopy[state]}
        </Button.Primary>
        {state !== 'start' && participants.length > 0 && (
          <AvatarRow
            people={firstThreeParticipants}
            size={24}
            offset={6}
            borderRadiusOverride="5px"
            // border="1px solid #E0EAF5"
          />
        )}
        {remainingParticipants.length > 0 && (
          <Text.Body
            style={{
              color: 'var(--rlm-accent-color)',
            }}
          >
            +{remainingParticipants.length}
          </Text.Body>
        )}
      </Flex>
      <StartRoomSvg />
    </PillContainer>
  );
};
