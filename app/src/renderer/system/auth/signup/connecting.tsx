import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Grid, Spinner, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store-2';
import { SignupApi } from 'renderer/logic/actions/signup';

type AddShipProps = {
  next: () => any;
};

export const ConnectingShip: FC<AddShipProps> = observer(
  (props: AddShipProps) => {
    const { identity } = useServices();
    const { signup } = identity;
    useEffect(() => {
      signup.signupShip &&
        SignupApi.getProfile(signup.signupShip.patp).then(() => {
          console.log('got profile');
          props.next();
        });
    }, [signup.signupShip]);
    // authStore.
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
