import { observer } from 'mobx-react';
import { ActionButton, Spinner } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { trackEvent } from 'renderer/logic/lib/track';
import { Avatar, Flex, Text, Button, Box, Icon } from '@holium/design-system';
import { useToggle } from 'renderer/logic/lib/useToggle';

const InstallAgentPresenter = () => {
  const { onboarding } = useServices();

  const loading = useToggle(false);
  const installing = useToggle(false);
  const error = useToggle(false);
  const installed = useToggle(false);

  if (!onboarding.ship || !onboarding.installer) return null;

  const shipName = onboarding.ship.patp;
  const shipNick = onboarding.ship.nickname;
  const shipColor = onboarding.ship.color!;
  const avatar = onboarding.ship.avatar;

  const installRealm = () => {
    installing.toggleOn();
    error.toggleOff();
    trackEvent('CLICK_INSTALL_REALM', 'ONBOARDING_SCREEN');

    OnboardingActions.installRealm()
      .catch(error.toggleOn)
      .finally(() => {
        if (onboarding.installer.state === 'error') {
          error.toggleOn();
        } else if (onboarding.installer.state === 'loaded') {
          installed.toggleOn();
        }

        installing.toggleOff();
      });
  };

  const getBody = () => {
    if (error.isOn) {
      return onboarding.installer.errorMessage ?? 'Something went wrong';
    } else {
      if (installed.isOn) {
        return 'Congrats! You are ready to enter a new world.';
      } else {
        return 'This will take a minute.';
      }
    }
  };

  const onClickNext = () => {
    loading.toggleOn();

    OnboardingActions.completeOnboarding()
      .catch(console.error)
      .finally(loading.toggleOff);
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
            <Text.Custom
              textAlign="center"
              position="absolute"
              fontWeight={500}
            >
              {shipNick}
            </Text.Custom>
          )}
          <Text.Custom
            textAlign="center"
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
              ) : installed.isOn ? (
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
            fontWeight={error.isOn ? 500 : 400}
            color={error.isOn ? 'intent-alert' : undefined}
          >
            {getBody()}
          </Text.Custom>
        </Flex>
      </Flex>
      <Box position="absolute" bottom={24} right={24}>
        <Button.TextButton
          py={1}
          showOnHover
          justifyContent="center"
          alignItems="center"
          fontWeight={500}
          style={{ minWidth: 45 }}
          disabled={
            loading.isOn || error.isOn || installing.isOn || !installed.isOn
          }
          onClick={onClickNext}
        >
          {loading.isOn ? <Spinner size={0} /> : 'Next'}
        </Button.TextButton>
      </Box>
    </Flex>
  );
};

export const InstallAgent = observer(InstallAgentPresenter);
