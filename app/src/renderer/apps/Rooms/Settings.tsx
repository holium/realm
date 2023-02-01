import { observer } from 'mobx-react';
import { darken } from 'polished';
import { useEffect, useMemo, useState } from 'react';
import {
  Flex,
  Grid,
  IconButton,
  Icons,
  Text,
  Label,
  Select,
  RadioOption,
  FormControl,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useTrayApps } from '../store';
import { useRooms } from './useRooms';

const SettingsPresenter = () => {
  const { dimensions, roomsApp } = useTrayApps();
  const { ship, theme } = useServices();
  const roomsManager = useRooms(ship!.patp);

  const { dockColor, windowColor, inputColor, mode } = theme.currentTheme;
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
          ...theme.currentTheme,
          windowColor,
        }}
      >
        <Flex pl={3} pr={4} mr={3} justifyContent="center" alignItems="center">
          <IconButton
            className="realm-cursor-hover"
            size={26}
            style={{ cursor: 'none' }}
            customBg={dockColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              roomsApp.setView('list');
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
          <Text
            ml={2}
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Audio Settings
          </Text>
        </Flex>
        <Flex ml={1} pl={2} pr={2}></Flex>
      </Titlebar>

      <Flex style={{ marginTop: 58 }} flex={1} flexDirection="column">
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
    </Grid.Column>
  );
};

export const Settings = observer(SettingsPresenter);
