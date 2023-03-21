import { useEffect, useState } from 'react';
import { Grid, Text, CopyButton } from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import {
  Avatar,
  Button,
  Box,
  Flex,
  Spinner,
  Icon,
  TextInput,
} from '@holium/design-system';
import { useToggle } from '@holium/shared';

const ViewCodePresenter = () => {
  const { theme } = useServices();
  const [accessCode, setAccessCode] = useState('');
  const { onboarding } = useServices();
  const planet = onboarding.planet;
  const showAccessCode = useToggle(false);

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
            <Avatar
              sigilColor={sigilColors}
              simple={false}
              size={48}
              patp={planet?.patp ?? ''}
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
            <Flex gap={6} alignItems="center">
              <TextInput
                id="system-account-access-code"
                name="access-code"
                width={285}
                py={2}
                value={accessCode}
                readOnly={true}
                type={showAccessCode.isOn ? 'text' : 'password'}
                rightAdornment={
                  <Button.IconButton onClick={showAccessCode.toggle}>
                    <Icon
                      name={showAccessCode.isOn ? 'EyeOff' : 'EyeOn'}
                      opacity={0.5}
                      size={18}
                    />
                  </Button.IconButton>
                }
              />
              <CopyButton content={accessCode} />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Grid.Column>
  );
};

export const ViewCode = observer(ViewCodePresenter);
