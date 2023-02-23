import { useState } from 'react';
import { observer } from 'mobx-react';

import { ActionButton, Icons, Spinner } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { trackEvent } from 'renderer/logic/lib/track';
import { Avatar, Flex, Text, Button, Box, Icon } from '@holium/design-system';
import { ShipActions } from 'renderer/logic/actions/ship';

const InstallAgentPresenter = () => {
  const { onboarding } = useServices();
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  if (!onboarding.ship) return null;

  const shipName = onboarding.ship.patp;
  const shipNick = onboarding.ship.nickname;
  const shipColor = onboarding.ship.color!;
  const avatar = onboarding.ship.avatar;

  const installRealm = () => {
    trackEvent('CLICK_INSTALL_REALM', 'ONBOARDING_SCREEN');
    setInstalling(true);
    OnboardingActions.installRealm().finally(() => {
      setInstalling(false);
      if (!onboarding.ship) {
        throw new Error('Ship not set, please restart onboarding.');
      }
      ShipActions.saveMyContact({
        patp: onboarding.ship.patp,
        color: onboarding.ship.color,
        nickname: onboarding.ship.nickname,
        avatar: onboarding.ship.avatar,
      });
      setIsError(onboarding.installer.state === 'error');
      setIsInstalled(onboarding.installer.state === 'loaded');
    });
  };

  return (
    <Flex flexDirection="column" width="100%">
      <Text.Custom fontSize={4} mb={1}>
        Installation
      </Text.Custom>

      <Text.Custom
        fontSize={2}
        fontWeight={200}
        lineHeight="20px"
        variant="body"
        opacity={0.6}
        mb={4}
      >
        We need to install Realm and other agents on your Urbit server. These
        handle core OS functionality.
      </Text.Custom>
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Avatar
          simple={false}
          size={52}
          avatar={avatar}
          patp={shipName}
          borderRadiusOverride="6px"
          sigilColor={[shipColor, 'white']}
        />
        <Flex
          style={{ width: 210 }}
          transition={{ duration: 0.15 }}
          animate={{ marginBottom: shipNick ? 24 : 0 }}
          position="relative"
          mt={3}
          alignItems="center"
          flexDirection="column"
        >
          {shipNick && (
            <Text.Custom position="absolute" fontWeight={500}>
              {shipNick}
            </Text.Custom>
          )}
          <Text.Custom
            transition={{ duration: 0, y: { duration: 0 } }}
            animate={{
              opacity: shipNick ? 0.5 : 1,
              y: shipNick ? 22 : 0,
            }}
          >
            {shipName}
          </Text.Custom>
        </Flex>
        <Flex flexDirection="column" alignItems="center">
          <ActionButton
            tabIndex={-1}
            mt={5}
            height={32}
            style={{ width: 200 }}
            rightContent={
              onboarding.installer.isLoading ? (
                <Spinner size={0} />
              ) : isInstalled ? (
                <Icon ml={2} size={20} name="CheckCircle" />
              ) : (
                <Icon ml={2} size={20} name="DownloadCircle" />
              )
            }
            onClick={installRealm}
          >
            Install Realm
          </ActionButton>
          <Text.Custom
            fontSize={2}
            lineHeight="20px"
            variant="body"
            opacity={0.6}
            mt={3}
            fontWeight={isError ? 500 : 200}
            color={isError ? 'intent-alert' : undefined}
          >
            {isError && onboarding.installer.errorMessage}
            {!isInstalled && !isError && 'This will just take a minute'}
            {isInstalled &&
              !isError &&
              'Congrats! You are ready to enter a new world.'}
          </Text.Custom>
        </Flex>
      </Flex>
      <Box position="absolute" bottom={24} right={24}>
        <Button.TextButton
          py={1}
          showOnHover
          fontWeight={500}
          style={{ minWidth: 45 }}
          disabled={!isInstalled || installing}
          onClick={async (_evt: any) => {
            setLoading(true);
            OnboardingActions.completeOnboarding()
              .then(() => {
                setLoading(false);
              })
              .catch((err) => {
                console.error(err);
                setLoading(false);
              });
          }}
        >
          {loading ? <Spinner size={0} /> : 'Next'}
        </Button.TextButton>
      </Box>
    </Flex>
  );
};

export const InstallAgent = observer(InstallAgentPresenter);
