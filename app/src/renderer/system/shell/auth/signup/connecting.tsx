import { FC } from 'react';
import { observer } from 'mobx-react';
import {
  Icons,
  Card,
  Flex,
  Grid,
  Spinner,
  Text,
  ActionButton,
  Input,
  Label,
  FormControl,
  IconButton,
  TextButton,
  Box,
} from '../../../../components';
import UrbitSVG from '../../../../../../assets/urbit.svg';

type AddShipProps = {
  hasShips?: boolean;
};

export const ConnectingShip: FC<AddShipProps> = observer(
  (props: AddShipProps) => {
    // const { shipStore } = useMst();
    const { hasShips } = props;
    return (
      <Grid.Column noGutter lg={7} xl={7}>
        <Grid.Column noGutter gap={12}>
          {/* {!hasShips && (
            <>
              <Text variant="h5" fontWeight="extralight">
                You will need an Urbit ID to start
              </Text>
              <ActionButton
                height={32}
                rightContent={<Icons size={1} name="ArrowRightLine" />}
              >
                Get one
              </ActionButton>
            </>
          )} */}

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
                Initializing
              </Text>
            </Flex>
          </Grid.Column>
        </Grid.Column>
      </Grid.Column>
    );
  }
);

export default ConnectingShip;
