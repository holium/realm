import React, { FC, useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Box, Sigil, Grid, Text, Flex, Icons, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { HostingPlanet } from 'os/api/holium';

interface SelectPlanProps extends BaseDialogProps {
  patp: string
}

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const HostingConfirmation: FC<SelectPlanProps> = observer(
  (props: SelectPlanProps) => {
    let [ loading, setLoading ] = useState(true);
    let [ message, setMessage ] = useState('Booting planet...')
    let { onboarding } = useServices();
    let planet = onboarding.planet!;

    useInterval(() => {
      OnboardingActions.getHostedShip()
        .then((ship) => {
          if (ship && ship.code) {
            setLoading(false)
            setMessage(`Planet ready, welcome to the network`)
          } else {
            console.log('still loading...', ship)
          }
        })
        .catch((reason) => {
          setLoading(false)
          setMessage(`Something went wrong :(`)
          console.error(reason)
        })
    }, 5000)

    // TODO fix hardcoded colors once shell.theme is available pre-login
    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="space-around">
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Box height={48} width={48} mb={12}>
              <Sigil color={['black', 'white']} simple={false} size={48} patp={planet.patp!} />
            </Box>
            <Text> { planet.patp! } </Text>
          </Flex>
          <Box>
            <Button isLoading={loading} disabled={true}>
              {message}
            </Button>
          </Box>
        </Flex>
      </Grid.Column>
    )
  }
);

export default HostingConfirmation;
