import { Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

type Props = {
  email: string;
  password: string;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
};

export const AccountLoginSection = ({
  email,
  password,
  onChangeEmail,
  onChangePassword,
}: Props) => (
  <Flex flexDirection="column" gap="16px">
    <Text.Body>
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
