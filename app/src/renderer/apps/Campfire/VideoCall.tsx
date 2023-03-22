import {
  Flex,
  Icon,
  Text,
  TextInput,
  Button,
  CommButton,
  Avatar,
} from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useMemo, useState, useEffect, useRef } from 'react';
import { darken } from 'polished';
import { Card } from '@holium/design-system/src/general/Card/Card';
import { RealmActions } from 'renderer/logic/actions/main';
import { ShellActions } from 'renderer/logic/actions/shell';
import { CampfireActions } from 'renderer/logic/actions/campfire';
import { useRooms } from '../Rooms/useRooms';
import { observer } from 'mobx-react';
import { VideoCaller } from './VideoCaller';
import Webcam from 'react-webcam';

export const VideoCall = observer(() => {
  const { theme, desktop, ship } = useServices();
  const { windowColor, mode, dockColor, accentColor } = theme.currentTheme;
  const commButtonBg =
    mode === 'light' ? darken(0.04, dockColor) : darken(0.01, dockColor);
  const videoColor = useMemo(() => darken(0.1, windowColor), [windowColor]);
  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  useEffect(() => {
    if (!desktop.micAllowed) {
      RealmActions.askForMicrophone().then((status) => {
        if (status === 'denied') desktop.setMicAllowed(false);
        else desktop.setMicAllowed(true);
      });
    }
    if (!desktop.cameraAllowed) {
      RealmActions.askForCamera().then((status) => {
        if (status === 'denied') desktop.setCameraAllowed(false);
        else desktop.setCameraAllowed(true);
      });
    }
  }, []);

  const nickname = '~dopmer-fopryg-novned-tidsyl';

  const roomsManager = useRooms(ship?.patp);
  const callers = roomsManager
    ? [...Array.from(roomsManager.protocol.peers.keys())]
    : [];

  const presentRoom = useMemo(() => {
    if (!roomsManager?.live.room) return;
    return roomsManager?.live.room;
  }, [roomsManager?.live.room]);
  if (!presentRoom) return <div />;
  const { rid, creator } = presentRoom;
  const webcamRef = useRef(null);

  return (
    <Flex flexDirection="row" flex={1}>
      <Flex
        background={videoColor}
        flex={4}
        margin={16}
        borderRadius={20}
        flexDirection="column"
        justifyContent="flex-start"
        padding={20}
        gap={20}
      >
        <Webcam
          videoConstraints={{
            facingMode: 'user',
          }}
          audio={false}
          screenshotFormat="image/jpeg"
          ref={webcamRef}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            borderRadius: 10,
            maxHeight: '90%',
          }}
          mirrored={true}
        ></Webcam>
        {callers.map((person: string) => (
          <VideoCaller key={person} type="caller" person={person} />
        ))}

        {/*<Flex flexDirection="column" margin={20}>
          <Flex
            width={170}
            height={120}
            borderRadius={10}
            background={darken(0.1, videoColor)}
            margin={10}
          ></Flex>
          <Flex
            width={170}
            height={120}
            borderRadius={10}
            background={darken(0.1, videoColor)}
            margin={10}
          ></Flex>
        </Flex>*/}
        {/*!desktop.cameraAllowed && (
          <Tooltip
            id="campfire-no-camera-permissions"
            content="No camera permissions"
            placement="top"
          >
            <Flex
              width={28}
              height={28}
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="InfoCircle" color="intent-alert" size={20} />
            </Flex>
          </Tooltip>
        )*/}
        <Flex
          background={windowColor}
          height={50}
          alignItems="center"
          marginLeft={50}
          marginRight={50}
          marginTop="auto"
          borderRadius={10}
          gap={10}
          py={10}
          px={30}
          justifyContent="space-between"
        >
          <Flex flexDirection="column">
            <Text.H5>testing</Text.H5>
            <Flex flexDirection="row">
              <Icon name="Participants" size={20} />
              <Text.Caption>3/9 Participants</Text.Caption>
            </Flex>
          </Flex>
          <Flex gap={10}>
            <CommButton
              icon={muted ? 'MicOff' : 'MicOn'}
              customBg={commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
                setMuted(!muted);
              }}
            />
            <CommButton
              icon={video ? 'VideoOff' : 'VideoOn'}
              customBg={commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
                setVideo(!video);
              }}
            />
            <CommButton
              icon={'ScreenShare'}
              customBg={screenSharing ? accentColor : commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
                setScreenSharing(!screenSharing);
              }}
            />
            <CommButton
              icon={'AudioInput'}
              customBg={commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
              }}
            />
          </Flex>
          <Flex gap={10}>
            <Button.IconButton
              onClick={() =>
                ShellActions.openDialog('campfire-add-participant-dialog')
              }
            >
              <Icon name="AddParticipant" size={30} />
            </Button.IconButton>
            {presentRoom.creator === ship?.patp && (
              <Button.IconButton
                className="realm-cursor-hover"
                customColor={
                  presentRoom.creator === ship?.patp ? '#E56262' : undefined
                }
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  if (creator === ship?.patp) {
                    roomsManager?.deleteRoom(rid);
                    CampfireActions.setView('landing');
                  } else {
                    roomsManager?.leaveRoom();
                    CampfireActions.setView('landing');
                  }
                }}
              >
                <Icon name="RoomLeave" size={30} />
              </Button.IconButton>
            )}
          </Flex>
          {/*<Button.IconButton
            className="realm-cursor-hover"
            size={26}
            customColor={
              presentRoom.creator === ship?.patp ? '#E56262' : undefined
            }
            onClick={(evt) => {
            }}
          >
            <Icon name="RoomLeave" size={22} opacity={0.7} />
          </Button.IconButton>*/}
        </Flex>
      </Flex>
      <Flex flex={1} margin={10} flexDirection="column" gap={10}>
        <Flex flexDirection="row">
          <Icon name="Participants" size={25} />
          <Text.H5>Participants</Text.H5>
        </Flex>
        <TextInput
          id="add-participant"
          name="add-participant"
          placeholder="Enter Urbit ID"
          rightAdornment={<Button.TextButton>Add</Button.TextButton>}
        ></TextInput>
        <Card background={windowColor} padding={12}>
          <Flex
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex gap={10}>
              <Avatar
                patp="~dopmer-fopryg-novned-tidsyl"
                avatar={null}
                nickname="test"
                size={20}
                clickable={true}
                sigilColor={['black', 'black']}
              />
              <Text.H6>
                {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
              </Text.H6>
            </Flex>
            <Icon name="MicOn" size={20} />
          </Flex>
        </Card>
        <Flex flexDirection="row">
          <Icon name="CampfireMessages" size={25} />
          <Text.H5>Messages</Text.H5>
        </Flex>
      </Flex>
    </Flex>
  );
});
