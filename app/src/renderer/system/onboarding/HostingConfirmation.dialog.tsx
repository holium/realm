import { FC, useEffect, useState, useRef } from 'react';
import { Box, Sigil, Grid, Text, Flex, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { Avatar } from '@holium/design-system';

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let intervalRef: NodeJS.Timer;
    function tick() {
      // @ts-expect-error
      savedCallback.current();
    }
    if (delay !== null) {
      intervalRef = setInterval(tick, delay);
    }
    return () => clearInterval(intervalRef);
  }, [delay]);
}

const ASSUME_ERROR_DURATION = 1000 * 60 * 30;

const HostingConfirmation: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const [loading, setLoading] = useState(true);
    const [startTime, _] = useState(Date.now());
    const [error, setError] = useState('');
    const { onboarding } = useServices();
    const planet = onboarding.planet!;

    useInterval(() => {
      OnboardingActions.checkShipBooted()
        .then((booted: boolean) => {
          if (booted) {
            setLoading(false);
            props.onNext && props.onNext();
          } else {
            const now = Date.now();
            if (now - startTime > ASSUME_ERROR_DURATION) {
              setError(
                'Something may have gone wrong, please contact support@holium.com'
              );
            }
          }
        })
        .catch((reason) => {
          setLoading(false);
          console.error(reason);
        });
    }, 5000);

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-around"
        >
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box height={48} width={48} mb={12}>
              <Avatar
                sigilColor={['black', 'white']}
                simple={false}
                size={48}
                patp={planet.patp}
              />
            </Box>
            <Text> {planet.patp} </Text>
          </Flex>
          {!error ? (
            <>
              <Box>
                <Text variant="body">
                  Your planet is booting...this may take a bit.
                </Text>
              </Box>
              <Box>
                <Button isLoading={loading} disabled={true}>
                  Booting planet...
                </Button>
              </Box>
            </>
          ) : (
            <Box>
              <Text variant="body" color="text.error">
                An error occured while booting your ship. Please contact
                support.
              </Text>
            </Box>
          )}
        </Flex>
      </Grid.Column>
    );
  }
);

export default HostingConfirmation;
