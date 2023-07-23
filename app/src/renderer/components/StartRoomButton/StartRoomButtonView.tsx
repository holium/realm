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
  isStandaloneChat: boolean;
  onClickButton: () => void;
  onClickAvatar: () => void;
};

export const StartRoomButtonView = ({
  state,
  participants,
  isStandaloneChat,
  onClickButton,
  onClickAvatar,
}: Props) => {
  const firstThreeParticipants = participants.slice(0, 3);
  const remainingParticipants = participants.slice(3);

  // Just show first word in docked mode.
  const copy = isStandaloneChat
    ? buttonCopy[state]
    : buttonCopy[state].split(' ')[0];

  // We don't show AvatarRow in docked mode since we have the Rooms Dock.
  const showAvatarRow =
    state !== 'start' && participants.length > 0 && isStandaloneChat;
  const showPlus = remainingParticipants.length > 0;

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
            backgroundColor: 'var(--rlm-input-color)',
          }}
          onClick={onClickButton}
        >
          {copy}
        </Button.Primary>
        {(showAvatarRow || showPlus) && (
          <Flex
            alignItems="center"
            style={{ cursor: state !== 'start' ? 'pointer' : 'auto' }}
            onClick={onClickAvatar}
          >
            {showAvatarRow && (
              <AvatarRow
                people={firstThreeParticipants}
                size={24}
                offset={6}
                borderRadiusOverride="5px"
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
        )}
      </Flex>
      <Flex
        style={{ cursor: state !== 'start' ? 'pointer' : 'auto' }}
        onClick={onClickAvatar}
        mr={1}
      >
        <StartRoomSvg />
      </Flex>
    </PillContainer>
  );
};
