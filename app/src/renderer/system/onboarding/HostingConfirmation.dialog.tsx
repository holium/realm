import { FC, useEffect, useState, useRef } from 'react';
import { Box, Sigil, Grid, Text, Flex, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';

interface SelectPlanProps extends BaseDialogProps {
  patp: string;
}

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      // @ts-expect-error
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const HostingConfirmation: FC<SelectPlanProps> = observer(
  (props: SelectPlanProps) => {
    const [loading, setLoading] = useState(true);
    const { onboarding } = useServices();
    const planet = onboarding.planet!;

    useInterval(() => {
      OnboardingActions.checkShipBooted()
        .then((booted: boolean) => {
          if (booted) {
            setLoading(false);
            props.onNext && props.onNext();
          } else {
            console.log('still loading...');
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
              <Sigil
                color={['black', 'white']}
                simple={false}
                size={48}
                patp={planet.patp}
              />
            </Box>
            <Text> {planet.patp} </Text>
          </Flex>
          {loading ? (
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
