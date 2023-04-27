import { useEffect, useState } from 'react';

import {
  Anchor,
  Button,
  CopyButton,
  Flex,
  Icon,
  Spinner,
  Text,
  TextInput,
  useToggle,
} from '@holium/design-system';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';
import { AccountModelSnapshot } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: AccountModelSnapshot;
};

export const AccountHostingSection = ({}: Props) => {
  const { shellStore } = useAppState();
  const { setActiveApp } = useTrayApps();

  const showAccessKey = useToggle(false);

  // TODO
  // const url = identity.auth.currentship.url;
  const url = '';
  const isHostedShip = url?.includes('holium.network');
  // const email = identity.auth.email;
  const email = '';
  const [code, _setCode] = useState('');

  useEffect(() => {
    async function getCode() {
      // const code = await AuthActions.getCode();
      // setCode(code);
    }
    getCode();
  }, []);

  return (
    <SettingSection
      title="Hosting"
      body={
        <>
          <Flex flexDirection={'row'} flex={4} justifyContent="flex-start">
            <Text.Custom fontWeight={500} flex={1} margin={'auto'}>
              Email
            </Text.Custom>
            <Flex justifyContent="space-between" flex={3}>
              <Text.Custom>{email}</Text.Custom>
              <Button.TextButton
                style={{ fontWeight: 400 }}
                onClick={() => {
                  shellStore.setIsBlurred(true);
                  shellStore.openDialog('change-email-dialog');
                  setActiveApp(null);
                }}
              >
                Change Email
              </Button.TextButton>
            </Flex>
          </Flex>

          {isHostedShip && (
            <>
              <Flex
                flexDirection={'row'}
                flex={4}
                mt={4}
                justifyContent="flex-start"
              >
                <Text.Custom fontWeight={500} flex={1} margin={'auto'}>
                  Payment
                </Text.Custom>
                <Flex justifyContent="space-between" flex={3}>
                  <Text.Custom>Credit Card</Text.Custom>
                  <Anchor href="https://billing.stripe.com/p/login/00g4gz19T9WbfxS4gg">
                    <Button.TextButton style={{ fontWeight: 400 }}>
                      Manage billing
                    </Button.TextButton>
                  </Anchor>
                </Flex>
              </Flex>
            </>
          )}

          <Flex
            flexDirection={'row'}
            flex={4}
            mt={4}
            justifyContent="flex-start"
          >
            <Text.Custom fontWeight={500} flex={1} margin={'auto'}>
              URL
            </Text.Custom>
            <Text.Custom flex={3}>{url}</Text.Custom>
          </Flex>

          <Flex
            flexDirection={'row'}
            flex={4}
            mt={4}
            justifyContent="flex-start"
          >
            <Text.Custom fontWeight={500} flex={1} margin={'auto'}>
              Access Code
            </Text.Custom>
            {code === '' ? (
              <Flex flex={3}>
                <Spinner size={1} />
              </Flex>
            ) : (
              <Flex flex={3} gap={6} alignItems="center">
                <TextInput
                  id="system-account-access-code"
                  name="access-code"
                  py={2}
                  width={285}
                  value={code}
                  readOnly={true}
                  type={showAccessKey.isOn ? 'text' : 'password'}
                  rightAdornment={
                    <Button.IconButton onClick={showAccessKey.toggle}>
                      <Icon
                        name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                        opacity={0.5}
                        size={18}
                      />
                    </Button.IconButton>
                  }
                />
                <CopyButton content={code} />
              </Flex>
            )}
          </Flex>
        </>
      }
    />
  );
};
