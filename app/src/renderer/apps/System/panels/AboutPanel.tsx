import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Select, Text } from '@holium/design-system';

import { RealmIPC } from 'renderer/stores/ipc';

import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';

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
    <SettingPane>
      <SettingTitle title="About" />
      <SettingSection
        title="Release Channel"
        body={
          <>
            <Text.Custom fontSize={2} mb={2}>
              The release channel determines which Realm updates you receive.
            </Text.Custom>
            <Select
              id="about-release-channel-setting"
              maxWidth={200}
              options={[
                { label: 'prerelease', value: 'alpha', disabled: true },
                { label: 'production', value: 'latest' },
              ]}
              selected={selectedChannel}
              onClick={(channel) => {
                setSelectedChannel(channel as string);
                RealmIPC.setReleaseChannel(channel as string);
              }}
            />
          </>
        }
      />
    </SettingPane>
  );
};

export const AboutPanel = observer(AboutPanelPresenter);
