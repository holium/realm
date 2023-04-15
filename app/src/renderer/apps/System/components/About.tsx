import { useEffect, useMemo, useState } from 'react';
import { Flex, Select, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { lighten } from 'polished';
import { Card } from 'renderer/components';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useServices } from 'renderer/logic/store';

const AboutPanelPresenter = () => {
  const { theme } = useServices();
  const { windowColor } = theme.currentTheme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

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
          maxWidth={200}
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
