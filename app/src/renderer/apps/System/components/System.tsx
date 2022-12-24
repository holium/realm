import { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Flex, Text, Card, TextButton } from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { RealmActions } from 'renderer/logic/actions/main';
import { OSActions } from 'renderer/logic/actions/os';

export type MediaAccessStatus =
  | 'not-determined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unknown';

const colorMap: any = {
  granted: '#39a839',
  denied: '#ae2828',
  isSubscribed: '#38CD7C',
  disconnected: '#EA2424',
};

const StatusIndicator = styled.div<{ isSubscribed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isSubscribed }) =>
    isSubscribed ? colorMap.isSubscribed : colorMap.disconnected};
`;

export const SystemPanel = observer(() => {
  const { theme, courier, bazaar, bulletin, friends, spaces } = useServices();
  const { windowColor, accentColor } = theme.currentTheme;

  const [mediaStatus, setMediaStatus] = useState<{
    camera: MediaAccessStatus;
    mic: MediaAccessStatus;
  }>({ camera: 'unknown', mic: 'unknown' });

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  type mouseOptionType = 'system' | 'realm';
  useEffect(() => {
    RealmActions.getMediaStatus().then((status) => {
      setMediaStatus(status);
    });
  }, []);

  const [mouseOption, setMouseOption] = useState<mouseOptionType>('realm');

  const subscriptions = [
    {
      name: '%spaces',
      path: '/updates',
      subscriptionState: spaces.subscriptionState,
    },
    {
      name: '%bazaar',
      path: '/updates',
      subscriptionState: bazaar.subscriptionState,
    },
    {
      name: '%courier',
      path: '/updates',
      subscriptionState: courier.subscriptionState,
    },
    {
      name: '%bulletin',
      path: '/ui',
      subscriptionState: bulletin.subscriptionState,
    },
    {
      name: '%friends',
      path: '/all',
      subscriptionState: friends.subscriptionState,
    },
  ];

  return (
    <Flex gap={12} flexDirection="column" p="12px" width="100%">
      <Text fontSize={7} fontWeight={600} mb={6}>
        System
      </Text>

      <Text opacity={0.7} fontSize={3} fontWeight={500}>
        INTERFACE
      </Text>
      <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text>Coming Soon</Text>
      </Card>

      <Text opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        PERMISSIONS
      </Text>
      <Card
        p="20px"
        width="100%"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Flex flexDirection="column" gap={12}>
          <Flex flexDirection="row" flex={4} justifyContent="flex-start">
            <Text fontWeight={500} flex={2} margin={'auto'}>
              Microphone
            </Text>
            <Flex justifyContent="space-between" alignItems="center" flex={2}>
              {mediaStatus.camera === 'granted' ? (
                <Text
                  fontSize={2}
                  opacity={0.7}
                  flexDirection="row"
                  alignItems="center"
                  color={colorMap[mediaStatus.mic] || 'inherit'}
                >
                  {mediaStatus.mic}
                </Text>
              ) : (
                <TextButton
                  style={{ fontWeight: 400 }}
                  showBackground
                  textColor={accentColor}
                  highlightColor={accentColor}
                  disabled={mediaStatus.mic === 'granted'}
                  onClick={() => {
                    RealmActions.askForMicrophone().then(
                      (status: MediaAccessStatus) => {
                        setMediaStatus({ ...mediaStatus, mic: status });
                      }
                    );
                  }}
                >
                  Grant
                </TextButton>
              )}
            </Flex>
          </Flex>
          <Flex
            flexDirection="row"
            flex={4}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Text fontWeight={500} flex={2} margin={'auto'}>
              Camera
            </Text>
            <Flex justifyContent="flex-start" flex={2}>
              {mediaStatus.camera === 'granted' ? (
                <Text
                  fontSize={2}
                  opacity={0.7}
                  flexDirection="row"
                  alignItems="center"
                  color={colorMap[mediaStatus.camera] || 'inherit'}
                >
                  {mediaStatus.camera}
                </Text>
              ) : (
                <TextButton
                  style={{ fontWeight: 400 }}
                  showBackground
                  textColor={accentColor}
                  highlightColor={accentColor}
                  // disabled={mediaStatus.camera === 'granted'}
                  onClick={() => {
                    RealmActions.askForCamera().then(
                      (status: MediaAccessStatus) => {
                        setMediaStatus({ ...mediaStatus, camera: status });
                      }
                    );
                  }}
                >
                  Grant
                </TextButton>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Card>

      <Text opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        SUBSCRIPTIONS
      </Text>
      <Card
        p="20px"
        width="100%"
        gap={16}
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        {subscriptions.map((sub) => (
          <Flex
            key={sub.name}
            flexDirection="row"
            alignItems="center"
            height={24}
            gap={12}
          >
            <StatusIndicator
              isSubscribed={sub.subscriptionState === 'subscribed'}
            />
            <Text fontWeight={500} width={100}>
              {sub.name}
            </Text>
            <Text fontSize={2} opacity={0.7} flex={1}>
              {sub.path}
            </Text>
            {sub.subscriptionState === 'unsubscribed' && (
              <TextButton
                style={{ fontWeight: 600 }}
                onClick={OSActions.reconnect}
              >
                Reconnect
              </TextButton>
            )}
          </Flex>
        ))}
      </Card>

      <Text opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
        SOUNDS
      </Text>
      <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text>Coming Soon</Text>
      </Card>

      {/* 
    <Text opacity={0.7} fontSize={3} fontWeight={500}>
      MOUSE
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Text mb={4}>
          Cursor Type:
        </Text>
        <Flex >
            <RadioGroup
                customBg={windowColor}
                textColor={textColor}
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
          <Text>Use profile color for cursor</Text>
        </Flex>

    </Card>
    <Text opacity={0.7} fontSize={3} fontWeight={500} mt={2}>
      SOUNDS
    </Text>
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
        <Text>Disable OS System Sounds</Text>
          <Text fontWeight='200'>These sounds play on login, logout, etc.</Text>
          </Flex>
        </Flex>
    </Card> */}
    </Flex>
  );
});
