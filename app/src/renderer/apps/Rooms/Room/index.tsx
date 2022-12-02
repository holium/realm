import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/theme.model';
import { rgba } from 'polished';
import { Flex, Grid, IconButton, Icons, Text } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { CommButton } from '../components/CommButton';
import { VoiceView } from './Voice';
import { RoomChat } from './Chat';
import { RoomInvite } from './Invite';
import { RoomInfo } from './Info';
import { useRooms } from '../useRooms';

export interface BaseRoomProps {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
}

type RoomViews = 'voice' | 'chat' | 'invite' | 'info';

export const Room: FC<BaseRoomProps> = observer((props: BaseRoomProps) => {
  const { dimensions } = props;
  const { ship, theme } = useServices();
  const { roomsApp } = useTrayApps();
  const roomsManager = useRooms();

  const { dockColor, windowColor, accentColor, inputColor, textColor } =
    theme.currentTheme;
  const [roomView, setRoomView] = useState<RoomViews>('voice');
  const muted = roomsManager.protocol.local?.isMuted;

  const presentRoom = useMemo(() => {
    if (!roomsManager) return;
    if (!roomsManager.presentRoom) return;
    return roomsManager.presentRoom.room;
  }, [roomsManager?.presentRoom]);

  useEffect(() => {
    if (!presentRoom) roomsApp.setView('list');
  }, [presentRoom, roomsApp]);

  if (!presentRoom) return <div />;
  const { present, rid, creator } = presentRoom;
  const creatorStr =
    presentRoom.creator.length > 14
      ? `${presentRoom.creator.substring(0, 14)}...`
      : presentRoom.creator;

  let peopleText = 'people';
  if (present.length === 1) {
    peopleText = 'person';
  }
  // console.log(toJS(roomsApp.liveRoom));
  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder={false}
        zIndex={5}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
        <Flex
          mt={2}
          gap={10}
          ml={3}
          mr={2}
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
            className="realm-cursor-hover"
            size={26}
            style={{ cursor: 'none' }}
            customBg={dockColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomsApp.setView('list');
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
          <Flex flexDirection="column">
            <Text
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
            </Text>
            <Flex mt="2px">
              <Text fontSize={2} fontWeight={400} opacity={0.5}>
                {creatorStr}
              </Text>
              <Text mx="6px" fontSize={2} fontWeight={400} opacity={0.5}>
                •
              </Text>
              <Text fontSize={2} fontWeight={400} opacity={0.5}>
                {`${presentRoom.present.length} ${peopleText}`}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={12} ml={1} pl={2} pr={2}>
          <IconButton
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
          </IconButton>
          <IconButton
            className="realm-cursor-hover"
            size={26}
            style={{ cursor: 'none' }}
            color={roomView === 'info' ? accentColor : undefined}
            onClick={(evt: any) => {
              evt.stopPropagation();
              console.log('clicked room info button');
              roomView === 'info' ? setRoomView('voice') : setRoomView('info');
            }}
          >
            <Icons name="InfoCircle" />
          </IconButton>
        </Flex>
      </Titlebar>
      <Flex
        position="relative"
        style={{ marginTop: 54 }}
        flex={1}
        flexDirection="column"
      >
        {roomView === 'voice' && (
          <VoiceView host={creator} present={present} audio={null} />
        )}
        {roomView === 'chat' && <RoomChat />}
        {roomView === 'invite' && <RoomInvite />}
        {roomView === 'info' && <RoomInfo />}
        <Flex
          pb={16}
          pl={1}
          pr={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex alignItems="center">
            <IconButton
              className="realm-cursor-hover"
              size={26}
              color={
                presentRoom.creator === ship!.patp
                  ? rgba('#E56262', 0.7)
                  : undefined
              }
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
                roomsManager.leaveRoom(rid);
              }}
            >
              <Icons name="RoomLeave" />
            </IconButton>
          </Flex>
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
            <CommButton
              icon={muted ? 'MicOff' : 'MicOn'}
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
                if (muted) {
                  console.log('unmuting time');
                  roomsManager!.presentRoom!.unmute();
                } else {
                  console.log('muting time');
                  roomsManager!.presentRoom!.mute();
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
            <IconButton
              className="realm-cursor-hover"
              size={26}
              customBg={dockColor}
              color={roomView === 'chat' ? accentColor : undefined}
              onClick={(evt: any) => {
                evt.stopPropagation();
                roomView === 'chat'
                  ? setRoomView('voice')
                  : setRoomView('chat');
              }}
            >
              <Icons name="Chat3" />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    </Grid.Column>
  );
});
