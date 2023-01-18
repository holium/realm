import { FC } from 'react';
import styled from 'styled-components';
import { Flex, Icon, Text } from '../..';
import { BarButton } from '../SystemBar/BarButton';
import { AvatarRow, ContactData } from '../../general/Avatar/AvatarRow';
import { pluralize } from '../../util/utils';

export const RoomsDockStyle = styled(Flex)<any>`
  transition: var(--transition);
  height: 34px;
  width: 200px;
  flex-basis: 200px;
  align-items: center;
  justify-content: space-between;
  padding: 3px 3px 3px 5px;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--rlm-border-radius-4);
  background-color: var(--rlm-overlay-hover);
  box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.25);

  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-hover);
  }
  &:active:not([disabled]):not(:focus-within) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-active);
  }
`;

type RoomsDockProps = {
  live: any;
  participants: ContactData[];
  rooms?: any[];
  isMuted?: boolean;
  onCreate: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onOpen: (evt: React.MouseEvent<HTMLDivElement>) => void;
  onMute: (muted: boolean) => void;
  onCursor: (enabled: boolean) => void;
  onLeave: () => void;
  children?: React.ReactNode;
};

export const RoomsDock: FC<RoomsDockProps> = (props: RoomsDockProps) => {
  const {
    live,
    rooms = [],
    isMuted,
    onCreate,
    onOpen,
    onMute,
    onCursor,
    onLeave,
    participants = [],
  } = props;

  let innerContent = null;
  if (live) {
    innerContent = (
      <>
        <Flex pointerEvents="none" flexDirection="column" gap={1}>
          <Text.Custom
            fontWeight={500}
            fontSize={1}
            width={148}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {live.title}
          </Text.Custom>
          <Flex gap={6} alignItems="center">
            <AvatarRow
              people={participants}
              size={13}
              borderRadiusOverride={'2px'}
              offset={2}
            />
            <Text.Hint
              opacity={0.7}
            >{`${live.present.length}/${live.capacity}`}</Text.Hint>
          </Flex>
        </Flex>
        <Flex>
          <Flex
            id="room-controls"
            gap={4}
            alignItems="center"
            justifyContent="flex-end"
          >
            <BarButton
              height={28}
              width={28}
              onFocus={(evt: React.FocusEvent<HTMLButtonElement>) => {
                evt.preventDefault();
                evt.stopPropagation();
              }}
              onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
                evt.preventDefault();
                evt.stopPropagation();
                onMute(!isMuted);
              }}
            >
              <Icon
                iconColor={isMuted ? 'red' : 'currentcolor'}
                name={isMuted ? 'Unmute' : 'Mute'}
                size={26}
              />
            </BarButton>
            {/* <BarButton
              height={28}
              width={28}
              onFocus={(evt: React.FocusEvent<HTMLButtonElement>) => {
                evt.preventDefault();
                evt.stopPropagation();
              }}
              onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
                evt.preventDefault();
                evt.stopPropagation();
                console.log('MultiplayerOn');
                onCursor(!cursorEnabled);
              }}
            >
              <Icon name="MultiplayerOn" size={24} />
            </BarButton> */}
          </Flex>
        </Flex>
      </>
    );
  } else {
    innerContent = (
      <>
        <Flex pointerEvents="none" gap={12} alignItems="center">
          <Icon name="Connect" size={20} />
          <Flex flexDirection="column" gap={1}>
            {rooms.length > 0 ? (
              <Text.Custom fontSize={2}>
                {rooms.length} {pluralize('room', rooms.length)}
              </Text.Custom>
            ) : (
              <Text.Custom fontSize={2} opacity={0.7}>
                No rooms
              </Text.Custom>
            )}
          </Flex>
        </Flex>
        <Flex>
          {/* <BarButton
            id="rooms-button"
            height={22}
            width={22}
            onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
              evt.stopPropagation();
              onCreate(evt);
            }}
          >
            <Icon name="Plus" size={18} opacity={0.5} pointerEvents="none" />
          </BarButton> */}
        </Flex>
      </>
    );
  }
  return (
    <RoomsDockStyle
      id="rooms-tray-icon"
      onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
        onOpen(evt);
      }}
    >
      {innerContent}
    </RoomsDockStyle>
  );
};
