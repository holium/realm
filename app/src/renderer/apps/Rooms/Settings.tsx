import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { RadioOption, Select } from '@holium/design-system';
import { Label, FormControl } from 'renderer/components';
import { Flex, Button, Text, Icon } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from '../store';
import { useRooms } from './useRooms';

const SettingsPresenter = () => {
  const { roomsApp } = useTrayApps();
  const { ship } = useServices();
  const roomsManager = useRooms(ship!.patp);

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
        <FormControl.FieldSet>
          <FormControl.Field>
            <Label>Audio input</Label>
            <Select
              id="rooms-settings-audio-input"
              options={audioSourceOptions}
              selected={selectedSource}
              onClick={(source) => {
                setSelectedSource(source);
                roomsManager?.setAudioInput(source);
              }}
            />
          </FormControl.Field>
        </FormControl.FieldSet>
      </Flex>
    </>
  );
};

export const Settings = observer(SettingsPresenter);
