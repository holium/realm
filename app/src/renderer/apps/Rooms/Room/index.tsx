import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import { Badge } from 'renderer/components';
import { CommButton, Flex, Button, Icon, Text } from '@holium/design-system';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { VoiceView } from './Voice';
import { RoomChat } from './Chat';
import { RoomInvite } from './Invite';
import { useRooms } from '../useRooms';

type RoomViews = 'voice' | 'chat' | 'invite' | 'info';

const RoomPresenter = () => {
  const { ship, theme } = useServices();
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms(ship?.patp);

  const { dockColor, accentColor, mode } = theme.currentTheme;
  const [roomView, setRoomView] = useState<RoomViews>('voice');
  const muted = roomsManager?.protocol.local?.isMuted;

  const presentRoom = useMemo(() => {
    if (!roomsManager?.live.room) return;
    return roomsManager?.live.room;
  }, [roomsManager?.live.room]);

  const [readChat, setReadChat] = useState(roomsManager?.live.chat.slice());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const latestChat = roomsManager?.live.chat.slice();
    if (roomView === 'chat') {
      setReadChat(latestChat);
      setUnreadCount(0);
    } else {
      setUnreadCount(
        latestChat
          ? latestChat.filter(
              (msg) => !readChat?.includes(msg) && msg.author !== ship?.patp
            ).length
          : 0
      );
    }
  }, [roomView, roomsManager?.live.chat.length]);

  useEffect(() => {
    if (!presentRoom) roomsApp.setView('list');
  }, [presentRoom, roomsApp]);

  if (!presentRoom) return <div />;
  const { rid, creator } = presentRoom;
  const presentCount = (roomsManager?.protocol.peers.size ?? 0) + 1; // to include self
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
              size={26}
              customColor={
                presentRoom.creator === ship?.patp ? '#E56262' : undefined
              }
              onClick={(evt) => {
                evt.stopPropagation();
                if (presentRoom.creator === ship?.patp) {
                  roomsManager?.deleteRoom(rid);
                } else {
                  roomsManager?.leaveRoom();
                }
              }}
            >
              <Icon name="RoomLeave" size={22} opacity={0.7} />
            </Button.IconButton>
          </Flex>
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
            <CommButton
              icon={muted ? 'MicOff' : 'MicOn'}
              customBg={
                mode === 'light'
                  ? darken(0.04, dockColor)
                  : darken(0.01, dockColor)
              }
              onClick={(evt: any) => {
                evt.stopPropagation();
                if (muted) {
                  roomsManager?.unmute();
                } else {
                  roomsManager?.mute();
                }
              }}
            />
            {/* <CommButton
              icon="CursorOn"
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
              }}
            /> */}
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
                size={26}
                customColor={roomView === 'chat' ? accentColor : undefined}
                onClick={(evt) => {
                  evt.stopPropagation();
                  roomView === 'chat'
                    ? setRoomView('voice')
                    : setRoomView('chat');
                }}
              >
                <Icon name="Chat3" size={22} opacity={0.7} />
              </Button.IconButton>
            </Badge>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export const Room = observer(RoomPresenter);
