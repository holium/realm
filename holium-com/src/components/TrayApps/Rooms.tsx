import { useEffect, useState } from 'react';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';
import { TrayApp } from '@holium/design-system/os';

import { rooms } from '../../spaces';
import { SpaceKeys } from '../../types';
import { CommButton } from '../CommButton';
import { RoomSpeaker } from '../RoomSpeaker';

type ChatAppProps = {
  isOpen: boolean;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  currentSpace: SpaceKeys;
  closeTray: () => void;
  setCurrentSpace: (space: SpaceKeys) => void;
};

const position = 'top-left';
const anchorOffset = { x: -4, y: 16 };
const dimensions = { height: 550, width: 380 };

export const roomConfig = {
  position,
  anchorOffset,
  dimensions,
};

export const RoomApp = ({
  isOpen = false,
  closeTray,
  coords,
  currentSpace,
}: ChatAppProps) => {
  const [muted, setMuted] = useState(false);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    setMuted(false);
    setRoom(rooms[currentSpace]);
  }, [currentSpace]);

  return (
    <TrayApp
      id="rooms-tray"
      isOpen={isOpen}
      coords={coords}
      closeTray={closeTray}
    >
      <>
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Flex gap={10} justifyContent="center" alignItems="center">
            <Button.IconButton
              style={{ pointerEvents: 'none' }}
              size={26}
              onClick={(evt: any) => {
                evt.stopPropagation();
                // roomsApp.setView('list')
              }}
            >
              <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
            </Button.IconButton>
            <Flex flexDirection="column">
              <Text.Custom
                fontSize={2}
                fontWeight={600}
                opacity={0.8}
                style={{
                  wordWrap: 'normal',
                  textOverflow: 'ellipsis',
                  textTransform: 'uppercase',
                }}
              >
                {room?.roomName}
              </Text.Custom>
              <Flex mt="2px">
                <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
                  ~lomder-librun
                </Text.Custom>
                <Text.Custom
                  mx="6px"
                  fontSize={2}
                  fontWeight={400}
                  opacity={0.5}
                >
                  •
                </Text.Custom>
                <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
                  {`${room?.present.length} people`}
                </Text.Custom>
              </Flex>
            </Flex>
          </Flex>
          <Flex gap={12}></Flex>
        </Flex>
        <Flex flex={1} height={430}>
          <Flex
            flex={2}
            gap={12}
            py={2}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridAutoColumns: '1fr',
              gridAutoRows: '.5fr',
            }}
          >
            {room?.present.map((metadata: any) => (
              <RoomSpeaker
                key={metadata.nickname}
                type="speaker"
                metadata={metadata}
              />
            ))}
          </Flex>
        </Flex>
        <Flex
          px={1}
          pb={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex alignItems="center">
            <Button.IconButton
              style={{ pointerEvents: 'none' }}
              className="realm-cursor-hover"
              size={26}
              onClick={(evt: any) => {
                evt.stopPropagation();
                // if (presentRoom.creator === ship!.patp) {
                //   roomsManager?.deleteRoom(rid)
                // } else {
                //   roomsManager?.leaveRoom()
                // }
              }}
            >
              <Icon name="RoomLeave" size={22} opacity={0.7} />
            </Button.IconButton>
          </Flex>
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
            <CommButton
              icon={muted ? 'MicOff' : 'MicOn'}
              onClick={(evt: any) => {
                evt.stopPropagation();
                if (muted) {
                  setMuted(false);
                } else {
                  setMuted(true);
                }
              }}
            />
          </Flex>
          <Flex alignItems="center">
            <Button.IconButton
              style={{ pointerEvents: 'none' }}
              className="realm-cursor-hover"
              size={26}
              // customColor={roomView === 'chat' ? accentColor : undefined}
              onClick={(evt) => {
                evt.stopPropagation();
                // roomView === 'chat' ? setRoomView('voice') : setRoomView('chat')
              }}
            >
              <Icon name="Chat3" size={22} opacity={0.7} />
            </Button.IconButton>
          </Flex>
        </Flex>
      </>
    </TrayApp>
  );
};
