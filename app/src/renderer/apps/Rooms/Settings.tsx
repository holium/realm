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

import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../store';
import { useRooms } from './useRooms';

const SettingsPresenter = () => {
  const { roomsApp } = useTrayApps();
  const { ship } = useShipStore();
  const roomsManager = useRooms(ship?.patp);

  const [audioSourceOptions, setAudioSources] = useState<RadioOption[] | any[]>(
    []
  );
  const [selectedSource, setSelectedSource] = useState('');

  useEffect(() => {
    roomsManager?.getAudioInputSources().then((sources: any[]) => {
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
            roomsManager?.setAudioInput(source);
          }}
        />
      </Flex>
    </>
  );
};

export const Settings = observer(SettingsPresenter);
