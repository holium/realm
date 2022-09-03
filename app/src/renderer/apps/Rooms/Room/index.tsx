import { FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { rgba } from 'polished';
import { toJS } from 'mobx';
import { ContextMenu, Flex, Grid, IconButton, Icons, Text } from 'renderer/components';
import { LiveRoom, useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { CommButton } from '../components/CommButton';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { pluralize } from 'renderer/logic/lib/text';
import { VoiceView } from './Voice';
import { RoomChat } from './Chat';
import { RoomInvite } from './Invite';
import { RoomInfo } from './Info';
import { handleLocalEvents } from '../listeners';
import Portal from 'renderer/system/dialog/Portal';
import { AnimatePresence } from 'framer-motion';
import theme from 'renderer/theme';

export type BaseRoomProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

type RoomViews = 'voice' | 'chat' | 'invite' | 'info';

export const Room: FC<BaseRoomProps> = observer((props: BaseRoomProps) => {
  const { dimensions } = props;
  const { ship, desktop } = useServices();
  const { roomsApp } = useTrayApps();

  const { dockColor, windowColor, accentColor, inputColor, textColor } = desktop.theme;
  const [roomView, setRoomView] = useState<RoomViews>('voice');
  const { muted } = roomsApp.controls;
  // const [muted, setMuted] = useState(false);
  // const [cursors, setCursors] = useState(true);

  // const [displayInfo, setDisplayInfo] = useState(false);

  useEffect(() => {
    handleLocalEvents(
      RoomsActions.setMuted,
      RoomsActions.setCursors,
      LiveRoom.our
    );
  }, []);

  // const getMicrophone = async () => {
  //   LiveRoom.our.audio?.unmute();
  //   const track = await LiveRoom.our.setMicrophoneEnabled(true);
  //   console.log(track);
  //   // const audioMedia = await navigator.mediaDevices.getUserMedia({
  //   //   audio: true,
  //   //   video: false,
  //   // });
  //   // setAudio(audioMedia);
  // };

  // const stopMicrophone = () => {
  //   LiveRoom.our.audio?.mute();
  //   audio?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  //   setAudio(null);
  // };

  // useEffect(() => {
  //   window.electron.app.askForMicrophone().then((hasMic: any) => {
  //    console.log('hasMic', hasMic);
  //   });
  // }, []);

  // TODO exit routine
  // // logout on window close or refresh
  // useEffect(() => {
  //   window.addEventListener("beforeunload", logout);
  //   return () => {
  //     window.removeEventListener("beforeunload", logout);
  //   };
  // }, []);
  // //

  useEffect(() => {
    if (!roomsApp.liveRoom) RoomsActions.setView('list');
  }, [roomsApp.liveRoom]);

  if (!roomsApp.liveRoom) return <div />;
  const { present, id, creator } = roomsApp.liveRoom;
  const creatorStr =
    roomsApp.liveRoom?.creator.length > 14
      ? `${roomsApp.liveRoom?.creator.substring(0, 14)}...`
      : roomsApp.liveRoom?.creator;

      let peopleText = 'people';
      if (present!.length === 1) {
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
        <Flex pl={3} pr={4} mr={3}
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
              RoomsActions.setView('list');
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
          <Flex ml={2} flexDirection="column">
            <Text
              fontSize={2}
              fontWeight={600}
              style={{
                wordWrap: 'normal',
                textOverflow: 'ellipsis',
                textTransform: 'uppercase',
              }}
            >
              {roomsApp.liveRoom?.title}
            </Text>
             
            <Flex>
              {/* <Text fontSize={2} fontWeight={400} opacity={0.7}>
                {creatorStr}
              </Text>
              <Text mx="6px" fontSize={2} fontWeight={400} opacity={0.7}>
                •
              </Text> */}
              <Text fontSize={2} fontWeight={400} opacity={0.7}>
                {`${roomsApp.liveRoom?.present.length} ${peopleText}`}
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
              console.log('clicked room info button' )
              roomView === 'info'
              ? setRoomView('voice')
              : setRoomView('info');            }}
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
              color={roomsApp.isCreator(ship!.patp!, id) ? rgba('#E56262', 0.7) : undefined }
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
                if (roomsApp.isCreator(ship!.patp!, id)) {
                  // SoundActions.playRoomLeave();
                  RoomsActions.deleteRoom(id);
                } else {
                  RoomsActions.leaveRoom(id);
                }
                LiveRoom.leave();
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
                  console.log(LiveRoom.our);
                  LiveRoom.our?.unmuteAudioTracks();
                } else {
                  console.log('muting time');
                  console.log(LiveRoom.our);
                  LiveRoom.our?.muteAudioTracks();
                }
              }}
            />
            <CommButton
              icon="CursorOn"
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
              }}
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
