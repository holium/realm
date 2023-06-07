import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Button, CheckBox, Flex, Text } from '@holium/design-system';

import { MediaAccess, MediaAccessStatus } from 'os/types';
import { MainIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { SettingControl } from '../components/SettingControl';
import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';
import { SystemMouseSection } from './sections/SystemMouseSection/SystemMouseSection';
// import { useShipStore } from 'renderer/stores/ship.store';

const colorMap: Record<MediaAccessStatus, string> = {
  granted: '#39a839',
  denied: '#ae2828',
  'not-determined': '#ae2828',
  restricted: '#ae2828',
  unknown: '#ae2828',
};

// const StatusIndicator = styled.div<{ isSubscribed: boolean }>`
//   width: 8px;
//   height: 8px;
//   border-radius: 50%;
//   background-color: ${({ isSubscribed }) =>
//     isSubscribed ? '#38CD7C' : '#EA2424'};
// `;

const SystemPanelPresenter = () => {
  const { settingsStore } = useShipStore();
  // const { bazaarStore, friends, spacesStore, bulletinStore } = useShipStore();

  const [mediaStatus, setMediaStatus] = useState<MediaAccess>({
    camera: 'unknown',
    mic: 'unknown',
  });

  useEffect(() => {
    MainIPC.getMediaStatus().then(setMediaStatus);
  }, []);

  // const apps: any = [
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
  // ];

  // const resubscribe = async (appName: string) => {
  //   const app = apps.find((a: any) => a.name === appName);
  //   if (app) app.subscribing();
  //   // await OSActions.resubscribe(appName);
  // };

  // const isSubscribing = apps.some(
  //   (a: any) => a.subscriptionState === 'subscribing'
  // );

  return (
    <SettingPane>
      <SettingTitle title="System" />
      <SettingSection
        title="Interface"
        body={
          <SettingControl label="Isolation Mode">
            <CheckBox
              label="Prevents the native OS from causing edge events and notifications."
              isChecked={settingsStore.isolationModeEnabled}
              onChange={settingsStore.toggleIsolationMode}
            />
          </SettingControl>
        }
      />
      <SystemMouseSection
        realmCursorEnabled={settingsStore.realmCursorEnabled}
        setRealmCursor={settingsStore.setRealmCursor}
        profileColorForCursorEnabled={
          settingsStore.profileColorForCursorEnabled
        }
        setProfileColorForCursor={settingsStore.setProfileColorForCursor}
      />
      <SettingSection
        title="Permissions"
        body={
          <>
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
          </>
        }
      />
      {/* <SettingSection
        title="Subscriptions"
        body={
          <>
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
                {app.subscriptionState === 'subscribing' && (
                  <Spinner size={0} />
                )}
              </Flex>
            ))}
          </>
        }
      /> */}
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
      {/* <SettingSection
        title="Sounds"
        body={<Text.Custom fontSize={2}>Coming Soon</Text.Custom>}
      /> */}
    </SettingPane>
  );
};

export const SystemPanel = observer(SystemPanelPresenter);
