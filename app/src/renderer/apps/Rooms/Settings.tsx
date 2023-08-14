import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';
import { RadioOption, Select } from '@holium/design-system/inputs';

import { MediaAccess } from 'os/types';
import { MainIPC } from 'renderer/stores/ipc';

import { useTrayApps } from '../store';
import { useRoomsStore } from './store/RoomsStoreContext';

const formSourceOptions = (sources: MediaDeviceInfo[]) => {
  return sources.map((source) => {
    return {
      label: source.label,
      kind: source.kind,
      value: source.deviceId,
    };
  });
};
const getMediaSources = async () => {
  const devices: MediaDeviceInfo[] =
    await navigator.mediaDevices.enumerateDevices();
  return formSourceOptions(
    devices.filter((device: MediaDeviceInfo) => {
      return (
        device.kind === 'audioinput' ||
        device.kind === 'audiooutput' ||
        device.kind === 'videoinput'
      );
    })
  );
};

const SettingsPresenter = ({
  showBackButton = true,
  maxWidth,
}: {
  showBackButton?: boolean;
  maxWidth?: number;
}) => {
  const { roomsApp } = useTrayApps();
  const roomsStore = useRoomsStore();

  const [audioSourceOptions, setAudioSources] = useState<RadioOption[] | any[]>(
    []
  );
  const [audioOutputOptions, setAudioOutput] = useState<RadioOption[] | any[]>(
    []
  );
  const [videoSourceOptions, setVideoSources] = useState<RadioOption[] | any[]>(
    []
  );
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedOutputSource, setSelectedOutputSource] = useState('');
  const [selectedVideoSource, setSelectedVideoSource] = useState('');

  const [mediaStatus, setMediaStatus] = useState<MediaAccess>({
    camera: 'unknown',
    mic: 'unknown',
    screen: 'unknown',
  });

  useEffect(() => {
    getMediaSources().then((sources: any[]) => {
      const audioSources = sources.filter(
        (source) => source.kind === 'audioinput'
      ) as RadioOption[];
      const audioOutputSources = sources.filter(
        (source) => source.kind === 'audiooutput'
      ) as RadioOption[];
      const videoSources = sources.filter(
        (source) => source.kind === 'videoinput'
      ) as RadioOption[];
      setAudioSources(audioSources);
      setAudioOutput(audioOutputSources);
      setVideoSources(videoSources);
      const audioDeviceId =
        localStorage.getItem('rooms-audio-input') ||
        audioSources.find((source) =>
          (source.value as string).toLowerCase().includes('default')
        )?.value ||
        audioSources[0]?.value;
      setSelectedSource(audioDeviceId as string);

      const audioOutputId =
        localStorage.getItem('rooms-audio-output') ||
        audioOutputSources.find((source) =>
          (source.value as string).toLowerCase().includes('default')
        )?.value ||
        audioOutputSources[0]?.value;
      setSelectedOutputSource(audioOutputId as string);

      const videoDeviceId =
        localStorage.getItem('rooms-video-input') ||
        videoSources.find((source) =>
          (source.value as string).toLowerCase().includes('default')
        )?.value ||
        videoSources[0]?.value;
      setSelectedVideoSource(videoDeviceId as string);
      MainIPC.getMediaStatus().then(setMediaStatus);
    });
  }, []);

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Flex justifyContent="center" alignItems="center">
          {showBackButton && (
            <Button.IconButton
              className="realm-cursor-hover"
              mr={2}
              size={26}
              onClick={(evt: any) => {
                evt.stopPropagation();
                roomsApp.setView('list');
              }}
            >
              <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
            </Button.IconButton>
          )}
          <Text.Custom
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Input Options
          </Text.Custom>
        </Flex>
        <Flex ml={1} pl={2} pr={2}></Flex>
      </Flex>
      <Flex flexDirection="column" mb={3} gap={4}>
        <Text.Label mb={1}>Audio input</Text.Label>
        <Select
          id="rooms-settings-audio-input"
          maxWidth={maxWidth}
          options={audioSourceOptions}
          selected={selectedSource}
          onClick={(source) => {
            setSelectedSource(source as string);
            roomsStore.setAudioInput(source as string);
          }}
        />
      </Flex>
      <Flex flexDirection="column" mb={3}>
        <Text.Label mb={1}>Audio output</Text.Label>
        <Select
          id="rooms-settings-audio-output"
          maxWidth={maxWidth}
          options={audioOutputOptions}
          selected={selectedOutputSource}
          onClick={(source) => {
            setSelectedOutputSource(source as string);
            roomsStore.setAudioOutput(source as string);
          }}
        />
      </Flex>
      <Flex flexDirection="column" mb={3}>
        <Text.Label mb={1}>Video input</Text.Label>
        <Select
          id="rooms-settings-video-input"
          maxWidth={maxWidth}
          options={videoSourceOptions}
          selected={selectedVideoSource}
          onClick={(source) => {
            setSelectedVideoSource(source as string);
            roomsStore.setVideoInput(source as string);
          }}
        />
      </Flex>
      <Flex mt={3} col gap={12}>
        <Flex row alignItems="center" gap={2}>
          <Text.Label mb={1} width={160}>
            Microphone permission
          </Text.Label>
          <Button.TextButton
            style={{ fontWeight: 400 }}
            color="intent-success"
            isDisabled={mediaStatus.mic === 'granted'}
            onClick={() => {
              MainIPC.askForMicrophone().then((status) => {
                setMediaStatus({ ...mediaStatus, mic: status });
              });
            }}
          >
            {mediaStatus.mic === 'granted' ? 'Granted' : 'Grant'}
          </Button.TextButton>
        </Flex>
        <Flex row alignItems="center" gap={2}>
          <Text.Label mb={1} width={160}>
            Camera permission
          </Text.Label>
          <Button.TextButton
            style={{ fontWeight: 400 }}
            color="intent-success"
            isDisabled={mediaStatus.camera === 'granted'}
            onClick={() => {
              MainIPC.askForCamera().then((status) => {
                setMediaStatus({ ...mediaStatus, camera: status });
              });
            }}
          >
            {mediaStatus.camera === 'granted' ? 'Granted' : 'Grant'}
          </Button.TextButton>
        </Flex>
      </Flex>
    </>
  );
};

export const Settings = observer(SettingsPresenter);
