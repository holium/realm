import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card, Select } from 'renderer/components';
import { lighten, darken } from 'polished';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';

const AboutPanelPresenter = () => {
  const { theme, desktop } = useServices();
  const { windowColor } = theme.currentTheme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  const [selectedChannel, setSelectedChannel] = useState('');

  const { inputColor, mode } = theme.currentTheme;
  const secondaryInputColor = useMemo(() => {
    return mode === 'light' ? darken(0.015, inputColor) : inputColor;
  }, [inputColor, mode]);

  useEffect(() => {
    (async function () {
      const releaseChannel = await DesktopActions.getReleaseChannel();
      console.log('releaseChannel => %o', releaseChannel);
      setSelectedChannel(releaseChannel);
    })();
  }, []);

  return (
    <Flex flex={1} gap={12} flexDirection="column" p={3}>
      <Text fontSize={7} fontWeight={600} mb={6}>
        About
      </Text>
      <Text opacity={0.7} fontSize={3} fontWeight={500}>
        RELEASE CHANNEL
      </Text>
      <Card p="20px" width="100%" customBg={cardColor}>
        <Select
          id="about-release-channel-setting"
          height={32}
          textColor={theme.currentTheme.textColor}
          iconColor={theme.currentTheme.iconColor}
          inputColor={secondaryInputColor}
          customBg={theme.currentTheme.inputColor}
          options={[
            { label: 'alpha', value: 'alpha', disabled: true },
            { label: 'latest', value: 'latest' },
          ]}
          selected={selectedChannel}
          onClick={async (channel: string) => {
            setSelectedChannel(channel);
            await DesktopActions.setReleaseChannel(channel);
          }}
        />
      </Card>
    </Flex>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
