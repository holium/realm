import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  Flex,
  Icon,
  RadioOption,
  Select,
  Text,
} from '@holium/design-system';

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

// const getAudioOutputSources = async () => {
//   const devices: MediaDeviceInfo[] =
//     await navigator.mediaDevices.enumerateDevices();
//   return formSourceOptions(
//     devices.filter((device: MediaDeviceInfo) => {
//       return device.kind === 'audiooutput';
//     })
//   );
// };

// const getVideoInputSources = async () => {
//   const devices: MediaDeviceInfo[] =
//     await navigator.mediaDevices.enumerateDevices();
//   return formSourceOptions(
//     devices.filter((device: MediaDeviceInfo) => {
//       return device.kind === 'videoinput';
//     })
//   );
// };

const SettingsPresenter = () => {
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
    });
  }, []);

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Flex justifyContent="center" alignItems="center">
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
          <Text.Custom
            ml={2}
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Audio Settings
          </Text.Custom>
        </Flex>
        <Flex ml={1} pl={2} pr={2}></Flex>
      </Flex>
      <Flex flexDirection="column" mb={2}>
        <Text.Label mb={1}>Audio input</Text.Label>
        <Select
          id="rooms-settings-audio-input"
          options={audioSourceOptions}
          selected={selectedSource}
          onClick={(source) => {
            setSelectedSource(source as string);
            roomsStore.setAudioInput(source as string);
          }}
        />
      </Flex>
      <Flex flexDirection="column" mb={2}>
        <Text.Label mb={1}>Audio output</Text.Label>
        <Select
          id="rooms-settings-audio-output"
          options={audioOutputOptions}
          selected={selectedOutputSource}
          onClick={(source) => {
            setSelectedOutputSource(source as string);
            roomsStore.setAudioOutput(source as string);
          }}
        />
      </Flex>
      <Flex flexDirection="column">
        <Text.Label mb={1}>Video input</Text.Label>
        <Select
          id="rooms-settings-video-input"
          options={videoSourceOptions}
          selected={selectedVideoSource}
          onClick={(source) => {
            setSelectedVideoSource(source as string);
            roomsStore.setVideoInput(source as string);
          }}
        />
      </Flex>
    </>
  );
};

export const Settings = observer(SettingsPresenter);
