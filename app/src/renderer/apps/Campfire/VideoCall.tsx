import {
  Flex,
  Icon,
  Text,
  TextInput,
  Button,
  CommButton,
} from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { useMemo } from 'react';
import { darken } from 'polished';

export const VideoCall = () => {
  const { theme } = useServices();
  const { windowColor, mode, dockColor } = theme.currentTheme;
  const commButtonBg =
    mode === 'light' ? darken(0.04, dockColor) : darken(0.01, dockColor);
  const videoColor = useMemo(() => darken(0.1, windowColor), [windowColor]);
  return (
    <Flex flexDirection="row" flex={1}>
      <Flex
        background={videoColor}
        flex={1}
        margin={16}
        borderRadius={20}
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Flex flexDirection="column" margin={20}>
          <Flex
            width={170}
            height={120}
            borderRadius={10}
            background={darken(0.1, videoColor)}
            margin={10}
          ></Flex>
          <Flex
            width={170}
            height={120}
            borderRadius={10}
            background={darken(0.1, videoColor)}
            margin={10}
          ></Flex>
        </Flex>
        <Flex
          background={windowColor}
          mb={30}
          height={50}
          alignItems="center"
          marginTop="auto"
          marginLeft="auto"
          marginRight="auto"
          borderRadius={10}
          gap={10}
          py={10}
          px={30}
        >
          <Flex flexDirection="column">
            <Text.H5>testing</Text.H5>
            <Flex flexDirection="row">
              <Icon name="Participants" size={20} />
              <Text.Caption>3/6 Participants</Text.Caption>
            </Flex>
          </Flex>
          <CommButton
            icon={'MicOn'}
            customBg={commButtonBg}
            onClick={(evt) => {
              evt.stopPropagation();
            }}
          />
          <CommButton
            icon={'VideoOn'}
            customBg={commButtonBg}
            onClick={(evt) => {
              evt.stopPropagation();
            }}
          />
          <CommButton
            icon={'ScreenShare'}
            customBg={commButtonBg}
            onClick={(evt) => {
              evt.stopPropagation();
            }}
          />
          <CommButton
            icon={'AudioInput'}
            customBg={commButtonBg}
            onClick={(evt) => {
              evt.stopPropagation();
            }}
          />
          <Icon name="AddParticipant" size={30} />
        </Flex>
      </Flex>
      <Flex flex={1} margin={10} flexDirection="column" gap={10}>
        <Flex flexDirection="row">
          <Icon name="Participants" size={25} />
          <Text.H5>Participants</Text.H5>
        </Flex>
        <TextInput
          id="add-participant"
          name="add-participant"
          placeholder="Enter Urbit ID"
          rightAdornment={<Button.TextButton>Add</Button.TextButton>}
        ></TextInput>
        <Flex></Flex>
        <Flex flexDirection="row">
          <Icon name="CampfireMessages" size={25} />
          <Text.H5>Messages</Text.H5>
        </Flex>
      </Flex>
    </Flex>
  );
};
