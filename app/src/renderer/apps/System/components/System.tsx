import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { lighten } from 'polished';
import {
  Text,
  Card,
  Button,
  CheckBox,
  Flex,
  Spinner,
} from '@holium/design-system';
import { MediaAccess, MediaAccessStatus } from 'os/types';
import { MainIPC } from 'renderer/stores/ipc';
import { useAppState } from 'renderer/stores/app.store';
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
  const { theme, shellStore } = useAppState();
  // const { bazaarStore, friends, spacesStore, bulletinStore } = useShipStore();
  const { windowColor } = theme;

  const [mediaStatus, setMediaStatus] = useState<MediaAccess>({
    camera: 'unknown',
    mic: 'unknown',
  });

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

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
    <Flex gap={12} flexDirection="column" p={3} width="100%" overflowY="auto">
      <Text.Custom fontSize={7} fontWeight={600} mb={2}>
        System
      </Text.Custom>
      <Text.Custom opacity={0.7} fontSize={3} fontWeight={500}>
        INTERFACE
      </Text.Custom>
      <Card elevation={1} p="20px" width="100%" customBg={cardColor}>
        <CheckBox
          title="Isolation Mode"
          label="Prevents the native OS from causing edge events and notifications."
          isChecked={shellStore.isIsolationMode}
          onChange={shellStore.toggleIsolationMode}
        />
      </Card>
      <Text.Custom opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        PERMISSIONS
      </Text.Custom>
      <Card
        p="20px"
        width="100%"
        elevation={1}
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Flex flexDirection="column" gap={12}>
          <Flex flexDirection="row" flex={4} justifyContent="flex-start">
            <Text.Custom fontSize={2} fontWeight={500} flex={2} margin={'auto'}>
              Microphone
            </Text.Custom>
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
          </Flex>
          <Flex
            flexDirection="row"
            flex={4}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Text.Custom fontSize={2} fontWeight={500} flex={2} margin={'auto'}>
              Camera
            </Text.Custom>
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
          </Flex>
        </Flex>
      </Card>

      <Text.Custom opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        SUBSCRIPTIONS
      </Text.Custom>
      <Card
        p="20px"
        width="100%"
        gap={16}
        elevation={1}
        customBg={cardColor}
        flexDirection={'column'}
      >
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
      </Card>

      <Text.Custom opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        SOUNDS
      </Text.Custom>
      <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation={1}
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text.Custom>Coming Soon</Text.Custom>
      </Card>

      {/* 
    <Text.Custom opacity={0.7} fontSize={3} fontWeight={500}>
      MOUSE
    </Text.Custom>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text.Custom mb={4}>
          Cursor Type:
        </Text.Custom>
        <Flex >
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
              
          </Flex>
        <Flex mt={6} gap={6} justifyContent="flex-start">
          <Checkbox defaultValue='' mr={16}
            // TODO default value doesnt work
            // there appears to be no way to set an initial value to the checkbox component
          />
          <Text.Custom>Use profile color for cursor</Text.Custom>
        </Flex>

    </Card>
    <Text.Custom opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
      SOUNDS
    </Text.Custom>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
       <Flex mt={2} justifyContent="flex-start">
          <Checkbox mr={16} defaultValue="false" />
          <Flex flexDirection='column' justifyContent='center' gap={4}>
        <Text.Custom>Disable OS System Sounds</Text.Custom>
          <Text.Custom fontWeight='200'>These sounds play on login, logout, etc.</Text.Custom>
          </Flex>
        </Flex>
    </Card> */}
    </Flex>
  );
};

export const SystemPanel = observer(SystemPanelPresenter);
