import { useEffect, useState } from 'react';
import { Button, CheckBox, Flex, Spinner, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { MediaAccess, MediaAccessStatus } from 'os/types';
import { useAppState } from 'renderer/stores/app.store';
import { MainIPC } from 'renderer/stores/ipc';
import styled from 'styled-components';

import { SettingControl } from '../components/SettingControl';
import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';
// import { useShipStore } from 'renderer/stores/ship.store';

const colorMap: Record<MediaAccessStatus, string> = {
  granted: '#39a839',
  denied: '#ae2828',
  'not-determined': '#ae2828',
  restricted: '#ae2828',
  unknown: '#ae2828',
};

const StatusIndicator = styled.div<{ isSubscribed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isSubscribed }) =>
    isSubscribed ? '#38CD7C' : '#EA2424'};
`;

const SystemPanelPresenter = () => {
  const { shellStore } = useAppState();
  // const { bazaarStore, friends, spacesStore, bulletinStore } = useShipStore();

  const [mediaStatus, setMediaStatus] = useState<MediaAccess>({
    camera: 'unknown',
    mic: 'unknown',
  });

  useEffect(() => {
    MainIPC.getMediaStatus().then(setMediaStatus);
  }, []);

  const apps: any = [
    // {
    //   name: '%spaces',
    //   path: '/updates',
    //   subscriptionState: spaces.subscriptionState,
    //   subscribing: () => spaces.setSubscriptionStatus('subscribing'),
    // },
    // {
    //   name: '%bazaar',
    //   path: '/updates',
    //   subscriptionState: bazaar.subscriptionState,
    //   subscribing: () => bazaar.setSubscriptionStatus('subscribing'),
    // },
    // {
    //   name: '%bulletin',
    //   path: '/ui',
    //   subscriptionState: bulletin.subscriptionState,
    //   subscribing: () => bulletin.setSubscriptionStatus('subscribing'),
    // },
    // {
    //   name: '%friends',
    //   path: '/all',
    //   subscriptionState: friends.subscriptionState,
    //   subscribing: () => friends.setSubscriptionStatus('subscribing'),
    // },
  ];

  const resubscribe = async (appName: string) => {
    const app = apps.find((a: any) => a.name === appName);
    if (app) app.subscribing();
    // await OSActions.resubscribe(appName);
  };

  const isSubscribing = apps.some(
    (a: any) => a.subscriptionState === 'subscribing'
  );

  return (
    <SettingPane>
      <SettingTitle title="System" />
      <SettingSection title="Interface">
        <SettingControl label="Isolation Mode">
          <CheckBox
            label="Prevents the native OS from causing edge events and notifications."
            isChecked={shellStore.isIsolationMode}
            onChange={shellStore.toggleIsolationMode}
          />
        </SettingControl>
      </SettingSection>
      <SettingSection title="Permissions">
        <SettingControl inline label="Microphone">
          <Flex justifyContent="space-between" alignItems="center" flex={2}>
            {mediaStatus.camera === 'granted' ? (
              <Text.Custom
                fontSize={2}
                opacity={0.7}
                flexDirection="row"
                alignItems="center"
                style={{
                  color: colorMap[mediaStatus.mic] || 'inherit',
                }}
              >
                {mediaStatus.mic}
              </Text.Custom>
            ) : (
              <Button.TextButton
                style={{ fontWeight: 400 }}
                color="accent"
                disabled={mediaStatus.mic === 'granted'}
                onClick={() => {
                  MainIPC.askForMicrophone().then((status) => {
                    setMediaStatus({ ...mediaStatus, mic: status });
                  });
                }}
              >
                Grant
              </Button.TextButton>
            )}
          </Flex>
        </SettingControl>
        <SettingControl inline label="Camera">
          <Flex justifyContent="flex-start" flex={2}>
            {mediaStatus.camera === 'granted' ? (
              <Text.Custom
                fontSize={2}
                opacity={0.7}
                flexDirection="row"
                alignItems="center"
                style={{
                  color: colorMap[mediaStatus.mic] || 'inherit',
                }}
              >
                {mediaStatus.camera}
              </Text.Custom>
            ) : (
              <Button.TextButton
                style={{ fontWeight: 400 }}
                color="accent"
                // disabled={mediaStatus.camera === 'granted'}
                onClick={() => {
                  MainIPC.askForCamera().then((status) => {
                    setMediaStatus({ ...mediaStatus, camera: status });
                  });
                }}
              >
                Grant
              </Button.TextButton>
            )}
          </Flex>
        </SettingControl>
      </SettingSection>
      <SettingSection title="Subscriptions">
        TODO
        {apps.map((app: any) => (
          <Flex
            key={app.name}
            flexDirection="row"
            alignItems="center"
            height={24}
            gap={12}
          >
            <StatusIndicator
              isSubscribed={app.subscriptionState === 'subscribed'}
            />
            <Text.Custom fontWeight={500} width={100}>
              {app.name}
            </Text.Custom>
            <Text.Custom fontSize={2} opacity={0.7} flex={1}>
              {app.path}
            </Text.Custom>
            {app.subscriptionState === 'unsubscribed' && (
              <Button.TextButton
                style={{ fontWeight: 600 }}
                disabled={isSubscribing}
                onClick={() => resubscribe(app.name)}
              >
                Reconnect
              </Button.TextButton>
            )}
            {app.subscriptionState === 'subscribing' && <Spinner size={0} />}
          </Flex>
        ))}
      </SettingSection>
      {/* <SettingSection title="Mouse">
        <SettingControl label="Cursor type">
          <RadioGroup
            selected={mouseOption}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Realm', value: 'realm' },
            ]}
            onClick={(value: mouseOptionType) => {
              setMouseOption(value);
            }}
          />
        </SettingControl>
      </SettingSection> */}
      <SettingSection title="Sounds">
        <Text.Custom fontSize={2}>Coming Soon</Text.Custom>
      </SettingSection>
    </SettingPane>
  );
};

export const SystemPanel = observer(SystemPanelPresenter);
