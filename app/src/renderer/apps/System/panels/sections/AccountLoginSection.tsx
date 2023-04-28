import { useState } from 'react';

import { Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { OnboardingStorage } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';

import { SettingSection } from '../../components/SettingSection';

type AccountLoginSectionBodyProps = {
  email: string;
  password: string;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
};

const AccountLoginSectionBody = ({
  email,
  password,
  onChangeEmail,
  onChangePassword,
}: AccountLoginSectionBodyProps) => (
  <Flex flexDirection="column" gap="16px">
    <Text.Body opacity={0.7} mb="16px">
      Please authenticate your Realm account to configure hosting.
    </Text.Body>
    <Flex flexDirection="column" gap={2}>
      <Text.Label as="label" htmlFor="login-email">
        Email
      </Text.Label>
      <TextInput
        height="38px"
        id="login-prompt-email"
        name="login-prompt-email"
        type="email"
        placeholder="email@host.com"
        value={email}
        onChange={(event) =>
          onChangeEmail((event.target as HTMLInputElement).value)
        }
      />
    </Flex>
    <Flex flexDirection="column" gap={2}>
      <Text.Label as="label" htmlFor="login-password">
        Password
      </Text.Label>
      <TextInput
        height="38px"
        id="login-prompt-password"
        name="login-prompt-password"
        type="password"
        placeholder="• • • • • • • •"
        value={password}
        onChange={(event) =>
          onChangePassword((event.target as HTMLInputElement).value)
        }
      />
    </Flex>
  </Flex>
);

type AccountLoginSectionProps = {
  prefilledEmail: string | null;
  onLogin: () => void;
};

export const AccountLoginSection = ({
  prefilledEmail,
  onLogin,
}: AccountLoginSectionProps) => {
  const [email, setEmail] = useState(prefilledEmail ?? '');
  const [password, setPassword] = useState('');

  const handleOnLogin = async () => {
    const response = await thirdEarthApi.login(email, password, true);

    if (
      !response.token ||
      !response.email ||
      !response.client_side_encryption_key
    ) {
      return false;
    } else {
      OnboardingStorage.set({
        email: response.email,
        clientSideEncryptionKey: response.client_side_encryption_key,
        token: response.token,
      });
      onLogin();
    }

    return true;
  };

  return (
    <SettingSection
      title="Sign in"
      body={
        <AccountLoginSectionBody
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
        />
      }
      onSubmit={handleOnLogin}
    />
  );
};
