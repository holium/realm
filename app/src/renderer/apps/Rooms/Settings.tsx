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

import { useAppState } from 'renderer/stores/app.store';

import { useTrayApps } from '../store';

const formSourceOptions = (sources: MediaDeviceInfo[]) => {
  return sources.map((source) => {
    return {
      label: source.label,
      value: source.deviceId,
    };
  });
};
const getAudioInputSources = async () => {
  const devices: MediaDeviceInfo[] =
    await navigator.mediaDevices.enumerateDevices();
  return formSourceOptions(
    devices.filter((device: MediaDeviceInfo) => {
      return device.kind === 'audioinput';
    })
  );
};

const SettingsPresenter = () => {
  const { roomsApp } = useTrayApps();
  const { loggedInAccount } = useAppState();
  const { roomsStore } = useShipStore();

  const [audioSourceOptions, setAudioSources] = useState<RadioOption[] | any[]>(
    []
  );
  const [selectedSource, setSelectedSource] = useState('');

  useEffect(() => {
    getAudioInputSources().then((sources: any[]) => {
      setAudioSources(sources as RadioOption[]);
      const deviceId =
        localStorage.getItem('rooms-audio-input') ||
        sources.find((source) => source.value === 'default')?.value;
      setSelectedSource(deviceId);
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
      <Flex flex={1} flexDirection="column">
        <Text.Label>Audio input</Text.Label>
        <Select
          id="rooms-settings-audio-input"
          options={audioSourceOptions}
          selected={selectedSource}
          onClick={(source) => {
            setSelectedSource(source);
            roomsStore.setAudioInput(source);
          }}
        />
      </Flex>
    </>
  );
};

export const Settings = observer(SettingsPresenter);
