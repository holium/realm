import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Grid, Spinner, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

export const ConnectingShip: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();
    useEffect(() => {
      onboarding.ship &&
      OnboardingActions.getProfile().then(() => {
          props.onNext && props.onNext();
        });
    }, [onboarding.ship]);
    return (
      <Grid.Row expand noGutter>
        <Grid.Column mt={3} noGutter>
          <Flex
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Spinner
              display="flex"
              alignItems="center"
              justifyContent="center"
              size={3}
              color="brand.primary"
            />
            <Text mt={5} textAlign="center" variant="h5" fontWeight={200}>
              Loading
            </Text>
          </Flex>
        </Grid.Column>
      </Grid.Row>
    );
  }
);

export default ConnectingShip;
