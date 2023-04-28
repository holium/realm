import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { darken } from 'polished';

import { Button, CommButton, Flex, Icon, Text } from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { Badge } from 'renderer/components';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { RoomInvite } from './Invite';
import { RoomChat } from './NewChat';
import { VoiceView } from './Voice';

type RoomViews = 'voice' | 'chat' | 'invite' | 'info';

const RoomPresenter = () => {
  const { theme, shellStore } = useAppState();
  const { ship, roomsStore } = useShipStore();
  const { roomsApp } = useTrayApps();

  const { dockColor, mode } = theme;
  const [roomView, setRoomView] = useState<RoomViews>('voice');
  const isMuted = roomsStore.isMuted;
  const commButtonBg =
    mode === 'light' ? darken(0.04, dockColor) : darken(0.01, dockColor);

  const presentRoom = useMemo(() => {
    if (!roomsStore.current) return;
    return roomsStore.current;
  }, [roomsStore.current]);

  const [readChat, setReadChat] = useState(
    roomsStore.chat?.lastMessage?.contents
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const latestChat = roomsStore.chat?.lastMessage?.contents;
    if (roomView === 'chat') {
      setReadChat(latestChat);
      setUnreadCount(0);
    } else {
      setUnreadCount(
        latestChat
          ? latestChat.filter(
              (msg: any) =>
                !readChat?.includes(msg) && msg.author !== ship?.patp
            ).length
          : 0
      );
    }
  }, [roomView, roomsStore.chat?.messages.length]);

  useEffect(() => {
    if (!presentRoom) roomsApp.setView('list');
  }, [presentRoom, roomsApp]);

  if (!presentRoom) return <div />;
  const { rid, creator } = presentRoom;
  const presentCount = presentRoom?.present?.length ?? 0;
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
              {presentRoom.title}
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
                presentRoom.creator === ship?.patp ? 'intent-alert' : undefined
              }
              onClick={(evt) => {
                evt.stopPropagation();
                if (presentRoom.creator === ship?.patp) {
                  roomsStore.deleteRoom(rid);
                } else {
                  roomsStore.leaveRoom();
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
              icon={isMuted ? 'MicOff' : 'MicOn'}
              customBg={commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
                if (isMuted) {
                  roomsStore?.unmute();
                } else {
                  roomsStore?.mute();
                }
              }}
            />
            <CommButton
              icon={shellStore.multiplayerEnabled ? 'MouseOn' : 'MouseOff'}
              customBg={commButtonBg}
              onClick={shellStore.toggleMultiplayer}
            />
            {/* <CommButton
              icon="HeadphoneLine"
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
              }}
            /> */}
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
