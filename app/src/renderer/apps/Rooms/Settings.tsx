import { observer } from 'mobx-react';
import { darken } from 'polished';
import { useEffect, useMemo, useState } from 'react';
import { Label, Select, RadioOption, FormControl } from 'renderer/components';
import { Flex, Button, Text, Icon } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from '../store';
import { useRooms } from './useRooms';

const SettingsPresenter = () => {
  const { roomsApp } = useTrayApps();
  const { ship, theme } = useServices();
  const roomsManager = useRooms(ship!.patp);

  const { inputColor, mode } = theme.currentTheme;
  const [audioSourceOptions, setAudioSources] = useState<RadioOption[] | any[]>(
    []
  );
  const [selectedSource, setSelectedSource] = useState('');

  const secondaryInputColor = useMemo(() => {
    return mode === 'light' ? darken(0.015, inputColor) : inputColor;
  }, [inputColor, mode]);

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
            style={{ cursor: 'none' }}
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
              height={32}
              textColor={theme.currentTheme.textColor}
              iconColor={theme.currentTheme.iconColor}
              inputColor={secondaryInputColor}
              customBg={theme.currentTheme.inputColor}
              options={audioSourceOptions}
              selected={selectedSource}
              onClick={(source: string) => {
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
