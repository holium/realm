import {
  Flex,
  Icon,
  Text,
  TextInput,
  Button,
  CommButton,
  Avatar,
} from '@holium/design-system';
import { AvatarRow } from '../Rooms/components/AvatarRow';
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

interface CallerRowProps {
  patp: string;
  name: string;
  isMuted: boolean;
}

const CallerRow = (props: CallerRowProps) => {
  return (
    <Flex
      flex={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex gap={10}>
        <Avatar
          patp={props.patp}
          avatar={null}
          nickname="test"
          size={20}
          clickable={true}
          sigilColor={['black', 'black']}
        />
        <Text.H6>
          {props.name.substring(0, 20)} {props.name.length > 21 && '...'}
        </Text.H6>
      </Flex>
      <Icon name={props.isMuted ? 'MicOff' : 'MicOn'} size={20} />
    </Flex>
  );
};

export const VideoCall = observer(() => {
  const { theme, desktop, ship } = useServices();
  const { windowColor, mode, dockColor, accentColor } = theme.currentTheme;
  const commButtonBg =
    mode === 'light' ? darken(0.04, dockColor) : darken(0.01, dockColor);
  const videoColor = useMemo(() => darken(0.1, windowColor), [windowColor]);
  const [video, setVideo] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const webcamRef = useRef(null);

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
  const isMuted = roomsManager?.protocol.local?.isMuted;

  const ourName = ship?.nickname || ship?.patp || '';

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
        <Flex maxHeight="90%">
          {video ? (
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
              }}
              mirrored={true}
            ></Webcam>
          ) : (
            <Flex justifyContent="center" alignItems="center" flex={1}>
              <Avatar
                patp={ship?.patp ?? ''}
                size={30}
                sigilColor={[ship?.color || '#000000', 'white']}
              />
            </Flex>
          )}
          {callers.length === 1 ? (
            <Flex
              position="absolute"
              margin={10}
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <VideoCaller
                key={callers.at(0)}
                type="caller"
                person={callers.at(0) ?? ''}
              />
            </Flex>
          ) : (
            callers.map((person: string) => (
              <VideoCaller key={person} type="caller" person={person} />
            ))
          )}
        </Flex>

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
            <Text.H5>{presentRoom.title}</Text.H5>
            <Flex flexDirection="row">
              <Icon name="Participants" size={20} />
              <Text.Caption>{1 + callers.length}/9 Participants</Text.Caption>
            </Flex>
          </Flex>
          <Flex gap={10}>
            <CommButton
              icon={isMuted ? 'MicOff' : 'MicOn'}
              customBg={commButtonBg}
              onClick={(evt) => {
                evt.stopPropagation();
                if (isMuted) {
                  roomsManager?.unmute();
                } else {
                  roomsManager?.mute();
                }
              }}
            />
            <CommButton
              icon={video ? 'VideoOn' : 'VideoOff'}
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
            <AvatarRow
              people={
                presentRoom.present.filter(
                  (person: string) => person !== ship?.patp
                ) ?? []
              }
              backgroundColor={windowColor}
            />
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
          <Flex flexDirection="column" gap={10}>
            {callers.map((person: string) => (
              <CallerRow
                key={person}
                name={person}
                patp={'~zod'}
                isMuted={false}
              />
            ))}
            <CallerRow
              patp={ship?.patp || ''}
              name={ourName}
              isMuted={isMuted || false}
            />
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
