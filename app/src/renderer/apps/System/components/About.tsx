import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Select, Text, Card } from '@holium/design-system';
import { RealmIPC } from 'renderer/stores/ipc';

const AboutPanelPresenter = () => {
  const [selectedChannel, setSelectedChannel] = useState('');

  useEffect(() => {
    const getAndSetSelectedChannel = async () => {
      const releaseChannel = await RealmIPC.getReleaseChannel();
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
      <Card p="20px" flexDirection="column" gap={16}>
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
            RealmIPC.setReleaseChannel(channel);
          }}
        />
      </Card>
    </Flex>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
