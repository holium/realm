import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import {
  Flex,
  Grid,
  IconButton,
  Icons,
  Text,
  Input,
  TextButton,
  Checkbox,
  Sigil,
} from 'renderer/components';
import { useTrayApps } from 'renderer/logic/apps/store';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { CommButton } from './components/CommButton';
import { VoiceAnalyzer } from './components/VoiceVisualizer';
import { Speaker } from './components/Speaker';
import {Urbit} from '@urbit/http-api';
import { RoomsActions } from 'renderer/logic/actions/rooms';

export type BaseAssemblyProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

const urb = new Urbit('', '');
urb.ship = window.ship;


export const Room: FC<BaseAssemblyProps> = observer(
  (props: BaseAssemblyProps) => {
    const { dimensions } = props;
    const { ship, desktop } = useServices();
    const { roomsApp } = useTrayApps();
    const { people } = roomsApp.selected!;

    const [audio, setAudio] = useState<MediaStream | null>(null);

    const { dockColor, windowColor, inputColor } = desktop.theme;

    /*
    const [roomSub, setRoomSub] = useState(0);

    useEffect(() => {
      if (!urb || roomSub) {
        return;
      }
      urb.url = ship.url;
      urb.subscribe({
            app: "room",
            path: "/room/local",
            event: handleRoomSub,
            quit: subFail,
            err: subFail
        })
        .then((subscriptionId) => {
          setRoomSub(subscriptionId);
          });
    }, [urb, ship, roomSub]);

      // unsub on window close or refresh
      useEffect(() => {
        window.addEventListener("beforeunload", unsubFunc);
        return () => {
          window.removeEventListener("beforeunload", unsubFunc);
        };
      }, [roomSub]);
      //
      const unsubFunc = () => {
        urb.unsubscribe(roomSub);
        urb.delete();
      };

      function handleRoomSub(update:any) {
        console.log("room update:")
        console.log(update)
      };

    function subFail() {
        console.log("fail!")
      };
      */


    const getMicrophone = async () => {
      const audioMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setAudio(audioMedia);
    };

    const stopMicrophone = () => {
      audio?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setAudio(null);
    };

    useEffect(() => {
      console.log("room innit??")
      window.electron.app.askForMicrophone().then((hasMic: any) => {
        console.log('hasMic', hasMic);
      });
    }, []);

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
            pl={3}
            pr={4}
            mr={3}
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
                RoomsActions.setView('list')
                // assemblyApp.setView('list');
              }}
            >
              <Icons name="ArrowLeftLine" />
            </IconButton>
            <Flex flexDirection="column">
              <Text
                ml={2}
                fontSize={3}
                fontWeight={500}
                style={{
                  wordWrap: 'normal',
                  textOverflow: 'ellipsis',
                  // textTransform: 'uppercase',
                }}
              >
                {roomsApp.selected?.title}
              </Text>
            </Flex>
          </Flex>
          <Flex ml={1} pl={2} pr={2}>
            <IconButton
              className="realm-cursor-hover"
              size={26}
              style={{ cursor: 'none' }}
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
              }}
            >
              <Icons name="InfoCircle" />
            </IconButton>
          </Flex>
        </Titlebar>
        <Flex style={{ marginTop: 54 }} flex={1} flexDirection="column">
          {/* <Text mt="2px" fontSize={2} opacity={0.5} fontWeight={400}>
            {assemblyApp.selected?.host}
          </Text> */}
          <Flex
            flex={2}
            flexDirection="row"
            // flexWrap="wrap"
            alignItems="center"
          >
            {people.map((person: string, index: number) => (
              <Speaker key={person} person={person} audio={audio} />
            ))}
          </Flex>
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
                customBg={dockColor}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                }}
              >
                <Icons name="UserAdd" />
              </IconButton>
            </Flex>
            <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
              <CommButton
                icon={audio ? 'MicOn' : 'MicOff'}
                customBg={dockColor}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  if (audio) {
                    stopMicrophone();
                  } else {
                    getMicrophone();
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
              <CommButton
                icon="HeadphoneLine"
                customBg={dockColor}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  // assemblyApp.testAction();
                }}
              />
            </Flex>
            <Flex alignItems="center">
              <IconButton
                className="realm-cursor-hover"
                size={26}
                customBg={dockColor}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  // assemblyApp.leaveRoom(ship!.patp!);
                }}
              >
                <Icons name="LoginLine" />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
