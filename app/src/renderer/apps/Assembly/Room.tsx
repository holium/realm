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

export type BaseAssemblyProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Room: FC<BaseAssemblyProps> = observer(
  (props: BaseAssemblyProps) => {
    const { dimensions } = props;
    const { ship, shell } = useServices();
    const { assemblyApp } = useTrayApps();
    const { people } = assemblyApp.selected!;

    const [audio, setAudio] = useState<MediaStream | null>(null);

    const { dockColor, windowColor, inputColor } = shell.desktop.theme;

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
      window.electron.app.askForMicrophone().then((hasMic: any) => {
        console.log('hasMic', hasMic);
      });
    }, []);

    console.log(audio);

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
                assemblyApp.setView('list');
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
                {assemblyApp.selected?.title}
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
          <Flex flex={2} flexDirection="row" flexWrap="wrap">
            {people.map((person: string, index: number) => {
              const metadata = ship?.contacts.getContactAvatarMetadata(person);
              const hasVoice = audio && person === ship?.patp;
              let name = metadata?.nickname || person;
              if (name.length > 18) name = `${name.substring(0, 18)}...`;
              return (
                <Flex
                  key={person}
                  gap={12}
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  width={'50%'}
                >
                  <Sigil
                    borderRadiusOverride="6px"
                    simple
                    size={36}
                    avatar={metadata && metadata.avatar}
                    patp={person}
                    color={[(metadata && metadata.color) || '#000000', 'white']}
                  />
                  <Text fontSize={3} fontWeight={500}>
                    {name}
                  </Text>
                  {hasVoice ? (
                    <VoiceAnalyzer audio={audio} />
                  ) : (
                    <Flex height={30}></Flex>
                  )}
                </Flex>
              );
            })}
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
                  assemblyApp.leaveRoom();
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
