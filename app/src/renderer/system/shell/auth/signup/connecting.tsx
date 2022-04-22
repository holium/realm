import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Grid, Spinner, Text } from '../../../../components';

type AddShipProps = {
  hasShips?: boolean;
};

export const ConnectingShip: FC<AddShipProps> = observer(
  (props: AddShipProps) => {
    // const { shipStore } = useMst();
    const { hasShips } = props;
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
