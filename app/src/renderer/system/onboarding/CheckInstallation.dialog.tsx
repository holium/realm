import { FC, useEffect } from 'react';
import { Grid, Text, Spinner, Icons, Flex } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';

const CheckInstallationDialog: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();

    useEffect(() => {
      onboarding.installer.set('initial');
      OnboardingActions.preInstallSysCheck();
    }, []);

    useEffect(() => {
      props.setState!({
        ...props.workflowState!,
        versionVerified: onboarding.versionVerified,
      });
    }, [onboarding.versionVerified]);

    return (
      <Grid.Column noGutter lg={12} xl={12} px={16} pt={12}>
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={3} fontWeight={500} mb={20}>
            Checking System Version
          </Text>
          {['initial', 'loading'].indexOf(onboarding.installer.state) !== -1 ? (
            <Spinner size={1} />
          ) : onboarding.installer.state === 'loaded' ? (
            <Icons ml={2} size={3} name="CheckCircle" color="#008b00" />
          ) : (
            onboarding.installer.state === 'error' && (
              <Icons ml={2} size={3} name="Error" color="red" />
            )
          )}
          {['initial', 'loading'].indexOf(onboarding.installer.state) !== -1 ? (
            <Text mt={20}>
              Please wait while we determine the state of your ship...
            </Text>
          ) : onboarding.installer.state === 'loaded' ? (
            <Text mt={20}>System check complete. You're good to go.</Text>
          ) : (
            onboarding.installer.state === 'error' && (
              <>
                <Text mt={20}>Unable to complete onboarding</Text>
                <Text mt={20} textAlign="center">
                  Please OTA to download and install the latest Urbit system
                  updates.
                </Text>
              </>
            )
          )}
        </Flex>
      </Grid.Column>
    );
  }
);

export default CheckInstallationDialog;
