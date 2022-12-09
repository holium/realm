import { FC, useEffect, useState } from 'react';
import {
  Box,
  Sigil,
  Grid,
  Text,
  Flex,
  AccessCode,
  Spinner,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';

interface ViewCodeProps extends BaseDialogProps {
  patp: string;
}

const ViewCode: FC<ViewCodeProps> = observer((props: ViewCodeProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [accessCode, setAccessCode] = useState('');
  const { onboarding } = useServices();
  const planet = onboarding.planet!;

  const sigilColors: [string, string] =
    theme.currentTheme.mode === 'light'
      ? ['black', 'white']
      : ['white', 'black'];

  useEffect(() => {
    async function getAccessCode() {
      const code = await OnboardingActions.getShipCode();
      setAccessCode(code);
    }
    getAccessCode();
  }, []);

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
              color={sigilColors}
              simple={false}
              size={48}
              patp={planet.patp}
            />
          </Box>
          <Text mt={2}> Your ship is ready! </Text>
        </Flex>
        {accessCode === '' ? (
          <>
            <Spinner size={2} />
          </>
        ) : (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Text variant="body" width="80%" mb={8}>
              Outside of Realm, you'll need this access code to log into your
              Urbit. We recommend you write it down now.
            </Text>
            <AccessCode code={accessCode} />
          </Flex>
        )}
      </Flex>
    </Grid.Column>
  );
});

export default ViewCode;
