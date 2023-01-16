import { FC, useState } from 'react';
import styled from 'styled-components';
import { Flex, Icon, Text } from '../..';
import { BarButton } from '../SystemBar/BarButton';
import { AvatarRow } from '../../general/Avatar/AvatarRow';

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
  rooms?: any[];
};

export const RoomsDock: FC<RoomsDockProps> = (props: RoomsDockProps) => {
  const { live, rooms = [] } = props;
  const [muted, setMuted] = useState(false);

  let innerContent = null;
  if (live) {
    innerContent = (
      <>
        <Flex flexDirection="column" gap={1}>
          <Text.Custom fontWeight={500} fontSize={0}>
            {live.title}
          </Text.Custom>
          <Flex gap={6} alignItems="center">
            <AvatarRow
              people={live.present}
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
                setMuted(!muted);
              }}
            >
              <Icon
                iconColor={muted ? 'red' : 'currentcolor'}
                name={muted ? 'Unmute' : 'Mute'}
                size={24}
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
              }}
            >
              <Icon name="MultiplayerOn" size={24} />
            </BarButton> */}
          </Flex>
        </Flex>
      </>
    );
  } else {
    let roomsList = null;
    if (rooms.length > 0) {
      roomsList = rooms.map((room) => <div key={room.rid}>{room.title}</div>);
    }
    innerContent = (
      <>
        <Flex gap={8} alignItems="center">
          <Icon name="Connect" size={20} />
          <Flex flexDirection="column" gap={1}>
            <Text.Custom fontSize={0} opacity={0.7}>
              No rooms
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex>
          <BarButton id="rooms-button" height={22} width={22}>
            <Icon name="Plus" size={18} opacity={0.5} />
          </BarButton>
        </Flex>
      </>
    );
  }
  return <RoomsDockStyle>{innerContent}</RoomsDockStyle>;
};
// {muted ? (
//   <Icon name="Unmute" color size={24} />
// ) : (
//   <Icon name="Mute" size={24} />
// )}
