import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';
import { RadioOption, Select } from '@holium/design-system/inputs';

import { MediaAccess } from 'os/types';
import { MainIPC } from 'renderer/stores/ipc';

import { useTrayApps } from '../store';

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

  const getDeviceId = async (deviceType: string, sources: RadioOption[]) => {
    let deviceId =
      sources.find((source) =>
        (source.value as string).toLowerCase().includes('default')
      )?.value || sources[0]?.value;

    const cachedDeviceId = localStorage.getItem(`rooms-${deviceType}`);
    if (cachedDeviceId) {
      // Make sure the cached device is still available and accessible.
      // But skip the check for audio-output, as getUserMedia doesn't support it.
      if (deviceType !== 'audio-output') {
        try {
          await navigator.mediaDevices.getUserMedia({
            [deviceType === 'video-input' ? 'video' : 'audio']: {
              deviceId: { exact: cachedDeviceId },
            },
          });
          deviceId = cachedDeviceId;
        } catch (_) {
          console.log("Couldn't access cached device, using default.");
          localStorage.setItem(`rooms-${deviceType}`, deviceId as string);
        }
      } else {
        deviceId = cachedDeviceId;
      }
    }

    return deviceId;
  };

  const setDeviceId = (deviceType: string, deviceId: string) => {
    localStorage.setItem(`rooms-${deviceType}`, deviceId);

    if (deviceType === 'audio-output') {
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        audioElement
          // @ts-ignore
          .setSinkId(deviceId)
          .then(() => {
            console.log(`Success, audio output device attached: ${deviceId}`);
          })
          .catch((error: any) => {
            console.error(`Failed to attach audio output device: ${error}`);
          });
      }
    }

    switch (deviceType) {
      case 'audio-input':
        setSelectedSource(deviceId);
        break;
      case 'audio-output':
        setSelectedOutputSource(deviceId);
        break;
      case 'video-input':
        setSelectedVideoSource(deviceId);
        break;
    }
  };

  useEffect(() => {
    getMediaSources().then(async (sources: any[]) => {
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

      const audioDeviceId = await getDeviceId('audio-input', audioSources);
      setSelectedSource(audioDeviceId as string);

      const audioOutputId = await getDeviceId(
        'audio-output',
        audioOutputSources
      );
      setSelectedOutputSource(audioOutputId as string);

      const videoDeviceId = await getDeviceId('video-input', videoSources);
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
          onClick={(source) => setDeviceId('audio-input', source as string)}
        />
      </Flex>
      <Flex flexDirection="column" mb={3}>
        <Text.Label mb={1}>Audio output</Text.Label>
        <Select
          id="rooms-settings-audio-output"
          maxWidth={maxWidth}
          options={audioOutputOptions}
          selected={selectedOutputSource}
          onClick={(source) => setDeviceId('audio-output', source as string)}
        />
      </Flex>
      <Flex flexDirection="column" mb={3}>
        <Text.Label mb={1}>Video input</Text.Label>
        <Select
          id="rooms-settings-video-input"
          maxWidth={maxWidth}
          options={videoSourceOptions}
          selected={selectedVideoSource}
          onClick={(source) => setDeviceId('video-input', source as string)}
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
