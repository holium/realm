import { MouseEvent, useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  Card,
  CommButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { MediaAccess } from 'os/types';
import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { VoiceView } from '../Rooms/Room/Voice';
import { Settings } from '../Rooms/Settings';
import { useRoomsStore } from '../Rooms/store/RoomsStoreContext';

const StandaloneChatRoomPresenter = () => {
  const { loggedInAccount } = useAppState();
  const roomsStore = useRoomsStore();
  const { chatStore } = useShipStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mediaAccessStatus, setMediaAccessStatus] = useState<MediaAccess>({
    camera: 'granted',
    mic: 'granted',
    screen: 'granted',
  });

  const isMuted = roomsStore.ourPeer.isMuted;
  const hasVideo = roomsStore.ourPeer.isVideoOn;
  const isScreenSharing = roomsStore.ourPeer.isScreenSharing;

  useEffect(() => {
    trackEvent('OPENED', 'ROOMS_VOICE');
    MainIPC.getMediaStatus().then((status: MediaAccess) => {
      setMediaAccessStatus(status);
    });
  }, []);

  const presentRoom = roomsStore.getRoomByPath(
    chatStore.selectedChat?.path ?? ''
  );

  if (!presentRoom) return <div />;

  const { rid, creator, present, title } = presentRoom;
  const presentCount = present?.length ?? 0;
  const creatorStr =
    creator.length > 14 ? `${creator.substring(0, 14)}...` : creator;

  const onClickLeaveRoom = (e: MouseEvent) => {
    e.stopPropagation();

    chatStore.setSubroute('chat');
    roomsStore.leaveRoom(rid);

    // Delete room if we're the creator or the last person in the room.
    if (creator === loggedInAccount?.serverId || presentCount === 0) {
      roomsStore.deleteRoom(rid);
    }
  };

  return (
    <Flex position="relative" flex={1} flexDirection="column" width="100%">
      <Flex
        alignItems="center"
        height="58px"
        gap={10}
        padding="0 12px"
        background="var(--rlm-window-color)"
        borderBottom="1px solid var(--rlm-base-color)"
      >
        <Button.IconButton
          size={26}
          onClick={() => chatStore.setSubroute('chat')}
        >
          <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
        </Button.IconButton>
        <Flex flexDirection="column">
          <Text.Custom
            fontSize={3}
            fontWeight={600}
            opacity={0.8}
            style={{
              wordWrap: 'normal',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text.Custom>
          <Flex mt="2px">
            <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
              {creatorStr}
            </Text.Custom>
            <Text.Custom mx="6px" fontSize={2} fontWeight={400} opacity={0.5}>
              •
            </Text.Custom>
            <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
              {`${presentCount} ${presentCount === 1 ? 'person' : 'people'}`}
            </Text.Custom>
          </Flex>
        </Flex>
      </Flex>
      <Flex position="relative" flex={1} flexDirection="column">
        <Card
          zIndex={100}
          elevation={2}
          p={3}
          style={{
            position: 'absolute',
            height: 370,
            width: 350,
            bottom: 70,
            right: 'calc(50% - 112px)',
            transform: 'translateX(50%)',
            display: isSettingsOpen ? 'inline-block' : 'none',
          }}
        >
          <Settings maxWidth={330} showBackButton={false} />
        </Card>
        <Flex flex={1}>
          <VoiceView isStandaloneChat />
        </Flex>
        <Flex
          width="100%"
          height="65px"
          zIndex={5}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          background="var(--rlm-window-color)"
          borderTop="1px solid var(--rlm-base-color)"
          px={1}
          pb={1}
        >
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
            <CommButton
              icon="RoomLeave"
              tooltip="Leave room"
              size={22}
              customBg="intent-alert"
              onClick={onClickLeaveRoom}
            />
            <CommButton
              tooltip="Microphone"
              icon={isMuted ? 'MicOff' : 'MicOn'}
              isDisabled={mediaAccessStatus.mic !== 'granted'}
              onClick={(evt) => {
                evt.stopPropagation();
                if (isMuted) {
                  roomsStore.ourPeer.unmute();
                } else {
                  roomsStore.ourPeer.mute();
                }
              }}
            />
            <CommButton
              tooltip="Camera"
              icon={hasVideo ? 'VideoOn' : 'VideoOff'}
              isDisabled={mediaAccessStatus.camera !== 'granted'}
              onClick={() => {
                roomsStore.toggleVideo(!hasVideo);
              }}
            />
            <CommButton
              tooltip="Screen sharing"
              icon={isScreenSharing ? 'ScreenSharing' : 'ScreenSharingOff'}
              isDisabled={mediaAccessStatus.screen !== 'granted'}
              onClick={() => {
                roomsStore.toggleScreenShare(!isScreenSharing);
              }}
            />
            <CommButton
              tooltip={null}
              size={22}
              icon="AudioControls"
              customBg={isSettingsOpen ? 'input' : undefined}
              onClick={() => {
                if (isSettingsOpen) {
                  setIsSettingsOpen(false);
                } else {
                  setIsSettingsOpen(true);
                }
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const StandaloneChatRoom = observer(StandaloneChatRoomPresenter);
