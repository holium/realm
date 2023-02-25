import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from '@holium/design-system';
import { Card, Select } from 'renderer/components';
import { lighten, darken } from 'polished';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';

const AboutPanelPresenter = () => {
  const { theme } = useServices();
  const { windowColor, inputColor, mode, textColor, iconColor } =
    theme.currentTheme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);
  const secondaryInputColor = useMemo(() => {
    return mode === 'light' ? darken(0.015, inputColor) : inputColor;
  }, [inputColor, mode]);

  const [selectedChannel, setSelectedChannel] = useState('');

  useEffect(() => {
    const getAndSetSelectedChannel = async () => {
      const releaseChannel = await DesktopActions.getReleaseChannel();
      console.log('releaseChannel => %o', releaseChannel);
      setSelectedChannel(releaseChannel);
    };

    getAndSetSelectedChannel();
  }, []);

  return (
    <Flex flex={1} gap={12} flexDirection="column" p={3}>
      <Text.Custom fontSize={7} fontWeight={600} mb={6}>
        About
      </Text.Custom>
      <Text.Custom opacity={0.7} fontSize={3} fontWeight={500}>
        RELEASE CHANNEL
      </Text.Custom>
      <Card p="20px" flexDirection="column" gap={16} customBg={cardColor}>
        <Text.Body>
          The release channel determines which Realm updates you receive.
        </Text.Body>
        <Select
          id="about-release-channel-setting"
          height={32}
          maxWidth={200}
          textColor={textColor}
          iconColor={iconColor}
          inputColor={secondaryInputColor}
          customBg={inputColor}
          options={[
            { label: 'prerelease', value: 'alpha', disabled: true },
            { label: 'production', value: 'latest' },
          ]}
          selected={selectedChannel}
          onClick={(channel: string) => {
            setSelectedChannel(channel);
            DesktopActions.setReleaseChannel(channel);
          }}
        />
      </Card>
    </Flex>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
