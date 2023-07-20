import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  CommButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { MediaAccess } from 'os/types';
import { useTrayApps } from 'renderer/apps/store';
import { Badge } from 'renderer/components';
import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';

import { useRoomsStore } from '../store/RoomsStoreContext';
import { RoomChat } from './Chat';
import { RoomInvite } from './Invite';
import { VoiceView } from './Voice';

type RoomViews = 'voice' | 'chat' | 'invite' | 'info';

const RoomPresenter = () => {
  const { loggedInAccount, shellStore } = useAppState();
  const roomsStore = useRoomsStore();
  const { roomsApp } = useTrayApps();
  const [mediaAccessStatus, setMediaAccessStatus] = useState<MediaAccess>({
    camera: 'granted',
    mic: 'granted',
    screen: 'granted',
  });

  const [roomView, setRoomView] = useState<RoomViews>('voice');
  const isMuted = roomsStore.ourPeer.isMuted;
  const hasVideo = roomsStore.ourPeer.isVideoOn;
  const isScreenSharing = roomsStore.ourPeer.isScreenSharing;

  useEffect(() => {
    trackEvent('OPENED', 'ROOMS_VOICE');
    MainIPC.getMediaStatus().then((status: MediaAccess) => {
      setMediaAccessStatus(status);
    });
  }, []);

  const [readChat, setReadChat] = useState(roomsStore.chat.slice());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const latestChat = roomsStore.chat.slice();
    if (roomView === 'chat') {
      setReadChat(latestChat);
      setUnreadCount(0);
    } else {
      setUnreadCount(
        latestChat
          ? latestChat.filter(
              (msg) =>
                !readChat?.includes(msg) &&
                msg.author !== loggedInAccount?.serverId
            ).length
          : 0
      );
    }
  }, [roomView, roomsStore.chat.length]);

  useEffect(() => {
    if (!roomsStore.currentRid) roomsApp.setView('list');
  }, [roomsStore.currentRid, roomsApp]);

  if (!roomsStore.currentRid) return <div />;

  const presentRoom = roomsStore.rooms.get(roomsStore.currentRid);
  if (!presentRoom) return <div />;
  const { rid, creator, present, title } = presentRoom;
  const presentCount = present?.length ?? 0;
  const creatorStr =
    creator.length > 14 ? `${creator.substring(0, 14)}...` : creator;

  let peopleText = 'people';
  if (presentCount === 1) {
    peopleText = 'person';
  }

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Flex gap={10} justifyContent="center" alignItems="center">
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomsApp.setView('list');
            }}
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
                {`${presentCount} ${peopleText}`}
              </Text.Custom>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={12}>
          {/* <IconButton
            className="realm-cursor-hover"
            size={26}
            customBg={dockColor}
            color={roomView === 'invite' ? accentColor : undefined}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomView === 'invite'
                ? setRoomView('voice')
                : setRoomView('invite');
              // RoomsActions.invite(id, '~dev'); // TODO invite a custom ship, ~dev is for testing purposes
            }}
          >
            <Icons name="UserAdd" />
          </IconButton> */}
          {/* <IconButton
            className="realm-cursor-hover"
            size={26}
            color={roomView === 'info' ? accentColor : undefined}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomView === 'info' ? setRoomView('voice') : setRoomView('info');
            }}
          >
            <Icons name="InfoCircle" />
          </IconButton> */}
        </Flex>
      </Flex>
      <Flex position="relative" flex={1} flexDirection="column">
        {roomView === 'voice' && <VoiceView />}
        {roomView === 'chat' && <RoomChat />}
        {roomView === 'invite' && <RoomInvite />}
        <Flex
          position="absolute"
          width="100%"
          left={0}
          bottom={0}
          right={0}
          zIndex={5}
          px={1}
          pb={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex alignItems="center">
            <Button.IconButton
              className="realm-cursor-hover"
              size={30}
              showOnHover
              iconColor={
                creator === loggedInAccount?.serverId
                  ? 'intent-alert'
                  : undefined
              }
              onClick={(evt) => {
                evt.stopPropagation();
                if (creator === loggedInAccount?.serverId) {
                  roomsStore.deleteRoom(rid);
                  roomsApp.setView('list');
                } else {
                  roomsStore.leaveRoom(rid);
                  roomsApp.setView('list');
                }
              }}
            >
              <Icon
                name="RoomLeave"
                fill="intent-alert"
                size={22}
                opacity={0.9}
              />
            </Button.IconButton>
          </Flex>
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
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
              tooltip="Multiplayer mode"
              icon={shellStore.multiplayerEnabled ? 'MouseOn' : 'MouseOff'}
              onClick={shellStore.toggleMultiplayer}
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
          </Flex>
          <Flex alignItems="center">
            <Badge
              wrapperHeight={26}
              wrapperWidth={26}
              top={1}
              right={1}
              minimal
              count={unreadCount}
            >
              <Button.IconButton
                className="realm-cursor-hover"
                size={30}
                showOnHover
                iconColor={roomView === 'chat' ? 'accent' : 'icon'}
                onClick={(evt) => {
                  evt.stopPropagation();
                  roomView === 'chat'
                    ? setRoomView('voice')
                    : setRoomView('chat');
                }}
              >
                <Icon name="Chat3" size={22} opacity={0.9} />
              </Button.IconButton>
            </Badge>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export const Room = observer(RoomPresenter);
