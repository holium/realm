import { useEffect } from 'react';
import { Text, Flex, Icon, Spinner } from '@holium/design-system';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';

const CheckInstallationDialogPresenter = (props: BaseDialogProps) => {
  const { onboarding } = useServices();

  const isChecking =
    ['initial', 'loading'].indexOf(onboarding.versionLoader.state) !== -1;

  useEffect(() => {
    onboarding.versionLoader.set('initial');
    OnboardingActions.preInstallSysCheck();
    return () => {
      onboarding.versionLoader.set('initial');
    };
  }, []);

  useEffect(() => {
    props.setState!({
      ...props.workflowState!,
      versionVerified: onboarding.versionVerified,
    });
  }, [onboarding.versionVerified]);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Text.Custom fontSize={4} mb={20}>
        Checking System Version
      </Text.Custom>
      {isChecking ? (
        <Spinner size={1} />
      ) : onboarding.versionLoader.state === 'loaded' ? (
        <Icon ml={2} size={24} name="CheckCircle" color="intent-success" />
      ) : (
        onboarding.versionLoader.state === 'error' && (
          <Icon ml={2} size={24} name="Error" color="intent-alert" />
        )
      )}
      {isChecking ? (
        <Text.Custom fontSize={2} fontWeight={200} opacity={0.6} mt={20}>
          Please wait while we determine the state of your ship...
        </Text.Custom>
      ) : onboarding.versionLoader.state === 'loaded' ? (
        <Text.Custom fontSize={2} fontWeight={200} opacity={0.6} mt={20}>
          System check complete. You're good to go.
        </Text.Custom>
      ) : (
        onboarding.versionLoader.state === 'error' && (
          <>
            <Text.Custom fontSize={2} fontWeight={200} mt={20}>
              Unable to complete onboarding
            </Text.Custom>
            <Text.Custom
              fontSize={2}
              fontWeight={200}
              mt={20}
              textAlign="center"
            >
              Please OTA to download and install the latest Urbit system
              updates.
            </Text.Custom>
          </>
        )
      )}
    </Flex>
  );
};

export const CheckInstallationDialog = observer(
  CheckInstallationDialogPresenter
);
